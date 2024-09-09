import type { Context } from "@hono/hono";
import denojson from "$/deno.json" with { type: "json" };

export type { Context as HonoContext };

/**
 * Builds the metadata for an ASN from the context of an HTTP request.
 * @param c the context of the HTTP request
 * @returns ASN metadata for ASNs generated by an HTTP request
 */
export function createMetadata(c: Context): Record<string, unknown> {
  return {
    client: "web",
    path: c.req.path,
    denojson,
  };
}
