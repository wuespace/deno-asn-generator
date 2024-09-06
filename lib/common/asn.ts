import { CONFIG } from "./config.ts";
import { performAtomicTransaction } from "./db.ts";
import { ensureFileContent, getCounterPath } from "./path.ts";

function getCurrentNamespace(): number {
  const date = Date.now();
  const range = getRange();
  return range + date % (CONFIG.ASN_NAMESPACE_RANGE - range);
}

function getRange() {
  return Number.parseInt(
    `1${"0".repeat(`${CONFIG.ASN_NAMESPACE_RANGE}`.length - 1)}`,
  );
}

/**
 * Generates a new Alphanumeric Serial Number (ASN) based on the configuration.
 * The ASN is composed of a prefix, a namespace, and a counter.
 * @returns a new ASN (Alphanumeric Serial Number)
 */
export async function generateASN(metadata: Record<string, unknown> = {}) {
  metadata = { ...metadata, generatedAt: new Date().toISOString() };
  const namespace = getCurrentNamespace();
  let counter = 0;

  await performAtomicTransaction(async (db) => {
    const counterRes = await db.get<number>(["namespace", namespace]);
    counter = counterRes.value ?? 1;
    return db.atomic()
      .check(counterRes)
      .set(
        ["namespace", namespace],
        counter + 1,
      )
      .set(
        ["metadata", namespace, counter],
        { metadata, timestamp: Date.now() },
      )
      .commit();
  });

  const asnData = {
    asn: `${CONFIG.ASN_PREFIX}${namespace}${counter.toString().padStart(3, "0")}`,
    namespace,
    prefix: CONFIG.ASN_PREFIX,
    counter,
    metadata
  };

  await ensureFileContent(getCounterPath(namespace, counter), JSON.stringify(asnData, null, 2));

  return asnData;
}

/**
 * Returns a human-readable description of the ASN format.
 * @returns a human-readable description of the ASN format that explains the prefix, the namespace, and the counter.
 * @remark The description is intended to be used in the console output or other monospaced text.
 */
export function getFormatDescription(): string {
  return `Format:\n` +
    `${CONFIG.ASN_PREFIX.padEnd(4)} - ${getRange().toString().padEnd(4)} - 001\n` +
    `(1)  - (2)  - (3)\n` +
    `\n` +
    `(1) Prefix specified in configuration (${CONFIG.ASN_PREFIX}).\n` +
    `(2) Numeric Namespace, whereas\n` +
    `    - ${getRange()}-${
      CONFIG.ASN_NAMESPACE_RANGE - 1
    } is reserved for automatic generation, and\n` +
    `    - ${CONFIG.ASN_NAMESPACE_RANGE}-${
      getRange() * 10 - 1
    } is reserved for user defined namespaces.\n` +
    `    The user defined namespace can be used for pre-printed ASN barcodes and the like.\n` +
    `(3) Counter, starting from 001, incrementing with each new ASN in the namespace.`;
}
