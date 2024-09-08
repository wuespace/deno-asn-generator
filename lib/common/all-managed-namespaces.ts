import { CONFIG } from "$common/mod.ts";

/**
 * Returns a list of all managed namespaces.
 * This includes the generic namespaces and the additional managed namespaces.
 * @returns all managed namespaces
 */
export function allManagedNamespaces() {
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

function getMaximumGenericRangeNamespace() {
  return CONFIG.ASN_NAMESPACE_RANGE - 1;
}

function getMinimumGenericRangeNamespace() {
  return Number.parseInt(
    "1" + "0".repeat(CONFIG.ASN_NAMESPACE_RANGE.toString().length - 1),
  );
}

export function isManagedNamespace(namespace: number) {
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
