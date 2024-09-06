import { CONFIG, isValidASN } from "$common/mod.ts";

/**
 * Builds the URL to lookup the ASN based on the configuration.
 * @param asn the ASN to lookup
 * @returns the URL to lookup the ASN if the ASN lookup is enabled
 * @throws {Error} when the ASN lookup is disabled or the ASN is invalid
 */
export function getLookupURL(asn: string): string {
  const baseUrl = CONFIG.ASN_LOOKUP_URL;

  if (!baseUrl) {
    throw new Error("ASN Lookup is disabled");
  }

  if (!isValidASN(asn)) {
    throw new Error("Invalid ASN");
  }

  if (!CONFIG.ASN_LOOKUP_INCLUDE_PREFIX) {
    asn = asn.slice(CONFIG.ASN_PREFIX.length);
  }

  return baseUrl.replaceAll("{asn}", asn);
}
