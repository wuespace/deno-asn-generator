import { z } from "@collinhacks/zod";
import { getDB } from "$common/db.ts";

interface Config {
  PORT: number;
  ASN_PREFIX: string;
  // e.g., if it's 600, the range for generated ASNs would be 100 - 599;
  // 600 - 999 are reserved for user defined namespaces (e.g., manually pre-printed ASN codes)
  ASN_NAMESPACE_RANGE: number;
}

const configSchema = z.object({
  PORT: z.number({ coerce: true }).default(8080),
  ASN_PREFIX: z.string().min(1),
  ASN_NAMESPACE_RANGE: z.number({ coerce: true }),
});

export const CONFIG: Config = configSchema.parse(Deno.env.toObject());

const DB_CONFIG_KEY = "config";
export async function validateDB() {
  const db = await getDB();

  const dbConfigRes = await db.get([DB_CONFIG_KEY]);
  if (!dbConfigRes.value) {
    return db.set([DB_CONFIG_KEY], CONFIG);
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
    dbConfig.ASN_NAMESPACE_RANGE.toString().length !==
      CONFIG.ASN_NAMESPACE_RANGE.toString().length
  ) {
    throw new Error(
      `Database configuration mismatch: ASN_NAMESPACE_RANGE.\n` +
        `  Old: ${dbConfig.ASN_NAMESPACE_RANGE},\n` +
        `  New: ${CONFIG.ASN_NAMESPACE_RANGE}.\n` +
        `The number of digits must be the same.`,
    );
  }
}
