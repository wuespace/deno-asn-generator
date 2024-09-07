import { assertEquals } from "@std/assert";
import {
  deserializeAdditionalManagedNamespace,
  deserializeAdditionalManagedNamespaces,
  serializeAdditionalManagedNamespace,
  serializeAdditionalManagedNamespaces,
} from "./additional-managed-namespaces.ts";

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
