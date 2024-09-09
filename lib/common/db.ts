import { ensureParentDirExists, getDatabasePath } from "$common/path.ts";
import { CONFIG } from "$common/config.ts";

/**
 * Ensures that the database file exists and returns its API.
 * @param config The configuration object to use. Defaults to the global configuration.
 * @returns the key-value store for the application database.
 */
export async function getDB(config = CONFIG): Promise<Deno.Kv> {
  const databasePath = getDatabasePath(config);
  if (!databasePath.startsWith("http")) {
    await ensureParentDirExists(databasePath);
  }
  return Deno.openKv(databasePath);
}

/**
 * Performs a transaction on the database, retrying if the database is locked.
 * Only commits the transaction if the atomic operation was successful.
 * Retries the transaction if the database is locked or if the operation fails.
 *
 * This follows the principles described by <https://docs.deno.com/deploy/kv/manual/transactions/>
 *
 * @param fn the function to execute atomically
 * @param config The configuration object to use. Defaults to the global configuration.
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
 */
export async function performAtomicTransaction(
  fn: (db: Deno.Kv) => Promise<Deno.KvCommitResult | Deno.KvCommitError>,
  config = CONFIG,
) {
  const db = await getDB(config);
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
