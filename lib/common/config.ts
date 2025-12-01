import {
  type AdditionalManagedNamespace,
  deserializeAdditionalManagedNamespaces,
  getDB,
  isValidAdditionalManagedNamespace,
  toBoolean,
  toNumber,
  zBoolString,
} from "$common/mod.ts";
import { z, type ZodSchema } from "@collinhacks/zod";
import { initVariable } from "@wuespace/envar";
import { getLogger } from "./log.ts";

/**
 * The application configuration.
 */
export interface Config {
  /**
   * The port the server should listen on.
   *
   * Default: `8080`
   */
  readonly PORT: number;

  /**
   * The prefix for generated ASNs.
   * Can only contain uppercase letters A-Z. Must be at least 1 character long. Max length is 10.
   *
   * The prefix must not change after the first run.
   * @example `"ASN"`
   */
  readonly ASN_PREFIX: string;

  /**
   * The range of the ASN namespace part. For example, if it's 600, the range for generated ASNs would be 100 - 599.
   * 600 - 999 would then be reserved for user defined namespaces (e.g., manually pre-printed ASNs).
   *
   * The number of digits must not change after the first run.
   *
   * For more information on the namespacing, take a look at {@link generateASN} or the `README.md`.
   */
  readonly ASN_NAMESPACE_RANGE: number;

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
  readonly ASN_ENABLE_NAMESPACE_EXTENSION: boolean;

  /**
   * Additional managed namespaces outside the {@link ASN_NAMESPACE_RANGE} for which ASNs can be generated.
   * The format in the environmentvariable is `<namespace label><namespace label><namespace label>`.
   * The label must be at least 1 character long.
   *
   * If the array is empty, no additional namespaces will be managed, leaving only the default range
   * specified by {@link ASN_NAMESPACE_RANGE}.
   *
   * @example `"<500 Internal Documents (Generic)><600 NDA-Covered Documents (Generic)>"`
   */
  readonly ADDITIONAL_MANAGED_NAMESPACES: AdditionalManagedNamespace[];

  /**
   * The URL to use for the ASN lookup. The URL must contain the `{asn}` placeholder which will be replaced with the ASN.
   * If not set, the lookup feature will be disabled.
   *
   * If `ASN_LOOKUP_INCLUDE_PREFIX` is `false`, the prefix will be excluded from the ASN.
   * This is necessary for compatibility with some systems like paperless-ngx, where the ASN is purely numeric.
   *
   * @example `"https://dms.example.com/documents?asn={asn}"`
   *
   * See also: {@link ASN_LOOKUP_INCLUDE_PREFIX}
   */
  readonly ASN_LOOKUP_URL?: string;

  /**
   * Whether to include the prefix in the ASN when looking up the ASN.
   * This is necessary for compatibility with some systems like paperless-ngx, where the ASN is purely numeric.
   *
   * Default: `false`
   */
  readonly ASN_LOOKUP_INCLUDE_PREFIX: boolean;

  /**
   * The type of barcode to use for the ASN.
   * Options are
   * - `"CODE128"`,
   * - `"CODE39"`, and
   * - `"CODE93"`.
   *
   * Default: `"CODE128"`
   */
  readonly ASN_BARCODE_TYPE: string;

  /**
   * The path to the directory where the data is stored.
   * Can be relative (to the current working directory) or absolute.
   * By default, this is the `data` directory in the root of the project.
   * It can be overridden by setting the `DATA_DIR` environment variable.
   *
   * **Note:**
   * In most cases, you will not access this directly, but use {@link getDataDirectoryPath} instead.
   *
   * This is the central location for all data files.
   * Regular backups are strongly recommended.
   *
   * Default: `"data"`
   */
  readonly DATA_DIR: string;

  /**
   * The path to the database file.
   * Can be either a local file path or a URL beginning with `http[s]://`.
   *
   * **Note:**
   * In most cases, you will not access this directly, but use {@link getDatabasePath} instead.
   *
   * If the database file is a URL, it gets used as a
   * [KV Connect URL](https://docs.deno.com/deploy/kv/manual/node/#kv-connect-urls).
   * This allows for use-cases where multiple instances of the application share the same database.
   * You can even use the programmatic APIs to build other applications on top of this system.
   * You can find more information about KV Connect URLs at
   * <https://github.com/denoland/denokv/blob/main/proto/kv-connect.md>.
   *
   * If the database file is a local file path, it gets used as a SQLite database file.
   * The path will be interpreted to be relative to the {@link DATA_DIR}.
   * The database file is then stored in the `DATA_PATH`.
   *
   * By default, this is `denokv.sqlite3`.
   * Can be overridden by setting the `DB_FILE_NAME` environment variable.
   *
   * Defaults to `"denokv.sqlite3"`
   */
  readonly DB_FILE_NAME: string;
}

