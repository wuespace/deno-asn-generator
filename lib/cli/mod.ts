/**
 * Exports all CLI command functions.
 *
 * These get called with a parsed command line argument object.
 *
 * @example
 * ```ts
 * import { parseArgs } from "@std/cli/parse-args";
 *
 * const args = parseArgs(Deno.args);
 * if (args._[0] === "generate") {
 *   await runGenerate(args);
 * }
 * ```
 *
 * All CLI command functions take `args` as `unknown` and validate it themselves.
 *
 * @module
 */

export * from "$cli/generate.ts";
export * from "$cli/server.ts";
export * from "$cli/help.ts";
