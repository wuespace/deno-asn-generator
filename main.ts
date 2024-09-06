import { parseArgs } from "@std/cli/parse-args";
import { validateDB } from "$common/mod.ts";

import { runServer } from "$cli/server.ts";
import { printHelp } from "$cli/help.ts";
import { runGenerate } from "$cli/generate.ts";

if (import.meta.main) {
  await validateDB();
  const args = parseArgs(Deno.args);

  if (args.help) {
    printHelp();
    Deno.exit();
  }

  if (args._[0] === "generate") {
    await runGenerate(args);
  }

  if (args._[0] === "server" || args._.length === 0) {
    await runServer(args);
  }
}
