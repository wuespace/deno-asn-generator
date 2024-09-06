import { generateASN, getFormatDescription } from "./lib/common/asn.ts";
import { CONFIG, getCounterPath, validateDB } from "$common/mod.ts";
import { httpApp } from "./lib/http/mod.tsx";

if (import.meta.main) {
  await validateDB();
  const asn = await Promise.all([generateASN(), generateASN(), generateASN()]);
  console.log(asn);
  console.log(getCounterPath(asn[2].namespace, asn[2].counter));
  console.log(getFormatDescription());

  Deno.serve({ port: CONFIG.PORT }, httpApp.fetch);
}
