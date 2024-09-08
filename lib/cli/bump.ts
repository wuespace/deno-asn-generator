import z from "@collinhacks/zod";
import {
  allManagedNamespaces,
  CONFIG,
  generateASN,
  isManagedNamespace,
} from "$common/mod.ts";

const bumpArgs = z.object({
  namespace: z.number({ coerce: true }).optional(),
  _: z.tuple([z.literal("bump"), z.number({ coerce: true }).min(1).int()]),
});

/**
 * Prints statistics about the ASNs.
 * @param args the arguments to the command
 * @param args.count the number of ASNs to generate (default: 1)
 */
export async function runBump(args: unknown) {
  const parsedParams = bumpArgs.parse(args);

  if (parsedParams.namespace && !isManagedNamespace(parsedParams.namespace)) {
    console.error(
      `Namespace ${parsedParams.namespace} (${CONFIG.ASN_PREFIX}${parsedParams.namespace}XXX) is not managed by the system.`,
    );
    console.error("It therefore cannot be bumped.");
    console.error(
      "Managed namespace numbers are:",
      allManagedNamespaces().join(", "),
    );
    Deno.exit(1);
  }

  const namespaces = parsedParams.namespace
    ? [parsedParams.namespace]
    : allManagedNamespaces();

  const bumpDelta = parsedParams._[1];
  const bumpedAt = new Date().toISOString();

  console.log(
    "Bumping namespaces:",
    namespaces.map((n) => `${CONFIG.ASN_PREFIX}${n}XXX`).join(", "),
  );
  console.log("---");
  await Promise.all(
    namespaces.map((namespace) =>
      generateASN(
        {
          bumpedBy: bumpDelta,
          bumpedAt,
        },
        namespace,
        bumpDelta,
      ).then((asn) => {
        console.log(
          "Bumped",
          `${CONFIG.ASN_PREFIX}${namespace}XXX. ` +
            `Next registered ASN will be ${CONFIG.ASN_PREFIX}${namespace}${
              (asn.counter + 1).toString().padStart(3, "0")
            }.`,
        );
      })
    ),
  );
  console.log("---");
  console.log("Done.");

  await Promise.resolve();
}
