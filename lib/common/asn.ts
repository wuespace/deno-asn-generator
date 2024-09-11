import { CONFIG } from "$common/config.ts";
import {
  addTimestampToNamespaceStats,
  ensureFileContent,
  getCounterPath,
  getMaximumGenericRangeNamespace,
  getMinimumGenericRangeNamespace,
  isValidNamespace,
  performAtomicTransaction,
} from "$common/mod.ts";

/**
 * Data structure for an Alphanumeric Serial Number (ASN).
 */
export interface ASNData {
  /**
   * The full ASN.
   *
   * Consists of the prefix, the namespace, and the counter (which gets padded to at least three digits).
   * @example "ASN123456789"
   */
  asn: string;
  /**
   * The numeric namespace.
   */
  namespace: number;
  /**
   * The prefix specified in the configuration.
   */
  prefix: string;
  /**
   * The counter, starting from 1 and incrementing with each new ASN in the namespace.
   */
  counter: number;
  /**
   * Additional metadata for the ASN.
   */
  metadata: Record<string, unknown>;
}

function getCurrentNamespace(config = CONFIG): number {
  const date = Date.now();
  const range = getMinimumGenericRangeNamespace(config);
  return range + date % (config.ASN_NAMESPACE_RANGE - range);
}

/**
 * Generates a new Alphanumeric Serial Number (ASN) based on the configuration.
 * The ASN is composed of a prefix, a namespace, and a counter.
 *
 * The prefix is specified in the configuration and must not change after the first run.
 *
 * The namespace is a number that always has the same number of digits.
 *
 * If no namespace is provided, the namespace is automatically generated based on the current
 * time and the generic `ASN_NAMESPACE_RANGE` in the configuration.
 *
 * The counter is a three-digit number that increments with each new ASN in the namespace.
 * When the counter reaches 999, another digit gets added.
 * Therefore, additional digits are only ever added to the counter, not the namespace.
 *
 * @param metadata - additional metadata to store with the ASN
 * @param namespace - the namespace to use for the ASN. If not provided, a namespace is automatically generated.
 * @returns a new ASN (Alphanumeric Serial Number)
 *
 * @example
 * ```ts
 * const asn = await generateASN({ name: "John Doe" });
 * console.log(asn.asn); // "ASN123456789"
 * ```
 *
 * @example
 * ```ts
 * const asn = await generateASN({ name: "John Doe" }, 123);
 * console.log(asn.asn); // "ASN123012"
 * ```
 */
export async function generateASN(
  metadata: Record<string, unknown> = {},
  namespace?: number,
  deltaCounter = 1,
): Promise<ASNData> {
  if (deltaCounter < 1) {
    throw new Error("Delta counter must be at least 1");
  }

  if (deltaCounter % 1 !== 0) {
    throw new Error("Delta counter must be an integer");
  }

  metadata = { ...metadata, generatedAt: new Date().toISOString() };
  namespace = namespace ?? getCurrentNamespace();
  let counter = 0;

  await performAtomicTransaction(async (db) => {
    const counterRes = await db.get<number>(["namespace", namespace]);
    counter = (counterRes.value ?? 0) + deltaCounter;
    return db.atomic()
      .check(counterRes)
      .set(
        ["namespace", namespace],
        counter,
      )
      .set(
        ["metadata", namespace, counter],
        { metadata, timestamp: Date.now() },
      )
      .commit();
  });

  const asnData = {
    asn: formatASN(namespace, counter),
    namespace,
    prefix: CONFIG.ASN_PREFIX,
    counter: counter,
    metadata,
  };

  await ensureFileContent(
    getCounterPath(namespace, counter),
    JSON.stringify(asnData, null, 2),
  );

  await addTimestampToNamespaceStats(namespace);

  return asnData;
}

/**
 * Validates a counter to ensure it is a valid counter to use in an ASN.
 * A valid counter is a safe integer greater than or equal to 0.
 * @param counter the counter to validate
 * @param config the configuration to use for validation. Defaults to the global configuration.
 * @returns `true` if the counter is valid, `false` otherwise
 */
export function isValidCounter(counter: number): boolean {
  return counter >= 0 && Number.isSafeInteger(counter);
}

/**
 * Formats a namespace and a counter into a full ASN string.
 * @param namespace the namespace number
 * @param counter the counter number
 * @param config The configuration to use for formatting. Defaults to the global configuration.
 * @returns the full ASN string including the configured prefix
 */
export function formatASN(
  namespace: number,
  counter: number,
  config = CONFIG,
): string {
  if (!isValidNamespace(namespace, config)) {
    throw new Error("Invalid namespace: " + namespace);
  }

  if (!isValidCounter(counter)) {
    throw new Error(
      "Invalid counter: " + counter +
        " (must be a safe integer >= 0)",
    );
  }

  return `${config.ASN_PREFIX}${namespace}${
    counter.toString().padStart(3, "0")
  }`;
}

/**
 * Returns a human-readable description of the ASN format.
 * @param config The configuration to use for the description. Defaults to the global configuration.
 * @returns a human-readable description of the ASN format that explains the prefix, the namespace, and the counter.
 * @remark The description is intended to be used in the console output or other monospaced text.
 */
