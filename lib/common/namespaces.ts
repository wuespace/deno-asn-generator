import { CONFIG } from "$common/mod.ts";

/**
 * Returns a list of all managed namespaces.
 * This includes the generic namespaces and the additional managed namespaces.
 * @returns all managed namespaces
 */
export function allManagedNamespaces(config = CONFIG): number[] {
  const minGeneric = getMinimumGenericRangeNamespace(config);
  const maxGeneric = getMaximumGenericRangeNamespace(config);

  return [
    ...Array.from(
      { length: maxGeneric - minGeneric + 1 },
      (_, i) => i + minGeneric,
    ),
    ...config.ADDITIONAL_MANAGED_NAMESPACES.map((v) => v.namespace),
  ];
}

/**
 * The maximum namespace value for the generic range.
 * This is the maximum value smaller than the `ASN_NAMESPACE_RANGE` configuration parameter.
 * @returns the maximum namespace value for the generic range
 */
export function getMaximumGenericRangeNamespace(config = CONFIG): number {
  return config.ASN_NAMESPACE_RANGE - 1;
}

/**
 * The minimum namespace value for the generic range.
 * This is the minimum value with the same number of digits as
 * the `ASN_NAMESPACE_RANGE` configuration parameter.
 * @returns the minimum namespace value for the generic range
 */
export function getMinimumGenericRangeNamespace(config = CONFIG): number {
  return Number.parseInt(
    "1" + "0".repeat(config.ASN_NAMESPACE_RANGE.toString().length - 1),
  );
}

/**
 * Checks if a namespace is a valid namespace according to the configuration.
 * Note that "valid" does not necessarily mean "managed".
 * A valid namespace is any namespace that fulfills the following conditions:
 * - The namespace is a safe integer, and
 * - either:
 *   - The namespace has the same number of digits as the `ASN_NAMESPACE_RANGE`
 *     configuration parameter, or
 *   - The namespace has the same number of digits as the `ASN_NAMESPACE_RANGE`
 *     configuration parameter without leading nines if `ASN_ENABLE_NAMESPACE_EXTENSION`
 *     is enabled.
 *
 * @param namespace the namespace to check
 * @returns `true` if the namespace is a valid namespace, `false` otherwise
 */
export function isValidNamespace(namespace: number, config = CONFIG): boolean {
  if (
    !Number.isSafeInteger(namespace) ||
    namespace < getMinimumGenericRangeNamespace(config)
  ) {
    return false;
  }

  let sNamespace = namespace.toString();
  if (config.ASN_ENABLE_NAMESPACE_EXTENSION) {
    sNamespace = sNamespace.replace(/^9+/, "");
  }

  return (
    sNamespace.length === `${config.ASN_NAMESPACE_RANGE}`.length
  );
}

/**
 * Checks if a namespace is a managed namespace.
 * A managed namespace is any namespace that fulfills one of the following conditions:
 * - The namespace is within the generic range (`ASN_NAMESPACE_RANGE`), or
 * - The namespace is within the additional managed namespaces (`ADDITIONAL_MANAGED_NAMESPACES`)
 * @param namespace the namespace to check
 * @returns `true` if the namespace is managed by the system, `false` otherwise
 */
export function isManagedNamespace(
  namespace: number,
  config = CONFIG,
): boolean {
  if (namespace < getMinimumGenericRangeNamespace(config)) {
    return false;
  }
  if (namespace <= getMaximumGenericRangeNamespace(config)) {
    return true;
  }
  return config.ADDITIONAL_MANAGED_NAMESPACES.some((v) =>
    v.namespace === namespace
  );
}
