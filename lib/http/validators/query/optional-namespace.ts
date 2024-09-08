import { validator } from "@hono/hono/validator";
import { z } from "@collinhacks/zod";
import { isManagedNamespace } from "$common/mod.ts";

export const optionalQueryNamespaceValidator = validator("query", (value, c) => {
	const res = z.object({
		namespace: z.number({ coerce: true }).optional().refine((v) => {
			if (v === undefined) return true;
			return isManagedNamespace(v);
		}, {
			message:
				"Unregistered namespace. Please add it to the configuration's `ADDITIONAL_MANAGED_NAMESPACES` parameter.",
		}),
	}).safeParse(value);

	if (!res.success) {
		return c.text(res.error.message, 400);
	}

	return res.data;
});
