import { z } from "@collinhacks/zod";
import { getDB } from "$common/db.ts";
import "@std/dotenv/load";

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
   * 600 - 999 would then be reserved for user defined namespaces (e.g., manually pre-printed ASN codes).
   *
   * The number of digits must not change after the first run.
   *
   * @see For more information on the namespacing, take a look at {@link generateASN} or the `README.md`.
   */
  ASN_NAMESPACE_RANGE: number;

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
  ASN_LOOKUP_URL: z.string().regex(/^https?\:\/\/.*\{asn\}.*$/).optional(),
  ASN_LOOKUP_INCLUDE_PREFIX: z.boolean({ coerce: true }).default(false),
  ASN_BARCODE_TYPE: z.preprocess(
    (v) => v && String(v).toUpperCase(),
    z.literal("CODE128")
      .or(z.literal("CODE39"))
      .or(z.literal("CODE93"))
      .default("CODE128"),
  ).transform((v) => v.toLowerCase()),
});

z.string().transform((v) => v.trim());

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
