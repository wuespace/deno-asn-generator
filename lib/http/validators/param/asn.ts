import { validator } from "@hono/hono/validator";
import { isValidASN } from "$common/mod.ts";

export const paramASNValidator = validator("param", (value, c) => {
	const asn = value.asn;

	if (!asn) {
		return c.text("No ASN provided", 400);
	}

	if (!isValidASN(asn)) {
		return c.text("Invalid ASN provided", 400);
	}

	return { asn };
});
