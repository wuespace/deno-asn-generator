import { resolve } from "node:path";
import { z } from "@collinhacks/zod";

const DATA_DIR = z.string().min(1).default("data").parse(
  Deno.env.get("DATA_DIR"),
);
const DB_FILE_NAME = z.string().min(1).default("denokv.sqlite3").parse(
  Deno.env.get("DB_FILE_NAME"),
);

/**
 * The path to the directory where the data is stored.
 * By default, this is the `data` directory in the root of the project.
 * Can be overridden by setting the `DATA_DIR` environment variable.
 *
 * This is the central location for all data files.
 * Regular backups are strongly recommended.
 */
export const DATA_PATH: string = resolve(DATA_DIR);
/**
 * The name of the database file.
 * Can be either a local file path or a URL beginning with `http[s]://`.
 *
 * If the database file is a URL, it gets used as a
 * [KV Connect URL](https://docs.deno.com/deploy/kv/manual/node/#kv-connect-urls).
 * This allows for use-cases where multiple instances of the application share the same database.
 * You can even use the programmatic APIs to build other applications on top of this system.
 * You can find more information about KV Connect URLs at
 * <https://github.com/denoland/denokv/blob/main/proto/kv-connect.md>.
 *
 * If the database file is a local file path, it gets used as a SQLite database file.
 * The database file is then stored in the `DATA_PATH`.
 *
 * By default, this is `denokv.sqlite3`.
 * Can be overridden by setting the `DB_FILE_NAME` environment variable.
 *
 * @see {@link DATA_PATH}
 */
export const DB_FILE_PATH: string = DB_FILE_NAME.startsWith("http")
  ? DB_FILE_NAME
  : resolve(DATA_PATH, DB_FILE_NAME);

/**
 * Logs relevant paths to the console.
 */
export function logPaths() {
  console.log(`DATA_PATH: ${DATA_PATH}`);
  console.log(`DB_FILE_PATH: ${DB_FILE_PATH}`);
}

/**
 * Builds a path to a log file for the given ASN that contains the ASN data (if the ASN exists).
 * @param namespace the ASN namespace
 * @param counter the ASN counter
 * @returns a path to a log file for the given ASN that contains the ASN data (if the ASN exists).
 */
export function getCounterPath(namespace: number, counter: number): string {
  return resolve(
    DATA_PATH,
    namespace.toString(),
    `${counter.toString().padStart(8, "_")}.log`,
  );
}

/**
 * Builds a path to a log file for the given namespace that contains the metadata for the namespace.
 * @param namespace the ASN namespace
 * @returns a path to a log file for the given namespace that contains the metadata for the namespace.
 */
export function getNamespaceMetadataPath(namespace: number): string {
  return resolve(DATA_PATH, namespace.toString(), `${"_".repeat(8)}.log`);
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
