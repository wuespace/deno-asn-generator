/**
 * The ASN rendered by the current page
 * @type {import("$common/asn.ts").ASNData | undefined}
 */
const asn = globalThis.asn;

init()
  .then(() => console.log("✅ Interactive Elements initialized"))
  .catch((err) =>
    console.error(
      "🛑 An error occured while initializing Interactive Elements",
      err,
    )
  );

async function init() {
  console.log("⌚️ Initializing Interactive Elements...");
  if (!asn) {
    console.warn("ASN not found");
    return;
  }

  console.debug("ASN found:", asn);

  globalThis.copy = () => {
    navigator.clipboard.writeText(asn.asn).then(() => {
      console.log("✅ Copied ASN to clipboard");
    });
  };

  globalThis.downloadBarcode = () => {
    // TODO: Implement barcode download
  };

  await Promise.resolve();
}
