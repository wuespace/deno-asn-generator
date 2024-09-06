import { z, ZodObject } from "@collinhacks/zod";
import { getDB } from "$common/db.ts";

interface Config {
  PORT: number;
  ASN_PREFIX: string;
  // e.g., if it's 600, the range for generated ASNs would be 100 - 599;
  // 600 - 999 are reserved for user defined namespaces (e.g., manually pre-printed ASN codes)
  ASN_NAMESPACE_RANGE: number;

  ASN_LOOKUP_URL?: string;
  ASN_LOOKUP_INCLUDE_PREFIX: boolean;
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

export const CONFIG: Config = configSchema.parse(Deno.env.toObject());

const DB_CONFIG_KEY = "config";
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
