/**
 * @module
 * Various APIs surrounding the HTTP server / Web Application.
 *
 * {@link httpApp} is the main HTTP server of the web application.
 */
import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";
import { serveStatic } from "@hono/hono/deno";

import { getFormatDescription } from "$common/mod.ts";
import denojson from "$/deno.json" with { type: "json" };

import { svgRoutes } from "$http/routes/svg.ts";
import { uiRoutes } from "$http/routes/ui.tsx";
import { apiRoutes } from "$http/routes/api.ts";
import { lookupRoutes } from "$http/routes/lookup.ts";

export * from "$http/lookup-url.ts";
export * from "$http/barcode-svg.ts";
export * from "$http/asn-metadata-from-context.ts";

export type { Hono as HonoApp } from "@hono/hono";

/**
 * The main HTTP server of the web application.
 * This server is responsible for serving the web application and the API.
 *
 * @see <https://hono.dev/>
 *
 * @example
 * ```ts
 * Deno.serve(httpApp.fetch);
 * ```
 */
export const httpApp: Hono = new Hono();

httpApp.use(logger());
httpApp.get(
  "/about",
  (c) => c.text(`${denojson.name} v${denojson.version} is running!`),
);
httpApp.get("/format", (c) => c.text(getFormatDescription()));

httpApp.get("/static/*", serveStatic({ root: "." }));

httpApp.route("/api", apiRoutes);
httpApp.route("/svg", svgRoutes);
httpApp.route("/", lookupRoutes);
httpApp.route("/", uiRoutes);
