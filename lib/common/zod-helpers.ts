import { z, type ZodBoolean } from "@collinhacks/zod";

/**
 * Parses a boolean from a string.
 * Values that are considered true are: "1", "true", "yes", "on", "enabled".
 * This is case-insensitive.
 * @returns a Zod schema that parses a boolean from a string.
 */
export function zBoolString(): z.ZodEffects<ZodBoolean, boolean, unknown> {
  return z.preprocess((val) => {
    if (
      typeof val === "string" &&
      ["1", "true", "yes", "on", "enabled"].includes(val.toLowerCase())
    ) return true;
    return false;
  }, z.boolean());
}

export function toBoolean(value: string | undefined): boolean | undefined {
  if (
    value === undefined ||
    value === ""
  ) return undefined;

  return ["1", "true", "yes", "on", "enabled"].includes(value.toLowerCase());
}

export function toNumber(value: string | undefined): number | undefined {
  if (
    value === undefined ||
    value === ""
  ) return undefined;

  return Number(value);
}
