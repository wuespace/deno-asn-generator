import { generateASN } from "$common/asn.ts";
import z from "@collinhacks/zod";

const generateArgs = z.object({
	count: z.number().default(1),
});

export async function runGenerate(args: unknown) {
	const parsedArgs = generateArgs.parse(args);

	new Array(parsedArgs.count).fill(0).map(() =>
		generateASN({
			client: "cli",
			generatedCount: parsedArgs.count,
		}).then(asn => asn.asn)
	).forEach(async (x) => console.log(await x));
}
