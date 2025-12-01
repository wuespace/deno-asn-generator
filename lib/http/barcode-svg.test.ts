import { Config } from "$common/config.ts";
import { assertStringIncludes } from "@std/assert";
import { createBarcodeSVG } from "./barcode-svg.ts";

const config = (code: Config["ASN_BARCODE_TYPE"]) => ({
  ASN_BARCODE_TYPE: code,
  PORT: 0,
  ASN_PREFIX: "",
  ASN_NAMESPACE_RANGE: 0,
  ASN_ENABLE_NAMESPACE_EXTENSION: false,
  ADDITIONAL_MANAGED_NAMESPACES: [],
  ASN_LOOKUP_INCLUDE_PREFIX: false,
  DATA_DIR: "",
  DB_FILE_NAME: "",
});

Deno.test("createBarcodeSVG", async (t) => {
  const codeTypes = [
    "CODE128",
    "CODE39",
    "CODE93",
  ];

  for (const codeType of codeTypes) {
    await t.step(`codeType: ${codeType}`, async (t) => {
      await t.step("with text", () => {
        const svg = createBarcodeSVG("1234567890", true, config(codeType as Config["ASN_BARCODE_TYPE"]));
        assertStringIncludes(svg, "<svg");
      });
      await t.step("without text", () => {
        const svg = createBarcodeSVG("1234567890", false, config(codeType as Config["ASN_BARCODE_TYPE"]));
        assertStringIncludes(svg, "<svg");
      });
    });
  }
});
