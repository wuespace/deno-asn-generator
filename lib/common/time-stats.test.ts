import { TimeStats } from "$common/time-stats.ts";
import { assertAlmostEquals, assertEquals } from "@std/assert";

Deno.test("TimeStats", () => {
  const stats = TimeStats.empty(0);
  assertEquals(stats.getHighestRate(2), 0);
  const stats2 = stats.withNewTimestamp();
  assertAlmostEquals(stats2.avg, 10000, 100);
  assertAlmostEquals(stats2.sd, 0, 10);
  assertEquals(stats2.count, 1);
  const stats3 = stats2.withNewTimestamp();
  assertAlmostEquals(stats3.avg, 5000, 50);
  assertAlmostEquals(stats3.sd, 5000, 50);
  const stats4 = stats3.withNewTimestamp();
  assertAlmostEquals(stats4.avg, 3333, 33);
  assertAlmostEquals(stats4.sd, 4714, 47);
  const stats5 = stats4
    .withNewTimestamp()
    .withNewTimestamp()
    .withNewTimestamp()
    .withNewTimestamp()
    .withNewTimestamp()
    .withNewTimestamp()
    .withNewTimestamp();
  assertAlmostEquals(stats5.avg, 1000, 10);
  assertAlmostEquals(stats5.sd, 3000, 30);
});
