import { assertEquals } from "@std/assert";
import type { Config } from "$common/mod.ts";
import {
  allManagedNamespaces,
  getMaximumGenericRangeNamespace,
  getMinimumGenericRangeNamespace,
  isManagedNamespace,
  isValidNamespace,
} from "$common/namespaces.ts";

const TEST_CONFIG: Config = {
  ASN_NAMESPACE_RANGE: 3,
  ADDITIONAL_MANAGED_NAMESPACES: [{
    namespace: 5,
    label: "Test namespace",
  }],
  PORT: 0,
  ASN_PREFIX: "ASN",
  ASN_ENABLE_NAMESPACE_EXTENSION: true,
  ASN_LOOKUP_INCLUDE_PREFIX: true,
  ASN_BARCODE_TYPE: "",
  DATA_DIR: "",
  DB_FILE_NAME: ""
};

Deno.test("getMaximumGenericRangeNamespace()", () => {
  assertEquals(getMaximumGenericRangeNamespace({ ...TEST_CONFIG }), 2);
  assertEquals(
    getMaximumGenericRangeNamespace({
      ...TEST_CONFIG,
      ASN_NAMESPACE_RANGE: 50,
    }),
    49,
  );
});

Deno.test("getMinimumGenericRangeNamespace()", () => {
  assertEquals(getMinimumGenericRangeNamespace({ ...TEST_CONFIG }), 1);
  assertEquals(
    getMinimumGenericRangeNamespace({
      ...TEST_CONFIG,
      ASN_NAMESPACE_RANGE: 50,
    }),
    10,
  );
});

Deno.test("isValidNamespace()", async (t) => {
  await t.step("Valid", () => {
    assertEquals(
      isValidNamespace(1, { ...TEST_CONFIG }),
      true,
      "1 is valid for range 3",
    );
    assertEquals(
      isValidNamespace(10, { ...TEST_CONFIG, ASN_NAMESPACE_RANGE: 20 }),
      true,
      "10 is valid for range 20",
    );
  });

  await t.step("Invalid", () => {
    assertEquals(
      isValidNamespace(10, { ...TEST_CONFIG }),
      false,
      "10 is invalid for range 3",
    );
    assertEquals(
      isValidNamespace(100, { ...TEST_CONFIG }),
      false,
      "100 is invalid for range 3",
    );
  });

  await t.step("Namespace extension", () => {
    assertEquals(
      isValidNamespace(91, {
        ...TEST_CONFIG,
        ASN_ENABLE_NAMESPACE_EXTENSION: true,
      }),
      true,
      "91 is valid for range 3 with namespace extension enabled",
    );
    assertEquals(
      isValidNamespace(91, {
        ...TEST_CONFIG,
        ASN_NAMESPACE_RANGE: 50,
        ASN_ENABLE_NAMESPACE_EXTENSION: false,
      }),
      true,
      "91 is valid for range 50 with namespace extension disabled",
    );
    assertEquals(
      isValidNamespace(9, {
        ...TEST_CONFIG,
        ASN_ENABLE_NAMESPACE_EXTENSION: true,
      }),
      false,
      "9 is invalid for range 3 with namespace extension enabled",
    );
  });
});

Deno.test("isManagedNamespace()", () => {
  assertEquals(
    isManagedNamespace(1, { ...TEST_CONFIG }),
    true,
    "Generic namespace is managed",
  );
  assertEquals(
    isManagedNamespace(2, { ...TEST_CONFIG }),
    true,
    "Generic namespace is managed",
  );
  assertEquals(
    isManagedNamespace(3, { ...TEST_CONFIG }),
    false,
    "Unregistered non-generic namespace is not managed",
  );
  assertEquals(
    isManagedNamespace(5, { ...TEST_CONFIG }),
    true,
    "Registered non-generic namespace is managed",
  );
});

Deno.test("allManagedNamespaces()", () => {
  assertEquals(
    allManagedNamespaces({ ...TEST_CONFIG }),
    [1, 2, 5],
    "Include generic and additional managed namespaces",
  );
  assertEquals(
    allManagedNamespaces({
      ...TEST_CONFIG,
      ADDITIONAL_MANAGED_NAMESPACES: [],
    }),
    [1, 2],
    "Include only generic managed namespaces if no additional namespaces are registered",
  );
  assertEquals(
    allManagedNamespaces({
      ...TEST_CONFIG,
      ASN_NAMESPACE_RANGE: 50,
      ADDITIONAL_MANAGED_NAMESPACES: [],
    }),
    new Array(40).fill(0).map((_, i) => i + 10),
    "Also works with larger ranges",
  );
});
