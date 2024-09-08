import { Hono } from "@hono/hono";
import { jsxRenderer } from "@hono/hono/jsx-renderer";

import { CONFIG, generateASN } from "$common/mod.ts";

import { createMetadata } from "../mod.ts";

import { Wrapper } from "$http/ui/wrapper.tsx";
import { IndexPage } from "$http/ui/index.tsx";
import { ASNPage } from "$http/ui/asn.tsx";
import { optionalQueryNamespaceValidator } from "../validators/query/optional-namespace.ts";

export const uiRoutes = new Hono();

uiRoutes.use("*", jsxRenderer(Wrapper));

uiRoutes.get(
	"/",
	async (c) =>
		await c.render(
			<IndexPage config={CONFIG} />,
		),
);

uiRoutes.get(
	"/asn",
	optionalQueryNamespaceValidator,
	async (c) => {
		const namespace = c.req.valid("query").namespace;

		return await c.render(
			<ASNPage
				asn={await generateASN(
					createMetadata(c),
					namespace,
				)}
			/>,
		);
	},
);