export function getFormatDescription(config = CONFIG): string {
  const {
    ASN_PREFIX,
    ASN_NAMESPACE_RANGE,
    ASN_ENABLE_NAMESPACE_EXTENSION,
  } = config;
  const minimumGenericNamespace = getMinimumGenericRangeNamespace(config);
  const maximumGenericNamespace = getMaximumGenericRangeNamespace(config);

  const paddedPrefix = ASN_PREFIX.padEnd(4);
  const paddedNamespace = minimumGenericNamespace
    .toString()
    .padEnd(4);

  const manualNamespaceEnd = minimumGenericNamespace * 10 - 1 -
    (ASN_ENABLE_NAMESPACE_EXTENSION ? minimumGenericNamespace : 0);

  const namespaceExtensionRanges = ASN_ENABLE_NAMESPACE_EXTENSION
    ? ",\n" +
      `    - ${nthNinerExtensionRange(1, ASN_NAMESPACE_RANGE).join("-")},\n` +
      `    - ${nthNinerExtensionRange(2, ASN_NAMESPACE_RANGE).join("-")},\n` +
      `    - ${
        nthNinerExtensionRange(3, ASN_NAMESPACE_RANGE).join("-")
      }, etc., are`
    : " is";

  return `Configured ASN Format:\n` +
    `${paddedPrefix} - ${paddedNamespace} - 001\n` +
    `(1)  - (2)  - (3)\n` +
    `\n` +
    `(1) Prefix specified in configuration (${ASN_PREFIX}).\n` +
    `(2) Numeric Namespace, whereas\n` +
    `    - ${minimumGenericNamespace}-${maximumGenericNamespace} is reserved for automatic generation, and\n` +
    `    - ${ASN_NAMESPACE_RANGE}-${manualNamespaceEnd}${namespaceExtensionRanges} reserved for user defined namespaces.\n` +
    `    The user defined namespace can be used for pre-printed ASN barcodes and the like.\n` +
    `(3) Counter, starting from 001, incrementing with each new ASN in the namespace.\n` +
    `    After 999, another digit is added.`;
}

/**
 * Calculates the range of the nth niner extension range (which can be enabled using `ASN_ENABLE_NAMESPACE_EXTENSION`).
 * @param n the nth niner extension range
 * @param baseRange the base range, as configured by {@link ASN_NAMESPACE_RANGE}
 * @returns a tuple with the minimum and maximum values of the nth niner extension range
 */
export function nthNinerExtensionRange(
  n: number,
  baseRange: number,
): [number, number] {
  if (n < 1) {
    throw new Error("n must be at least 1");
  }
  if (n > 1) {
    const [start, end] = nthNinerExtensionRange(n - 1, baseRange);
    return [Number.parseInt(`9${start}`), Number.parseInt(`9${end}`)];
  }

  const bl = `${baseRange}`.length;

  const min = `9${"0".repeat(bl)}`;
  const max = `98${`9`.repeat(bl - 1)}`;
  return [
    Number.parseInt(min),
    Number.parseInt(max),
  ];
}

/**
 * Validates an ASN to ensure it matches the format specified by the current configuration.
 * @param asn ASN to validate
 * @param config The configuration to use for validation. Defaults to the global configuration.
 * @returns `true` if the ASN is valid, `false` otherwise
 */
export function isValidASN(asn: string, config = CONFIG): boolean {
  return new RegExp(
    `^(${config.ASN_PREFIX})?(\\d{${
      `${config.ASN_NAMESPACE_RANGE}`.length
    }})(\\d{3})\\d*$`,
  ).test(asn);
}

/**
 * Parses an ASN string into an {@link ASNData} object.
 * The ASN string must match the format specified by the current configuration.
 * The ASN prefix is optional and can be omitted.
 *
 * @throws {Error} if the ASN is invalid
 * @param asn the ASN to parse
 * @param config The configuration to use for parsing. Defaults to the global configuration.
 * @returns An {@link ASNData} object with the parsed ASN data
 */
export function parseASN(asn: string, config = CONFIG): ASNData {
  if (!isValidASN(asn, config)) {
    throw new Error("Invalid ASN");
  }

  if (asn.startsWith(config.ASN_PREFIX)) {
    asn = asn.slice(config.ASN_PREFIX.length);
  }

  let strNamespace = "";

  while (config.ASN_ENABLE_NAMESPACE_EXTENSION && asn.startsWith("9")) {
    strNamespace += asn[0];
    asn = asn.slice(1);
  }

  strNamespace += asn.slice(0, `${config.ASN_NAMESPACE_RANGE}`.length);
  asn = asn.slice(`${config.ASN_NAMESPACE_RANGE}`.length);

  const namespace = Number.parseInt(strNamespace);
  const counter = Number.parseInt(asn);

  return {
    asn: formatASN(namespace, counter, config),
    prefix: CONFIG.ASN_PREFIX,
    namespace,
    counter,
    metadata: {},
  };
}
