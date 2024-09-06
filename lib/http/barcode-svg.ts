import * as bwip from "@metafloor/bwip-js";
import { CONFIG } from "$common/config.ts";

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
