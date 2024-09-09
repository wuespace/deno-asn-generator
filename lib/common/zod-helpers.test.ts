import { assertEquals } from "@std/assert";
import { zBoolString } from "$common/zod-helpers.ts";

Deno.test("zBoolString", async (t) => {
  const truthyValues = ["1", "true", "yes", "on", "enabled"];
  const falsyValues = ["0", "false", "no", "off", "disabled"];
  const invalidValues = ["", "2", "foo", "bar", "baz"];

  await t.step("true for truthy values", () => {
    for (const value of truthyValues) {
      assertEquals(
        zBoolString().parse(value),
        true,
        `${value} should resolve to true`,
      );
      assertEquals(
        zBoolString().parse(value.toUpperCase()),
        true,
        `${value.toUpperCase()} should resolve to true`,
      );
    }
  });
  await t.step("false for falsy values", () => {
    for (const value of falsyValues) {
      assertEquals(
        zBoolString().parse(value),
        false,
        `${value} should resolve to false`,
      );
      assertEquals(
        zBoolString().parse(value.toUpperCase()),
        false,
        `${value.toUpperCase()} should resolve to false`,
      );
    }
  });
  await t.step("false for invalid values", () => {
    for (const value of invalidValues) {
      assertEquals(
        zBoolString().parse(value),
        false,
        `${value} should resolve to false`,
      );
      assertEquals(
        zBoolString().parse(value.toUpperCase()),
        false,
        `${value.toUpperCase()} should resolve to false`,
      );
    }
  });
});