const configSchema: ZodSchema<Config> = z.object({
  PORT: z.number().positive().int(),
  ASN_PREFIX: z.string().min(1).max(10).regex(/^[A-Z]+$/),
  ASN_NAMESPACE_RANGE: z.number().int().positive(),
  ASN_ENABLE_NAMESPACE_EXTENSION: z.boolean(),
  ADDITIONAL_MANAGED_NAMESPACES: z.array(z.object({
    namespace: z.number().int().positive(),
    label: z.string().min(1),
  })),
  ASN_LOOKUP_URL: z.string().optional(),
  ASN_LOOKUP_INCLUDE_PREFIX: z.boolean(),
  ASN_BARCODE_TYPE: z.literal("CODE128")
    .or(z.literal("CODE39"))
    .or(z.literal("CODE93")),
  DATA_DIR: z.string(),
  DB_FILE_NAME: z.string(),
});

/**
 * Initializes the environment variable based configuration, including validation and defaults.
 * This function should be called at the start of the application, befor any calls to {@link getConfig}.
 */
export async function initConfig() {
  const logger = getLogger("[config][initConfig]");
  try {
    await Promise.all([
      initVariable("PORT", z.number({ coerce: true }).int().positive(), "8080"),
      initVariable("ASN_PREFIX", z.string().min(1).max(10).regex(/^[A-Z]+$/)),
      initVariable(
        "ASN_NAMESPACE_RANGE",
        z.number({ coerce: true }).int().positive(),
      ),
      initVariable("ASN_ENABLE_NAMESPACE_EXTENSION", zBoolString(), "false"),
      initVariable(
        "ADDITIONAL_MANAGED_NAMESPACES",
        z.string().transform((v) => deserializeAdditionalManagedNamespaces(v)),
        "",
      ),
      initVariable(
        "ASN_LOOKUP_URL",
        z.string().regex(/^https?\:\/\/.*\{asn\}.*$/).optional(),
      ),
      initVariable("ASN_LOOKUP_INCLUDE_PREFIX", zBoolString(), "false"),
      initVariable(
        "ASN_BARCODE_TYPE",
        z.preprocess(
          (s) => s && String(s).toUpperCase(),
          z.literal("CODE128")
            .or(z.literal("CODE39"))
            .or(z.literal("CODE93")),
        ),
        "CODE128",
      ),
      initVariable("DATA_DIR", z.string().min(1), "data"),
      initVariable("DB_FILE_NAME", z.string().min(1), "denokv.sqlite3"),
      initVariable("DENO_KV_ACCESS_TOKEN", z.string().optional()),
      // OIDC
      initVariable("OIDC_ISSUER", z.string().url().optional()),
      initVariable("OIDC_AUTH_SECRET", z.string().optional()),
      initVariable("OIDC_CLIENT_ID", z.string().optional()),
      initVariable("OIDC_CLIENT_SECRET", z.string().optional()),
      initVariable("OIDC_REDIRECT_URI", z.string().url().optional()),
      initVariable("OIDC_SCOPES", z.string().optional()),
      initVariable("OIDC_UID_CLAIM", z.string(), "sub"),
      initVariable("OIDC_NAME_CLAIM", z.string(), "name"),
      initVariable("OIDC_ROLES_CLAIM", z.string(), "roles"),
    ]);

    // Additional checks
    const config = getConfig();
    logger.withContext({ config })

    if (
      config.ASN_ENABLE_NAMESPACE_EXTENSION &&
      (config.ASN_NAMESPACE_RANGE - 1).toString().charAt(0) === "9"
    ) {
      logger.withMetadata({
        ASN_NAMESPACE_RANGE: config.ASN_NAMESPACE_RANGE,
        ASN_ENABLE_NAMESPACE_EXTENSION: config.ASN_ENABLE_NAMESPACE_EXTENSION,
        invalidGenericNamespace: config.ASN_NAMESPACE_RANGE - 1,
      }).fatal("ASN namespace range invalid with namespace extension enabled");
      throw new Error(
        `Semantic configuration error: ASN_NAMESPACE_RANGE includes namespaces with leading 9s.\n` +
        `This is not allowed when ASN_ENABLE_NAMESPACE_EXTENSION is true.`,
        {
          cause: {
            ASN_NAMESPACE_RANGE: config.ASN_NAMESPACE_RANGE,
            ASN_ENABLE_NAMESPACE_EXTENSION: config.ASN_ENABLE_NAMESPACE_EXTENSION,
            invalidGenericNamespace: config.ASN_NAMESPACE_RANGE - 1,
          },
        },
      );
    }

    const hasInvalidAdditionalNamespaces = !config
      .ADDITIONAL_MANAGED_NAMESPACES.every((a) =>
        isValidAdditionalManagedNamespace(a.namespace, config)
      );
    logger.withContext({ hasInvalidAdditionalNamespaces })

    if (
      hasInvalidAdditionalNamespaces
    ) {
      logger.withMetadata({
        ASN_ENABLE_NAMESPACE_EXTENSION: config.ASN_ENABLE_NAMESPACE_EXTENSION,
        ASN_NAMESPACE_RANGE: config.ASN_NAMESPACE_RANGE,
        invalidAdditionalManagedNamespaces: config
          .ADDITIONAL_MANAGED_NAMESPACES
          .filter(
            (a) => !isValidAdditionalManagedNamespace(a.namespace, config),
          ).map((v) => `${config.ASN_PREFIX}${v.namespace}XXX - ${v.label}`),
      }).fatal("Additional managed namespaces contain invalid namespace numbers");
      throw new Error(
        `Semantic configuration error: Additional managed namespaces contain invalid namespace numbers.\n` +
        `The namespace numbers must have the same amount of digits as ASN_NAMESPACE_RANGE.\n` +
        `If ASN_ENABLE_NAMESPACE_EXTENSION is true, the leading 9s are stripped from this calculation.\n` +
        `For example, if your ASN_NAMESPACE_RANGE has two digits, instead of only XX, you can then also have 9XX, 99XX, etc.\n` +
        `Note that in this case, 9X would not be valid.`,
        {
          cause: {
            ASN_ENABLE_NAMESPACE_EXTENSION: config.ASN_ENABLE_NAMESPACE_EXTENSION,
            ASN_NAMESPACE_RANGE: config.ASN_NAMESPACE_RANGE,
            invalidAdditionalManagedNamespaces: config
              .ADDITIONAL_MANAGED_NAMESPACES
              .filter(
                (a) => !isValidAdditionalManagedNamespace(a.namespace, config),
              ).map((v) => `${config.ASN_PREFIX}${v.namespace}XXX - ${v.label}`),
          },
        },
      );
    }
    logger.debug("Configuration initialized successfully");
  } catch (error) {
    logger.withError(error).fatal("Failed to initialize configuration");
    throw error;
  }
}

