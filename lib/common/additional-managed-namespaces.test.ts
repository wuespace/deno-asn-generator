import { assertEquals } from "@std/assert";
import {
  deserializeAdditionalManagedNamespace,
  deserializeAdditionalManagedNamespaces,
  isValidAdditionalManagedNamespace,
  serializeAdditionalManagedNamespace,
  serializeAdditionalManagedNamespaces,
} from "$common/additional-managed-namespaces.ts";
import type { Config } from "$common/config.ts";

const TEST_CONFIG: Config = {
  PORT: 0,
  ASN_PREFIX: "ASN",
  ASN_NAMESPACE_RANGE: 3,
  ASN_ENABLE_NAMESPACE_EXTENSION: false,
  ADDITIONAL_MANAGED_NAMESPACES: [],
  ASN_LOOKUP_INCLUDE_PREFIX: false,
  ASN_BARCODE_TYPE: "",
  DATA_DIR: "",
  DB_FILE_NAME: "",
};

Deno.test("serializeAdditionalManagedNamespace", () => {
  assertEquals(
    serializeAdditionalManagedNamespace({ namespace: 123, label: "foo" }),
    "<123 foo>",
  );

  assertEquals(
    serializeAdditionalManagedNamespace({
      namespace: 456,
      label: "ABC (A / B / C)",
    }),
    "<456 ABC (A / B / C)>",
  );
});

Deno.test("deserializeAdditionalManagedNamespace", () => {
  assertEquals(
    deserializeAdditionalManagedNamespace("<123 foo>"),
    { namespace: 123, label: "foo" },
  );
  assertEquals(
    deserializeAdditionalManagedNamespace("<456 ABC (A / B / C)>"),
    { namespace: 456, label: "ABC (A / B / C)" },
  );
});

Deno.test("serializeAdditionalManagedNamespaces", () => {
  assertEquals(
    serializeAdditionalManagedNamespaces([
      { namespace: 123, label: "foo" },
      { namespace: 456, label: "bar" },
    ]),
    "<123 foo><456 bar>",
  );

  assertEquals(
    serializeAdditionalManagedNamespaces([
      { namespace: 123, label: "foo" },
      { namespace: 456, label: "ABC (A / B / C)" },
    ]),
    "<123 foo><456 ABC (A / B / C)>",
  );

  assertEquals(
    serializeAdditionalManagedNamespaces([]),
    "",
  );
});
Deno.test("deserializeAdditionalManagedNamespaces", () => {
  assertEquals(
    deserializeAdditionalManagedNamespaces("<123 foo><456 bar>"),
    [
      { namespace: 123, label: "foo" },
      { namespace: 456, label: "bar" },
    ],
  );

  assertEquals(
    deserializeAdditionalManagedNamespaces("<123 foo><456 ABC (A / B / C)>"),
    [
      { namespace: 123, label: "foo" },
      { namespace: 456, label: "ABC (A / B / C)" },
    ],
  );

  assertEquals(
    deserializeAdditionalManagedNamespaces(
      "<123 foo> <456 ABC (A / B / C)>, , <457 Test>",
    ),
    [
      { namespace: 123, label: "foo" },
      { namespace: 456, label: "ABC (A / B / C)" },
      { namespace: 457, label: "Test" },
    ],
  );

  assertEquals(
    deserializeAdditionalManagedNamespaces(""),
    [],
  );
});

