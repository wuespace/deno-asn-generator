import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";
import { jsxRenderer } from "@hono/hono/jsx-renderer";
import { serveStatic } from "@hono/hono/deno";
import { validator } from "@hono/hono/validator";

import {
	CONFIG,
	generateASN,
	getFormatDescription,
	isValidASN,
} from "$common/mod.ts";
import metadata from "$/deno.json" with { type: "json" };

import { Wrapper } from "$http/ui/wrapper.tsx";
import { IndexPage } from "$http/ui/index.tsx";
import { createBarcodeSVG } from "$http/barcode-svg.ts";
import { z } from "@collinhacks/zod";
import { getLookupURL } from "$http/lookup-url.ts";

export const httpApp = new Hono();

httpApp.use(logger());
httpApp.get(
	"/about",
	(c) => c.text(`${metadata.name} v${metadata.version} is running!`),
);
httpApp.get("/format", (c) => c.text(getFormatDescription()));
httpApp.get("/json", async (c) => c.json(await generateASN()));

httpApp.post(
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

httpApp.get(
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

httpApp.get("/static/*", serveStatic({ root: "." }));

httpApp.get("/svg/:asn", (c) => {
	const requestedASN = c.req.param("asn");

	if (!requestedASN) {
		return c.text("No ASN provided", 400);
	}

	if (!isValidASN(requestedASN)) {
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