/**
 * Returns the current configuration. Should only be called after initializing the configuration with {@link initConfig}.
 * @returns The current configuration.
 */
export function getConfig(): Config {
  return configSchema.parse({
    PORT: toNumber(Deno.env.get("PORT")),
    ASN_PREFIX: Deno.env.get("ASN_PREFIX"),
    ASN_NAMESPACE_RANGE: toNumber(Deno.env.get("ASN_NAMESPACE_RANGE")),
    ASN_ENABLE_NAMESPACE_EXTENSION: toBoolean(Deno.env.get(
      "ASN_ENABLE_NAMESPACE_EXTENSION",
    )),
    ADDITIONAL_MANAGED_NAMESPACES: deserializeAdditionalManagedNamespaces(
      z.string().parse(Deno.env.get("ADDITIONAL_MANAGED_NAMESPACES")),
    ),
    ASN_LOOKUP_URL: Deno.env.get("ASN_LOOKUP_URL"),
    ASN_LOOKUP_INCLUDE_PREFIX: toBoolean(
      Deno.env.get("ASN_LOOKUP_INCLUDE_PREFIX"),
    ),
    ASN_BARCODE_TYPE: Deno.env.get("ASN_BARCODE_TYPE")?.toUpperCase(),
    DATA_DIR: Deno.env.get("DATA_DIR"),
    DB_FILE_NAME: Deno.env.get("DB_FILE_NAME"),
  }) satisfies Config;
}

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
export async function validateDB(config: Config = getConfig()): Promise<void> {
  const logger = getLogger("[config][validateDB]");
  try {
    const db = await getDB();
    logger.withContext({ currentConfig: config });

    const dbConfigRes = await db.get([DB_CONFIG_KEY]);
    if (!dbConfigRes.value) {
      await db.set([DB_CONFIG_KEY], config);
      logger.info("No existing configuration found in database, storing current configuration");
      return;
    }

    logger.withContext({ dbConfigRes });
    const dbConfig = configSchema.parse(dbConfigRes.value);
    logger.withContext({ dbConfig });

    if (dbConfig.ASN_PREFIX !== config.ASN_PREFIX) {
      logger.fatal("Database ASN_PREFIX does not match current configuration");
      throw new Error(
        `Database configuration mismatch: ASN_PREFIX.\n` +
        `  Old: ${dbConfig.ASN_PREFIX},\n` +
        `  New: ${config.ASN_PREFIX}.\n` +
        `The prefix must be the same.`,
      );
    }

    if (
      dbConfig.ASN_NAMESPACE_RANGE?.toString().length !==
      config.ASN_NAMESPACE_RANGE.toString().length
    ) {
      logger.fatal("Database ASN_NAMESPACE_RANGE does not match current configuration");
      throw new Error(
        `Database configuration mismatch: ASN_NAMESPACE_RANGE.\n` +
        `  Old: ${dbConfig.ASN_NAMESPACE_RANGE},\n` +
        `  New: ${config.ASN_NAMESPACE_RANGE}.\n` +
        `The number of digits must be the same.`,
      );
    }

    if (dbConfig.ASN_BARCODE_TYPE !== config.ASN_BARCODE_TYPE) {
      logger.warn("ASN_BARCODE_TYPE has changed. This will affect the barcode generation.");
    }

    await db.set([DB_CONFIG_KEY], config);
    logger.debug("Database configuration validated successfully");
  } catch (error) {
    logger.withError(error).fatal("Failed to validate database configuration");
    throw error;
  }
}
