import { DB_FILE_PATH, ensureParentDirExists } from "$common/path.ts";

/**
 * Ensures that the database file exists and returns its API.
 * @returns the key-value store for the application database.
 */
export async function getDB(): Promise<Deno.Kv> {
  if (!DB_FILE_PATH.startsWith("http")) {
    await ensureParentDirExists(DB_FILE_PATH);
  }
  return Deno.openKv(DB_FILE_PATH);
}

/**
 * Performs a transaction on the database, retrying if the database is locked.
 * Only commits the transaction if the atomic operation was successful.
 * Retries the transaction if the database is locked or if the operation fails.
 * @param fn the function to execute atomically
 *
 * @example
 * ```ts
 * await performAtomicTransaction(async (db) => {
 *   const counterRes = await db.get<number>(["namespace", namespace]);
 *   counter = counterRes.value ?? 1;
 *   return db.atomic()
 *     .check(counterRes)
 *     .set(["namespace", namespace], counter + 1)
 *     .commit();
 * });
 * ```
 *
 * @see This follows the principles described by <https://docs.deno.com/deploy/kv/manual/transactions/>
 */
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
