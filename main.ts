import { generateASN, getFormatDescription } from "./lib/common/asn.ts";
import { validateDB } from "./lib/common/config.ts";
import { getCounterPath } from "./lib/common/mod.ts";

if (import.meta.main) {
  await validateDB();
  const asn = await Promise.all([generateASN(), generateASN(), generateASN()]);
  console.log(asn);
  console.log(getCounterPath(asn[2].namespace, asn[2].counter));
  console.log(getFormatDescription());
}
