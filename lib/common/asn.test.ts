import { assertEquals } from "@std/assert";
import { nthNinerExtensionRange } from "$common/asn.ts";

Deno.test("nthNinerExtensionRange()", () => {
	assertEquals(nthNinerExtensionRange(1, 1), [90, 98]);
	assertEquals(nthNinerExtensionRange(2, 1), [990, 998]);
	assertEquals(nthNinerExtensionRange(3, 1), [9990, 9998]);

	assertEquals(nthNinerExtensionRange(1, 10), [900, 989]);
	assertEquals(nthNinerExtensionRange(2, 10), [9900, 9989]);
	assertEquals(nthNinerExtensionRange(3, 10), [99900, 99989]);

	assertEquals(nthNinerExtensionRange(1, 100), [9000, 9899]);
	assertEquals(nthNinerExtensionRange(2, 100), [99000, 99899]);
	assertEquals(nthNinerExtensionRange(3, 100), [999000, 999899]);
})