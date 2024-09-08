import { z, type ZodBoolean } from "@collinhacks/zod";

export function zBoolString(): z.ZodEffects<ZodBoolean, boolean, unknown> {
  return z.preprocess((val) => {
    if (
      typeof val === "string" &&
      ["1", "true", "yes", "on"].includes(val.toLowerCase())
    ) return true;
    return false;
  }, z.boolean());
}
