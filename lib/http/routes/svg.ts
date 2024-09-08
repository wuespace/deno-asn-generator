import { Hono } from "@hono/hono";
import { generateASN } from "$common/mod.ts";
import { createBarcodeSVG } from "$http/barcode-svg.ts";
import { createMetadata } from "../mod.ts";
import { paramASNValidator } from "$http/validators/param/asn.ts";
import { optionalQueryNamespaceValidator } from "$http/validators/query/optional-namespace.ts";

export const svgRoutes = new Hono();

svgRoutes.get("/", optionalQueryNamespaceValidator, async (c) => {
  const barcode = createBarcodeSVG(
    (await generateASN(createMetadata(c), c.req.valid("query").namespace)).asn,
    !!c.req.query("embed"),
  );
  return c.body(barcode ?? "", 200, {
    "Cache-Control": "no-cache",
    "Content-Type": "image/svg+xml",
  });
});

svgRoutes.get("/:asn", paramASNValidator, (c) => {
  const { asn } = c.req.valid("param");

  const barcode = createBarcodeSVG(asn, !!c.req.query("embed"));

  return c.body(barcode ?? "", 200, {
    "Cache-Control": "no-cache",
    "Content-Type": "image/svg+xml",
  });
});
