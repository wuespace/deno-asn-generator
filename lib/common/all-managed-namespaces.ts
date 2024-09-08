import { CONFIG } from "$common/mod.ts";

/**
 * Returns a list of all managed namespaces.
 * This includes the generic namespaces and the additional managed namespaces.
 * @returns all managed namespaces
 */
export function allManagedNamespaces() {
  const minGeneric = Number.parseInt(
    "1" + "0".repeat(CONFIG.ASN_NAMESPACE_RANGE.toString().length - 1),
  );
  const maxGeneric = CONFIG.ASN_NAMESPACE_RANGE - 1;

  return [
    ...Array.from(
      { length: maxGeneric - minGeneric },
      (_, i) => i + minGeneric,
    ),
    ...CONFIG.ADDITIONAL_MANAGED_NAMESPACES.map((v) => v.namespace),
  ];
}
