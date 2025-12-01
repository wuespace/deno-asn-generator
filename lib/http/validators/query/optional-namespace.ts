import { validator } from "@hono/hono/validator";
import { z } from "@collinhacks/zod";
import { getLogger, isManagedNamespace } from "$common/mod.ts";

export const optionalQueryNamespaceValidator = validator(
  "query",
  (value, c) => {
    const logger = getLogger("[optionalQueryNamespaceValidator]");
    logger.withContext({ rawValue: value });
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
      logger.withError(res.error).warn("Invalid namespace provided");
      return c.text(res.error.message, 400);
    }

    return res.data;
  },
);
