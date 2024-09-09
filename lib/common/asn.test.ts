import { assertEquals, assertObjectMatch, assertThrows } from "@std/assert";
import {
  formatASN,
  isValidASN,
  isValidCounter,
  nthNinerExtensionRange,
  parseASN,
} from "$common/asn.ts";
import type { Config } from "$common/mod.ts";

const TEST_CONFIG: Config = {
  ASN_NAMESPACE_RANGE: 50,
  ADDITIONAL_MANAGED_NAMESPACES: [{
    namespace: 60,
    label: "Test namespace",
  }],
  PORT: 0,
  ASN_PREFIX: "ASN",
  ASN_ENABLE_NAMESPACE_EXTENSION: true,
  ASN_LOOKUP_INCLUDE_PREFIX: true,
  ASN_BARCODE_TYPE: "",
  DATA_DIR: "",
  DB_FILE_NAME: "",
};

Deno.test("nthNinerExtensionRange()", async (t) => {
  await t.step("Range 1", () => {
    assertEquals(nthNinerExtensionRange(1, 1), [90, 98]);
    assertEquals(nthNinerExtensionRange(2, 1), [990, 998]);
    assertEquals(nthNinerExtensionRange(3, 1), [9990, 9998]);
  });

  await t.step("Range 10", () => {
    assertEquals(nthNinerExtensionRange(1, 10), [900, 989]);
    assertEquals(nthNinerExtensionRange(2, 10), [9900, 9989]);
    assertEquals(nthNinerExtensionRange(3, 10), [99900, 99989]);
  });

  await t.step("Range 100", () => {
    assertEquals(nthNinerExtensionRange(1, 100), [9000, 9899]);
    assertEquals(nthNinerExtensionRange(2, 100), [99000, 99899]);
    assertEquals(nthNinerExtensionRange(3, 100), [999000, 999899]);
  });
});

Deno.test("parseASN()", async (t) => {
  assertObjectMatch(parseASN(`ASN10001`, { ...TEST_CONFIG }), {
    namespace: 10,
    counter: 1,
  }, "Parse ASN with prefix");
  assertObjectMatch(parseASN(`10001`, { ...TEST_CONFIG }), {
    namespace: 10,
    counter: 1,
  }, "Parse ASN without prefix");

  await t.step("Handle invalid ASNs", () => {
    assertThrows(
      () => parseASN(`ASN100A11`, { ...TEST_CONFIG }),
      "Throw on invalid ASN",
    );
  });

  await t.step("Namespace extension", () => {
    assertObjectMatch(
      parseASN(`ASN90111`, {
        ...TEST_CONFIG,
        ASN_ENABLE_NAMESPACE_EXTENSION: false,
      }),
      {
        namespace: 90,
        counter: 111,
      },
      "Use 'raw' namespace even with leading '9' when extension is disabled",
    );
    assertObjectMatch(
      parseASN(`ASN90111`, {
        ...TEST_CONFIG,
        ASN_ENABLE_NAMESPACE_EXTENSION: true,
      }),
      {
        namespace: 901,
        counter: 11,
      },
      "Use 'extended' namespace when extension is enabled",
    );
    assertObjectMatch(
      parseASN(`990111`, {
        ...TEST_CONFIG,
        ASN_ENABLE_NAMESPACE_EXTENSION: true,
      }),
      {
        namespace: 9901,
        counter: 11,
      },
      "Use 'extended' namespace when extension is enabled, allowing for multiple '9's",
    );
  });
});

Deno.test("isValidASN()", async (t) => {
  assertEquals(
    isValidASN(`ASN10001`, { ...TEST_CONFIG }),
    true,
    "ASNs are valid with prefix",
  );
  assertEquals(
    isValidASN(`10001`, { ...TEST_CONFIG }),
    true,
    "ASNs are valid without prefix",
  );
  assertEquals(
    isValidASN(`ASN100A11`, { ...TEST_CONFIG }),
    false,
    "Invalid if the overall format is incorrect",
  );
  await t.step("Prefix configuration", () => {
    assertEquals(
      isValidASN(`XXX10011`, { ...TEST_CONFIG, ASN_PREFIX: "XXX" }),
      true,
      "Valid if the prefix matches the configuration",
    );
    assertEquals(
      isValidASN(`XXX10011`, { ...TEST_CONFIG }),
      false,
      "Invalid if the prefix doesn't match the configuration",
    );
  });
});

Deno.test("isValidCounter()", () => {
  assertEquals(
    isValidCounter(Number.MAX_SAFE_INTEGER),
    true,
    "Maximum safe integer is valid",
  );
  assertEquals(isValidCounter(1), true, "Positive integers are valid");
  assertEquals(isValidCounter(0), true, "Zero is valid");
  assertEquals(isValidCounter(-1), false, "Negative integers are invalid");
  assertEquals(
    isValidCounter(Number.MAX_VALUE),
    false,
    "Unsafely large integers are invalid",
  );
});

Deno.test("formatASN()", async (t) => {
  assertEquals(formatASN(10, 1, { ...TEST_CONFIG }), "ASN10001");
  assertEquals(formatASN(10, 1111, { ...TEST_CONFIG }), "ASN101111");
  assertEquals(
    formatASN(911, 11, {
      ...TEST_CONFIG,
      ASN_ENABLE_NAMESPACE_EXTENSION: true,
    }),
    "ASN911011",
  );
  assertEquals(
    formatASN(10, 1, { ...TEST_CONFIG, ASN_PREFIX: "XXX" }),
    "XXX10001",
  );

  // Invalid namespace
  await t.step("Invalid namespace", () => {
    assertThrows(
      () => formatASN(100, 1, { ...TEST_CONFIG, ASN_NAMESPACE_RANGE: 10 }),
      "Throw on out-of-range namespace (too large)",
    );
    assertThrows(
      () => formatASN(1, 1, { ...TEST_CONFIG, ASN_NAMESPACE_RANGE: 10 }),
      "Throw on out-of-range namespace (too small)",
    );
    assertThrows(
      () => formatASN(-1, 1, { ...TEST_CONFIG, ASN_NAMESPACE_RANGE: 10 }),
      "Throw on invalid namespace (negative)",
    );
    assertThrows(
      () =>
        formatASN(911, 11, {
          ...TEST_CONFIG,
          ASN_NAMESPACE_RANGE: 10,
          ASN_ENABLE_NAMESPACE_EXTENSION: false,
        }),
      "Throw on out-of-range namespace (too large) with extension disabled",
    );
  });

  // Invalid counter
  await t.step("Invalid counter", () => {
    assertThrows(
      () => formatASN(10, -1, { ...TEST_CONFIG, ASN_NAMESPACE_RANGE: 10 }),
      "Should throw on negative counter",
    );
  });
});
