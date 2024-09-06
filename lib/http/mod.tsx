import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";
import { jsxRenderer } from "@hono/hono/jsx-renderer";
import { serveStatic } from "@hono/hono/deno";

import { generateASN, getFormatDescription, validateASN } from "$common/mod.ts";
import metadata from "$/deno.json" with { type: "json" };

import { Wrapper } from "$http/ui/wrapper.tsx";
import { IndexPage } from "$http/ui/index.tsx";
import { createBarcodeSVG } from "$http/barcode-svg.ts";

export const httpApp = new Hono();

httpApp.use(logger());
httpApp.get(
	"/about",
	(c) => c.text(`${metadata.name} v${metadata.version} is running!`),
);
httpApp.get("/format", (c) => c.text(getFormatDescription()));
httpApp.get("/json", async (c) => c.json(await generateASN()));
httpApp.get("/static/*", serveStatic({ root: "." }));

httpApp.get("/svg/:asn", (c) => {
	const requestedASN = c.req.param("asn");

	if (!requestedASN) {
		return c.text("No ASN provided", 400);
	}

	if (!validateASN(requestedASN)) {
		return c.text("Invalid ASN provided", 400);
	}

	const barcode = createBarcodeSVG(requestedASN, !!c.req.query("embed"));

	return c.body(barcode ?? "", 200, {
		"Cache-Control": "no-cache",
		"Content-Type": "image/svg+xml",
	});
});

httpApp.get("/svg", (c) => {
	const barcode = createBarcodeSVG("0123456789", !!c.req.query("embed"));
	return c.body(barcode ?? "", 200, {
		"Cache-Control": "no-cache",
		"Content-Type": "image/svg+xml",
	});
});

httpApp.use("*", jsxRenderer(Wrapper));
httpApp.use("/", async (c) => await c.render(<IndexPage />));
