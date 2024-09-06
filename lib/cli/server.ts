import { z } from "@collinhacks/zod";
import { CONFIG, logPaths } from "$common/mod.ts";
import { httpApp } from "$http/mod.tsx";
import metadata from "$/deno.json" with { type: "json" };

const serverArgs = z.object({
	port: z.number().default(CONFIG.PORT),
	host: z.string().default("localhost"),
});

export function runServer(args: unknown) {
	console.log(`Running ${metadata.name} v${metadata.version}`);
	console.log();

	const parsedArgs = serverArgs.parse(args);

	console.log(`Starting server on ${parsedArgs.host}:${parsedArgs.port}`);

	console.log("Environment Configuration:", CONFIG);
	console.log("Arguments:", parsedArgs);
	console.log("Paths:");
	logPaths();

	console.log();
	Deno.serve(
		{ port: parsedArgs.port, hostname: parsedArgs.host },
		httpApp.fetch,
	);
}
