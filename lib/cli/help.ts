export function printHelp() {
	const cmd = Deno.args[0];
	console.log(`
Usage: ${cmd} [command] [options]

Commands:
  server          Start the server (default)
    --port <port> Port to listen on (defaults to the PORT environment variable)
    --host <host> Hostname to listen on (defaults to localhost)
  generate        Generate new ASNs
    --count <n>   Number of ASNs to generate (defaults to 1)

Options:
  --help  Show this help message
`.trim());
}
