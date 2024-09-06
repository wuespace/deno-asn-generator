import { DB_FILE_PATH, ensureParentDirExists } from "./path.ts";

export async function getDB(): Promise<Deno.Kv> {
  await ensureParentDirExists(DB_FILE_PATH);
  return Deno.openKv(DB_FILE_PATH);
}

export async function performAtomicTransaction(
  fn: (db: Deno.Kv) => Promise<Deno.KvCommitResult | Deno.KvCommitError>,
) {
  const db = await getDB();
  let res = { ok: false };
  while (!res.ok) {
    try {
      res = await fn(db);
    } catch (e: unknown) {
      if (e instanceof TypeError && e.message.includes("database is locked")) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        continue;
      }
      throw e;
    }
  }
}
