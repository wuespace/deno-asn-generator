import { Hono } from "@hono/hono";
import { validator } from "@hono/hono/validator";
import { z } from "@collinhacks/zod";

import { getConfig, getLogger, isValidASN } from "$common/mod.ts";

import { getLookupURL } from "$http/mod.ts";

export const lookupRoutes = new Hono();

lookupRoutes.post(
  "/lookup",
  validator("form", (value, c) => {
    const logger = getLogger("[lookupRoutes:/lookup]");
    logger.withContext({ rawValue: value });
    const parsed = z.object({
      asn: z.string({ coerce: true }).min(1).regex(/^\d+$/),
    }).safeParse(value);

    if (!parsed.success) {
      logger.withError(parsed.error).warn("Invalid ASN.");
      return c.text("Invalid ASN. " + parsed.error.message, 400);
    }

    return parsed.data;
  }),
  (c) => {
    const asn = getConfig().ASN_PREFIX + c.req.valid("form").asn;
    return c.redirect("/go/" + asn);
  },
);

lookupRoutes.get(
  "/go/:asn",
  validator("param", (value, c) => {
    const logger = getLogger("[lookupRoutes:/go/:asn]");
    logger.withContext({ rawValue: value });
    if (!value || !isValidASN(value.asn)) {
      logger.warn("Invalid ASN");
      return c.text("Invalid ASN", 400);
    }
    return value;
  }),
  (c) => {
    const asn = c.req.valid("param").asn;

    if (!getConfig().ASN_LOOKUP_URL) {
      return c.text("ASN Lookup is disabled", 400);
    }

    return c.redirect(getLookupURL(asn));
  },
);
