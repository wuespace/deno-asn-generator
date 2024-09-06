import * as bwip from "@metafloor/bwip-js";
import { CONFIG } from "$common/config.ts";

/**
 * Creates an SVG barcode for the given data and current configuration.
 * @param data the data to encode in the barcode
 * @param embedded whether the barcode gets embedded on the page or viewed as a standalone image
 * @returns an SVG string representing the barcode, which also includes the human-readable text if `embedded` is `false`
 */
export function createBarcodeSVG(data: string, embedded = false): string {
  return bwip.toSVG({
    bcid: CONFIG.ASN_BARCODE_TYPE, // Barcode type
    text: data, // Text to encode
    scale: 3, // 3x scaling factor
    height: 10, // Bar height, in millimeters
    includetext: !embedded, // Show human-readable text
    textxalign: "center", // Always good to set this
  });
}
