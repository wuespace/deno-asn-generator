import z from "@collinhacks/zod";
import { allManagedNamespaces, CONFIG, TimeStats } from "$common/mod.ts";

const generateArgs = z.object({
  namespace: z.number({ coerce: true }).optional(),
});

/**
 * Prints statistics about the ASNs.
 * @param args the arguments to the command
 * @param args.count the number of ASNs to generate (default: 1)
 */
export async function runStats(args: unknown) {
  const parsedParams = generateArgs.parse(args);

  console.log("Calculating statistics...");
  console.log("Depending on the number of namespaces, this may take a while.");
  console.log("---");

  const namespaces = parsedParams.namespace
    ? [parsedParams.namespace]
    : allManagedNamespaces();

  const stats = await Promise.all(
    namespaces.map((v) => TimeStats.get(v)),
  );

  const strings = stats.map((stats) => {
    return `${CONFIG.ASN_PREFIX}${stats.namespace}XXX: ` + stats.toString();
  });

  console.log(strings.join("\n"));
  console.log("---");
  console.log(
    "Maximum Rate of ASN registrations per hour per namespace in the above namespaces:",
  );
  console.log(
    `Filtered to only include namespaces with more than 3 ${CONFIG.ASN_PREFIX} numbers.`,
  );

  function maxHourlyRate(sigma: number) {
    return stats
      .filter((v) => v.count > 3)
      .map((v) => v.getHighestRate(sigma))
      .reduce((prev, curr) => Math.max(prev, curr)) * 60 * 1000;
  }

  console.log(
    "1σ (68.27 %):",
    maxHourlyRate(1).toPrecision(5),
    `registered ${CONFIG.ASN_PREFIX} numbers per namespace per hour`,
  );
  console.log(
    "2σ (95.45 %):",
    maxHourlyRate(2).toPrecision(5),
    `registered ${CONFIG.ASN_PREFIX} numbers per namespace per hour`,
  );
  console.log(
    "3σ (99.73 %):",
    maxHourlyRate(3).toPrecision(5),
    `registered ${CONFIG.ASN_PREFIX} numbers per namespace per hour`,
  );
  console.log(
    "6σ (99.99 %):",
    maxHourlyRate(6).toPrecision(5),
    `registered ${CONFIG.ASN_PREFIX} numbers per namespace per hour`,
  );

  console.log(
    "When restoring a backup, bump each namespace by the hourly rate above multiplied by the number of hours since the last backup.",
    "This way, you can avoid collisions from registrations that happened after the backup.",
    "For example, if you want to restore a backup that is 24 hours old, and want to be 99.73 % sure that you won't get any conflicts,",
    "bump each namespace by the 3σ rate above multiplied by 24.",
  );

  console.log("---");

  console.log("Done.");

  await Promise.resolve();
}
