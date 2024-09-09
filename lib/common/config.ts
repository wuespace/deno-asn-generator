import { z } from "@collinhacks/zod";
import {
  type AdditionalManagedNamespace,
  deserializeAdditionalManagedNamespaces,
  getDB,
  isValidAdditionalManagedNamespace,
  zBoolString,
} from "$common/mod.ts";

/**
 * The application configuration.
 */
export interface Config {
  /**
   * The port the server should listen on.
   * @default 8080
   */
  PORT: number;

  /**
   * The prefix for generated ASNs.
   * Can only contain uppercase letters A-Z. Must be at least 1 character long. Max length is 10.
   *
   * The prefix must not change after the first run.
   * @example "ASN"
   */
  ASN_PREFIX: string;

  /**
   * The range of the ASN namespace part. For example, if it's 600, the range for generated ASNs would be 100 - 599.
   * 600 - 999 would then be reserved for user defined namespaces (e.g., manually pre-printed ASNs).
   *
   * The number of digits must not change after the first run.
   *
   * @see For more information on the namespacing, take a look at {@link generateASN} or the `README.md`.
   */
  ASN_NAMESPACE_RANGE: number;

  /**
   * Whether to enable the namespace extension feature.
   *
   * If `false` this is set to, no namespaces can have a different number of digits than the default range
   * specified by {@link ASN_NAMESPACE_RANGE}.
   *
   * If `true`, a leading `9` will extend the namespace by a digit. This can be chained.
   *
   * For example, if the default range is 60, without the extension, the additional namespaces could be 6X-9X.
   * With the extension, you could have 6X-8X, but also 90X-98X, 990X-998X, etc.
   *
   * Default is `false`.
   */
  ASN_ENABLE_NAMESPACE_EXTENSION: boolean;

  /**
   * Additional managed namespaces outside the {@link ASN_NAMESPACE_RANGE} for which ASNs can be generated.
   * The format in the environmentvariable is `<namespace label><namespace label><namespace label>`.
   * The label must be at least 1 character long.
   *
   * If the array is empty, no additional namespaces will be managed, leaving only the default range
   * specified by {@link ASN_NAMESPACE_RANGE}.
   *
   * @example "<500 Internal Documents (Generic)><600 NDA-Covered Documents (Generic)>"
   */
  ADDITIONAL_MANAGED_NAMESPACES: AdditionalManagedNamespace[];

  /**
   * The URL to use for the ASN lookup. The URL must contain the `{asn}` placeholder which will be replaced with the ASN.
   * If not set, the lookup feature will be disabled.
   *
   * If `ASN_LOOKUP_INCLUDE_PREFIX` is `false`, the prefix will be excluded from the ASN.
   * This is necessary for compatibility with some systems like paperless-ngx, where the ASN is purely numeric.
   *
   * @example "https://dms.example.com/documents?asn={asn}"
   * @see {@link ASN_LOOKUP_INCLUDE_PREFIX}
   */
  ASN_LOOKUP_URL?: string;

  /**
   * Whether to include the prefix in the ASN when looking up the ASN.
   * This is necessary for compatibility with some systems like paperless-ngx, where the ASN is purely numeric.
   *
   * @default `false`
   */
  ASN_LOOKUP_INCLUDE_PREFIX: boolean;

  /**
   * The type of barcode to use for the ASN.
   * Options are
   * - `"CODE128"`,
   * - `"CODE39"`, and
   * - `"CODE93"`.
   *
   * @default "CODE128"
   */
  ASN_BARCODE_TYPE: string;
}

const configSchema = z.object({
  PORT: z.number({ coerce: true }).default(8080),
  ASN_PREFIX: z.string().min(1).max(10).regex(/^[A-Z]+$/),
  ASN_NAMESPACE_RANGE: z.number({ coerce: true }),
  ASN_ENABLE_NAMESPACE_EXTENSION: zBoolString().default(false),
  ADDITIONAL_MANAGED_NAMESPACES: z.string().default("").transform((v) =>
    deserializeAdditionalManagedNamespaces(v)
  ).or(z.array(z.object({
    namespace: z.number(),
    label: z.string().min(1),
  }))).default([]),
  ASN_LOOKUP_URL: z.string().regex(/^https?\:\/\/.*\{asn\}.*$/).optional(),
  ASN_LOOKUP_INCLUDE_PREFIX: zBoolString().default(false),
  ASN_BARCODE_TYPE: z.preprocess(
    (v) => v && String(v).toUpperCase(),
    z.literal("CODE128")
      .or(z.literal("CODE39"))
      .or(z.literal("CODE93"))
      .default("CODE128"),
  ).transform((v) => v.toLowerCase()),
});