Deno.test("isValidAdditionalManagedNamespace", async (t) => {
  await t.step("Single Digit Namespace", () => {
    assertEquals(
      isValidAdditionalManagedNamespace(5, {
        ...TEST_CONFIG,
        ADDITIONAL_MANAGED_NAMESPACES: [{
          namespace: 5,
          label: "Test namespace",
        }],
      }),
      true,
      "Registered managed namespace (5) should be valid for range 3",
    );
    assertEquals(
      isValidAdditionalManagedNamespace(6, { ...TEST_CONFIG }),
      true,
      "Unregistered managed namespace (6) should be valid for range 3",
    );
    assertEquals(
      isValidAdditionalManagedNamespace(22, { ...TEST_CONFIG }),
      false,
      "Unregistered managed namespace (22) should be invalid for range 3 (too many digits)",
    );
    assertEquals(
      isValidAdditionalManagedNamespace(0, { ...TEST_CONFIG }),
      false,
      "Unregistered managed namespace (0) should be invalid for range 3 (too small)",
    );
    assertEquals(
      isValidAdditionalManagedNamespace(-1, { ...TEST_CONFIG }),
      false,
      "Unregistered managed namespace (-1) should be invalid for range 3 (negative)",
    );
  });

  await t.step("Double Digit Namespace", () => {
    assertEquals(
      isValidAdditionalManagedNamespace(50, {
        ...TEST_CONFIG,
        ASN_NAMESPACE_RANGE: 20,
        ADDITIONAL_MANAGED_NAMESPACES: [
          { namespace: 50, label: "Test namespace" },
        ],
      }),
      true,
      "Registered managed namespace (50) should be valid for range 20",
    );
    assertEquals(
      isValidAdditionalManagedNamespace(63, {
        ...TEST_CONFIG,
        ASN_NAMESPACE_RANGE: 20,
      }),
      true,
      "Unregistered managed namespace (63) should be valid for range 20",
    );
    assertEquals(
      isValidAdditionalManagedNamespace(222, {
        ...TEST_CONFIG,
        ASN_NAMESPACE_RANGE: 20,
      }),
      false,
      "Unregistered managed namespace (222) should be invalid for range 20 (too many digits)",
    );
    assertEquals(
      isValidAdditionalManagedNamespace(1, {
        ...TEST_CONFIG,
        ASN_NAMESPACE_RANGE: 20,
      }),
      false,
      "Unregistered managed namespace (1) should be invalid for range 20 (too few digits)",
    );
    assertEquals(
      isValidAdditionalManagedNamespace(0, {
        ...TEST_CONFIG,
        ASN_NAMESPACE_RANGE: 20,
      }),
      false,
      "Unregistered managed namespace (0) should be invalid for range 20 (too small)",
    );
    assertEquals(
      isValidAdditionalManagedNamespace(-1, {
        ...TEST_CONFIG,
        ASN_NAMESPACE_RANGE: 20,
      }),
      false,
      "Unregistered managed namespace (-1) should be invalid for range 20 (negative)",
    );
  });

  await t.step(
    "Generic Namespace Range isn't valid for additional managed namespaces",
    () => {
      assertEquals(
        isValidAdditionalManagedNamespace(18, {
          ...TEST_CONFIG,
          ASN_NAMESPACE_RANGE: 20,
        }),
        false,
        "Generic namespace range should not be valid for additional managed namespaces",
      );
      assertEquals(
        isValidAdditionalManagedNamespace(2, {
          ...TEST_CONFIG,
          ASN_NAMESPACE_RANGE: 3,
        }),
        false,
        "Generic namespace range should not be valid for additional managed namespaces",
      );
    },
  );

  await t.step("ASN_ENABLE_NAMESPACE_EXTENSION", () => {
    assertEquals(
      isValidAdditionalManagedNamespace(9, { ...TEST_CONFIG }),
      true,
      'Namespace "9" should be valid for range 3 without extension',
    );
    assertEquals(
      isValidAdditionalManagedNamespace(9, {
        ...TEST_CONFIG,
        ASN_ENABLE_NAMESPACE_EXTENSION: true,
      }),
      false,
      'Namespace "9" should be invalid for range 3 with extension',
    );
    assertEquals(
      isValidAdditionalManagedNamespace(91, {
        ...TEST_CONFIG,
        ASN_ENABLE_NAMESPACE_EXTENSION: true,
      }),
      true,
      'Namespace "91" should be valid for range 3 with extension',
    );
  });
});
