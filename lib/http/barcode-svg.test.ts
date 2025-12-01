import { assertStringIncludes } from "@std/assert";
import { createBarcodeSVG } from "./barcode-svg.ts";

Deno.test("createBarcodeSVG", () => {
  const svg = createBarcodeSVG("1234567890", false, {
    ASN_BARCODE_TYPE: "CODE128",
    PORT: 0,
    ASN_PREFIX: "",
    ASN_NAMESPACE_RANGE: 0,
    ASN_ENABLE_NAMESPACE_EXTENSION: false,
    ADDITIONAL_MANAGED_NAMESPACES: [],
    ASN_LOOKUP_INCLUDE_PREFIX: false,
    DATA_DIR: "",
    DB_FILE_NAME: "",
  });
  assertStringIncludes(svg, "<svg");
});
