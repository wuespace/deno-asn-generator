import { resolve } from "node:path";
import { z } from "@collinhacks/zod";

const DATA_DIR = z.string().min(1).default("data").parse(
  Deno.env.get("DATA_DIR"),
);
const DB_FILE_NAME = z.string().min(1).default("denokv.sqlite3").parse(
  Deno.env.get("DB_FILE_NAME"),
);

export const DATA_PATH: string = resolve(DATA_DIR);
export const DB_FILE_PATH: string = resolve(DATA_PATH, DB_FILE_NAME);

console.log(`DATA_PATH: ${DATA_PATH}`);
console.log(`DB_FILE_PATH: ${DB_FILE_PATH}`);

export function getCounterPath(namespace: number, counter: number): string {
  return resolve(
    DATA_PATH,
    namespace.toString(),
    `${counter.toString().padStart(8, "_")}.log`,
  );
}

export function getNamespaceMetadataPath(namespace: number): string {
  return resolve(DATA_PATH, namespace.toString(), `${"_".repeat(8)}.log`);
}

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

export async function ensureParentDirExists(path: string): Promise<void> {
  await ensureDirExists(resolve(path, ".."));
}

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
