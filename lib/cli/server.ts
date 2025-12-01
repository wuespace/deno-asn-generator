import metadata from "$/deno.json" with { type: "json" };
import { getLogger } from "$common/log.ts";
import { getConfig, getDataDirectoryPath, getDatabasePath } from "$common/mod.ts";
import { z } from "@collinhacks/zod";
import { httpApp } from "../http/mod.ts";

/**
 * Runs the web server.
 * @param args the arguments to the command
 * @param args.port the port to listen on (default: the PORT environment variable)
 * @param args.host the hostname to listen on (default: 0.0.0.0)
 */
export function runServer(args: unknown): Promise<void> {
  const logger = getLogger("[cli/server]");
  try {
    const serverArgs = z.object({
      port: z.number().default(getConfig().PORT),
      host: z.string().default("0.0.0.0"),
    });
    logger.withContext({
      args, metadata: {
        name: metadata.name, version: metadata.version
      }
    });

    const parsedArgs = serverArgs.parse(args);
    logger.withContext({ parsedArgs });

    const config = getConfig();
    logger.withContext({ config });

    logger.withContext({
      dataDirectoryPath: getDataDirectoryPath(config),
      dbFilePath: getDatabasePath(config),
    })


    const ac = new AbortController();
    const handler = (signal: Deno.Signal) => {
      getLogger().withMetadata({ signal }).info(`Caught signal. Closing server...`);
      ac.abort(signal);
    };
    (["SIGHUP", "SIGINT", "SIGTERM"] as Deno.Signal[]).forEach((signal) =>
      Deno.addSignalListener(signal, () => handler(signal))
    );

    const server = Deno.serve(
      {
        port: parsedArgs.port, hostname: parsedArgs.host, signal: ac.signal, onListen: listen => {

          logger.withMetadata({ listen }).info("Deno ASN Generator is running!");
        }
      },
      httpApp.fetch,
    );
    return server.finished;
  } catch (error) {
    logger.withError(error).fatal("Failed to start server");
    return Promise.reject(error);
  }
}
