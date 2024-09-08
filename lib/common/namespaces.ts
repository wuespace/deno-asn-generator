import { CONFIG } from "$common/mod.ts";

/**
 * Returns a list of all managed namespaces.
 * This includes the generic namespaces and the additional managed namespaces.
 * @returns all managed namespaces
 */
export function allManagedNamespaces(): number[] {
  const minGeneric = getMinimumGenericRangeNamespace();
  const maxGeneric = getMaximumGenericRangeNamespace();

  return [
    ...Array.from(
      { length: maxGeneric - minGeneric },
      (_, i) => i + minGeneric,
    ),
    ...CONFIG.ADDITIONAL_MANAGED_NAMESPACES.map((v) => v.namespace),
  ];
}

/**
 * The maximum namespace value for the generic range.
 * This is the maximum value smaller than the `ASN_NAMESPACE_RANGE` configuration parameter.
 * @returns the maximum namespace value for the generic range
 */
function getMaximumGenericRangeNamespace(): number {
  return CONFIG.ASN_NAMESPACE_RANGE - 1;
}

/**
 * The minimum namespace value for the generic range.
 * This is the minimum value with the same number of digits as
 * the `ASN_NAMESPACE_RANGE` configuration parameter.
 * @returns the minimum namespace value for the generic range
 */
function getMinimumGenericRangeNamespace(): number {
  return Number.parseInt(
    "1" + "0".repeat(CONFIG.ASN_NAMESPACE_RANGE.toString().length - 1),
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
export function isManagedNamespace(namespace: number): boolean {
  if (namespace < getMinimumGenericRangeNamespace()) {
    return false;
  }
  if (namespace <= getMaximumGenericRangeNamespace()) {
    return true;
  }
  return CONFIG.ADDITIONAL_MANAGED_NAMESPACES.some((v) =>
    v.namespace === namespace
  );
}
