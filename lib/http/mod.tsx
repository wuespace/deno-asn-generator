import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";
import { jsxRenderer } from "@hono/hono/jsx-renderer";
import { serveStatic } from "@hono/hono/deno";
import { generateASN } from "$common/mod.ts";
import metadata from "$/deno.json" with { type: "json" };

import { Wrapper } from "./ui/wrapper.tsx";
import { IndexPage } from "$http/ui/index.tsx";

export const httpApp = new Hono();

httpApp.use(logger());
httpApp.get(
	"/about",
	(c) => c.text(`${metadata.name} v${metadata.version} is running!`),
);
httpApp.get("/json", async (c) => c.json(await generateASN()));
httpApp.get("/static/*", serveStatic({ root: "." }));

httpApp.use("*", jsxRenderer(Wrapper));
httpApp.use("/", async (c) => await c.render(<IndexPage />));
