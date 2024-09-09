import { CONFIG, isValidNamespace } from "$common/mod.ts";

/**
 * An additional managed namespace outside of the default range.
 */
export interface AdditionalManagedNamespace {
  /**
   * The namespace number.
   */
  namespace: number;
  /**
   * The label for the namespace.
   * Gets displayed in the UI when selecting the namespace.
   */
  label: string;
}

/**
 * Serializes an additional managed namespace to a string.
 * @param value - the additional managed namespace to serialize
 * @returns a string representation of the additional managed namespace
 */
export function serializeAdditionalManagedNamespace(
  value: AdditionalManagedNamespace,
): string {
  return `<${value.namespace} ${value.label}>`;
}

/**
 * Deserializes an additional managed namespace from a string.
 * @param value - the string to deserialize
 * @returns the deserialized additional managed namespace
 */
export function deserializeAdditionalManagedNamespace(
  value: string,
): AdditionalManagedNamespace {
  const match = value.trim().match(/^\<(\d+) (.+)\>[, ]*$/);

  if (!match) {
    throw new Error(`Invalid AdditionalManagedNamespace: ${value}`);
  }
  return {
    namespace: parseInt(match[1]),
    label: match[2],
  };
}

/**
 * Serializes an array of additional managed namespaces to a string.
 * @param value - the array of additional managed namespaces to serialize
 * @returns a string representation of the array of additional managed namespaces
 * @example
 * ```ts
 * // "<500 Internal Documents (Generic)><600 NDA-Covered Documents (Generic)>"
 * serializeAdditionalManagedNamespaces([
 *   { namespace: 500, label: "Internal Documents (Generic)" },
 *   { namespace: 600, label: "NDA-Covered Documents (Generic)" },
 * ]);
 * ```
 */
export function serializeAdditionalManagedNamespaces(
  value: AdditionalManagedNamespace[],
): string {
  return value.map(serializeAdditionalManagedNamespace).join("");
}

/**
 * Deserializes a string value into an array of AdditionalManagedNamespace objects.
 *
 * @param value - The string value to deserialize.
 * @returns An array of AdditionalManagedNamespace objects.
 * @example
 * ```ts
 * // [
 * //   { namespace: 500, label: "Internal Documents (Generic)" },
 * //   { namespace: 600, label: "NDA-Covered Documents (Generic)" },
 * // ]
 * deserializeAdditionalManagedNamespaces(
 *   "<500 Internal Documents (Generic)><600 NDA-Covered Documents (Generic)>"
 * );
 * ```
 */
export function deserializeAdditionalManagedNamespaces(
  value: string,
): AdditionalManagedNamespace[] {
  const matches = value.trim().match(/\<\d+ .+?\>[, ]*/g) || [];
  return matches.map(deserializeAdditionalManagedNamespace);
}

/**
 * Checks if a namespace is a valid additional managed namespace according to the configuration.
 * Note that "valid" does not necessarily mean "managed".
 * A valid additional managed namespace is any namespace that fulfills the following conditions:
 * - The namespace is a safe integer, and
 * - The namespace has a compatible number of digits based on the configuration, and
 * - The namespace is greater than or equal to the `ASN_NAMESPACE_RANGE` configuration parameter.
 *
 * Any managed namespace must be a valid namespace, but not all valid namespaces are managed.
 *
 * @param namespace the namespace to check
 * @returns `true` if the namespace is a valid additional managed namespace, `false` otherwise
 */
export function isValidAdditionalManagedNamespace(
  namespace: number,
  config = CONFIG,
): boolean {
  if (!isValidNamespace(namespace, config)) {
    return false;
  }

  return namespace >= config.ASN_NAMESPACE_RANGE;
}
