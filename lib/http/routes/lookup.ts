import { Hono } from "@hono/hono";
import { validator } from "@hono/hono/validator";
import { z } from "@collinhacks/zod";

import { CONFIG, isValidASN } from "$common/mod.ts";

import { getLookupURL } from "$http/mod.ts";

export const lookupRoutes = new Hono();

lookupRoutes.post(
  "/lookup",
  validator("form", (value, c) => {
    const parsed = z.object({
      asn: z.string({ coerce: true }).min(1).regex(/^\d+$/),
    }).safeParse(value);

    if (!parsed.success) {
      return c.text("Invalid ASN. " + parsed.error.message, 400);
    }

    return parsed.data;
  }),
  (c) => {
    const asn = CONFIG.ASN_PREFIX + c.req.valid("form").asn;
    return c.redirect("/go/" + asn);
  },
);

lookupRoutes.get(
  "/go/:asn",
  validator("param", (value, c) => {
    if (!value || !isValidASN(value.asn)) {
      return c.text("Invalid ASN", 400);
    }
    return value;
  }),
  (c) => {
    const asn = c.req.valid("param").asn;

    if (!CONFIG.ASN_LOOKUP_URL) {
      return c.text("ASN Lookup is disabled", 400);
    }

    return c.redirect(getLookupURL(asn));
  },
);
