import { parseArgs } from "@std/cli/parse-args";
import { validateDB } from "$common/mod.ts";

import { runServer } from "$cli/server.ts";
import { printHelp } from "$cli/help.ts";
import { runGenerate } from "$cli/generate.ts";

/**
 * Main entry point for the ASN Generator System.
 * 
 * Note that the system makes assumptions about configuration being present in the environment variables.
 * Alternatively, you can provide a `.env` file in the CWD which will be loaded automatically.
 * 
 * Apart from that, we try to expose every method that might be useful for programmatic use.
 * 
 * This enables many different use-cases, such as:
 * - Running the server programmatically in a different environment, like an existing web server.
 * - Running the generator programmatically in a different environment, like a CI/CD pipeline or a
 *   Raspberry PI connected to a label printer.
 * - Running the generator as a standalone script, for example to automate buying sets of labels.
 * - Integrating the system into a different system, such as a Slack Bot.
 * - Load Balancing the system across multiple instances.
 * - Extending the system with additional functionality.
 * 
 * Depending on your use-case, you may want to take a look at using the
 * [KV Connect Protocol](https://github.com/denoland/denokv/blob/main/proto/kv-connect.md)
 * to connect to a remote KV store for shared state. You can self-host the KV store or use a
 * managed service like [Deno Deploy](https://deno.com/deploy).
 * In this case, you'll need to configure your `DB_FILE_NAME` variable to point to the http[s] URL.
 * 
 * Alternatively, if all systems run on the same machine, you can use a shared `DATA_DIR` to store
 * the data locally.
 * 
 * ---
 * 
 * This module also serves as the main entry point for the CLI and Web Application.
 * The Web Application is nothing more than a specific CLI command that starts a web server.
 * To make it easier to run the web server, this command also gets run when no command is specified.
 * 
 * Note that this only gets run when the module is the main module (`import.meta.main === true`).
 * Therefore, the CLI won't run by itself when you import this module in another module.
 * 
 * @module
 */

export * from "$common/mod.ts";
export * from "$http/mod.tsx";
export * from "$cli/mod.ts";

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
