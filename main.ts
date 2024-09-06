import { getFormatDescription } from "./lib/common/asn.ts";
import { CONFIG, logPaths, validateDB } from "$common/mod.ts";
import { httpApp } from "./lib/http/mod.tsx";
import metadata from "./deno.json" with { type: "json" };

if (import.meta.main) {
  console.log(`Running ${metadata.name} v${metadata.version}`);
  console.log();

  logPaths();

  console.log();

  await validateDB();
  console.log(getFormatDescription());

  console.log();

  Deno.serve({ port: CONFIG.PORT }, httpApp.fetch);
}
