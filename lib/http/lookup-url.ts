import { type Config, getConfig, getLogger, isValidASN } from "$common/mod.ts";

/**
 * Builds the URL to lookup the ASN based on the configuration.
 * @param asn the ASN to lookup
 * @returns the URL to lookup the ASN if the ASN lookup is enabled
 * @throws {Error} when the ASN lookup is disabled or the ASN is invalid
 */
export function getLookupURL(
  asn: string,
  config: Config = getConfig(),
): string {
  const logger = getLogger("[getLookupURL]")
    .withContext({ asn, config });
  const baseUrl = config.ASN_LOOKUP_URL;

  if (!baseUrl) {
    logger.warn("ASN Lookup is disabled");
    throw new Error("ASN Lookup is disabled");
  }

  if (!isValidASN(asn)) {
    logger.warn("Invalid ASN");
    throw new Error("Invalid ASN");
  }

  if (!config.ASN_LOOKUP_INCLUDE_PREFIX) {
    asn = asn.slice(config.ASN_PREFIX.length);
  }
  logger.withContext({ asn });

  return baseUrl.replaceAll("{asn}", asn);
}
