import { CONFIG, isValidASN } from "$common/mod.ts";

export function getLookupURL(asn: string) {
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