/**
 * The current application configuration, based on environment variables, `.env` files, and defaults.
 * @see {@link Config}
 */
export const CONFIG: Config = configSchema.parse(Deno.env.toObject());

const DB_CONFIG_KEY = "config";

/**
 * Validates the current configuration against the one used the last time (stored in the database).
 * 1. If the configuration has changed in an incompatible way, the returned promise will reject.
 * 2. If the configuration has changed in a compatible, but unexpected way, a warning will be logged.
 * 3. If the database has no configuration (i.e., first run), the current configuration will be stored.
 * If there are no issues, current configuration will be stored in the database and the promise will resolve.
 *
 * @returns A promise that resolves if the database configuration is valid.
 * @throws {Error} If the configuration has changed in an incompatible way.
 */
export async function validateDB(): Promise<void> {
  const db = await getDB();

  const dbConfigRes = await db.get([DB_CONFIG_KEY]);
  if (!dbConfigRes.value) {
    await db.set([DB_CONFIG_KEY], CONFIG);
    return;
  }

  const dbConfig = configSchema.parse(dbConfigRes.value);

  if (dbConfig.ASN_PREFIX !== CONFIG.ASN_PREFIX) {
    throw new Error(
      `Database configuration mismatch: ASN_PREFIX.\n` +
        `  Old: ${dbConfig.ASN_PREFIX},\n` +
        `  New: ${CONFIG.ASN_PREFIX}.\n` +
        `The prefix must be the same.`,
    );
  }

  if (
    dbConfig.ASN_NAMESPACE_RANGE?.toString().length !==
      CONFIG.ASN_NAMESPACE_RANGE.toString().length
  ) {
    throw new Error(
      `Database configuration mismatch: ASN_NAMESPACE_RANGE.\n` +
        `  Old: ${dbConfig.ASN_NAMESPACE_RANGE},\n` +
        `  New: ${CONFIG.ASN_NAMESPACE_RANGE}.\n` +
        `The number of digits must be the same.`,
    );
  }

  if (
    CONFIG.ASN_ENABLE_NAMESPACE_EXTENSION &&
    CONFIG.ASN_NAMESPACE_RANGE.toString().charAt(0) === "9"
  ) {
    throw new Error(
      `Semantic configuration error: ASN_NAMESPACE_RANGE includes namespaces with leading 9s.\n` +
        `This is not allowed when ASN_ENABLE_NAMESPACE_EXTENSION is true.`,
    );
  }

  if (
    !CONFIG.ADDITIONAL_MANAGED_NAMESPACES.every((a) =>
      isValidAdditionalManagedNamespace(a.namespace)
    )
  ) {
    console.debug(CONFIG.ADDITIONAL_MANAGED_NAMESPACES);
    throw new Error(
      `Semantic configuration error: Additional managed namespaces contain invalid namespace numbers.\n` +
        `The namespace numbers must have the same amount of digits as ASN_NAMESPACE_RANGE.\n` +
        `If ASN_ENABLE_NAMESPACE_EXTENSION is true, the leading 9s are stripped from this calculation.\n` +
        `For example, if your ASN_NAMESPACE_RANGE has two digits, instead of only XX, you can then also have 9XX, 99XX, etc.\n` +
        `Note that in this case, 9X would not be valid.`,
    );
  }

  if (dbConfig.ASN_BARCODE_TYPE !== CONFIG.ASN_BARCODE_TYPE) {
    console.warn(
      `Warning: ASN_BARCODE_TYPE has changed. This will affect the barcode generation.\n` +
        `  Old: ${dbConfig.ASN_BARCODE_TYPE},\n` +
        `  New: ${CONFIG.ASN_BARCODE_TYPE}.\n` +
        `Any future barcodes will be generated using the new barcode type which may not be compatible with the old ones.`,
    );
  }

  await db.set([DB_CONFIG_KEY], CONFIG);
}
