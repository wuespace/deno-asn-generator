import { resolve } from "node:path";
import { CONFIG } from "$common/mod.ts";

/**
 * Resolves the full path to the {@link Config.DATA_DIR}.
 * @param config The configuration object to use. Defaults to the global configuration.
 * @returns Full path to the data directory.
 */
export function getDataDirectoryPath(config = CONFIG): string {
  return resolve(config.DATA_DIR);
}

/**
 * Resolves the full path to the database file.
 * If the database file is a URL, the URL is returned as is.
 * See {@link Config.DB_FILE_NAME} for more information.
 * @param config The configuration object to use. Defaults to the global configuration.
 * @returns Full path to the database file.
 */
export function getDatabasePath(config = CONFIG): string {
  if (config.DB_FILE_NAME.startsWith("http")) {
    return config.DB_FILE_NAME;
  }

  return resolve(getDataDirectoryPath(config), config.DB_FILE_NAME);
}

/**
 * Logs relevant paths to the console.
 */
export function logPaths(config = CONFIG) {
  console.log(`DATA_PATH: ${getDataDirectoryPath(config)}`);
  console.log(`DB_FILE_PATH: ${getDatabasePath(config)}`);
}

/**
 * Builds a path to a log file for the given ASN that contains the ASN data (if the ASN exists).
 * @param namespace the ASN namespace
 * @param counter the ASN counter
 * @param config the configuration object to use. Defaults to the global configuration.
 * @returns a path to a log file for the given ASN that contains the ASN data (if the ASN exists).
 */
export function getCounterPath(
  namespace: number,
  counter: number,
  config = CONFIG,
): string {
  return resolve(
    getDataDirectoryPath(config),
    namespace.toString(),
    `${counter.toString().padStart(8, "_")}.log`,
  );
}

/**
 * Builds a path to a log file for the given namespace that contains the metadata for the namespace.
 * @param namespace the ASN namespace
 * @param config the configuration object to use. Defaults to the global configuration.
 * @returns a path to a log file for the given namespace that contains the metadata for the namespace.
 */
export function getNamespaceMetadataPath(
  namespace: number,
  config = CONFIG,
): string {
  return resolve(
    getDataDirectoryPath(config),
    namespace.toString(),
    `${"_".repeat(8)}.log`,
  );
}

/**
 * Creates a directory if it does not exist.
 * @param path the path to the directory
 * @returns a `Promise` that resolves when the directory exists or rejects if the existence cannot be ensured.
 */
export async function ensureDirExists(path: string): Promise<void> {
  try {
    await Deno.mkdir(path, { recursive: true });
  } catch (e: unknown) {
    if (e instanceof Deno.errors.AlreadyExists) {
      return;
    }
    throw e;
  }
}

/**
 * Ensures that the parent directory of the given path exists.
 * If the parent directory does not exist, it is created.
 * @param path path to the file or directory
 */
export async function ensureParentDirExists(path: string): Promise<void> {
  await ensureDirExists(resolve(path, ".."));
}

/**
 * Ensures that the file exists and writes the content to the file.
 * If the file does not exist, it is created.
 * If the file exists, it is overwritten.
 * @param path path to the file
 * @param content content to write to the file
 */
export async function ensureFileContent(
  path: string,
  content: string,
): Promise<void> {
  try {
    await ensureParentDirExists(path);
    await Deno.writeTextFile(path, content);
  } catch (e: unknown) {
    throw e;
  }
}
