import { validator } from "@hono/hono/validator";
import { isValidASN } from "$common/mod.ts";
import { getLogger } from "$common/log.ts";

export const paramValidASNValidator = validator("param", (value, c) => {
  const logger = getLogger("[paramValidASNValidator]");
  const asn = value.asn;
  logger.withContext({ asn });

  if (!asn) {
    logger.warn("No ASN provided");
    return c.text("No ASN provided", 400);
  }

  if (!isValidASN(asn)) {
    logger.warn("Invalid ASN provided");
    return c.text("Invalid ASN provided", 400);
  }

  return { asn };
});
