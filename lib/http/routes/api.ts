import { Hono } from "@hono/hono";

import { generateASN } from "$common/mod.ts";

import { createMetadata } from "$http/mod.ts";
import { optionalQueryNamespaceValidator } from "$http/validators/query/optional-namespace.ts";

export const apiRoutes = new Hono();

apiRoutes.get(
  "/asn",
  optionalQueryNamespaceValidator,
  async (c) =>
    c.json(
      await generateASN(
        createMetadata(c),
        c.req.valid("query").namespace,
      ),
    ),
);

apiRoutes.get(
  "/asn/:asn",
  (c) => c.text("Not implemented yet", 501), // TODO: Implement this route
);
