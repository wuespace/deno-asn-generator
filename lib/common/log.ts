import { AsyncLocalStorage } from "node:async_hooks";
import { ConsoleTransport, type ILogLayer, LogLayer } from "loglayer";
import { getSimplePrettyTerminal } from "@loglayer/transport-simple-pretty-terminal";
import process from "node:process";
import { createMiddleware } from "@hono/hono/factory";
import { serializeError } from "serialize-error";

export type { createMiddleware } from "@hono/hono/factory";

const isDevelopment = process.env.DEVELOPMENT === "true" ||
  process.env.ENVIRONMENT === "development";

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: [
    getSimplePrettyTerminal({
      runtime: "node",
      viewMode: "expanded",
      enabled: isDevelopment,
      collapseArrays: false,
    }),
    new ConsoleTransport({
      enabled: !isDevelopment,
      // @ts-expect-error Deno type incompatibility
      logger: console,
      stringify: true,
      dateIsoString: true,
      dateField: "timestamp",
      levelField: "level",
      messageField: "message",
    }),
  ],
});
const ctx = new AsyncLocalStorage<ILogLayer>();

/**
 * Obtain a logger layer scoped to the current async context, falling back to a global logger.
 *
 * If an async context store is available (via `ctx.getStore()`), the function returns that
 * store as the `ILogLayer`. If a `prefix` is provided, a child logger is created and
 * prefixed via `store.child().withPrefix(prefix)`. If no store is present, the global
 * `log` instance is used, optionally creating a prefixed child via `log.child().withPrefix(prefix)`.
 *
 * @param prefix - Optional string to prefix log messages produced by the returned logger.
 * @returns An `ILogLayer` representing the context-aware or global logger (possibly a prefixed child).
 *
 * @example
 * const logger = getLogger('my-module');
 * logger.info('initialized');
 *
 * @remarks
 * This function does not create or modify the async context itself; it only reads the current
 * store. The exact behavior of `child()` and `withPrefix()` depends on the `ILogLayer` implementation.
 */
export function getLogger(prefix?: string): ILogLayer {
  const store = ctx.getStore();
  if (store) {
    return prefix ? store.child().withPrefix(prefix) : store;
  }
  return prefix ? log.child().withPrefix(prefix) : log;
}

/**
 * Run a synchronous operation with an augmented logging context.
 *
 * Creates a child logger from the global logger, attaches the provided
 * context to it, and executes the provided function using the logging
 * context (via ctx.run). Any logging performed while `fn` executes will
 * include the supplied context.
 *
 * @template T - The return type of the provided function.
 * @param context - Key/value pairs to attach to the child logger's context.
 * @param fn - A synchronous callback to execute while the logging context is active.
 *             The callback's return value is returned to the caller.
 * @returns The value returned by `fn`.
 * @throws Any exception thrown by `fn` is propagated to the caller.
 *
 * @remarks
 * - The function is generic and returns whatever `fn` returns.
 * - The logging context is applied only for the duration of `fn`; after `fn`
 *   completes (or throws) the previous context is restored.
 * - If `fn` returns a Promise, that Promise is returned as-is; ensure the
 *   underlying context propagation mechanism supports async boundaries if
 *   you expect context to be preserved across awaits.
 *
 * @example
 * runWithLogContext({ requestId: 'abc123' }, () => {
 *   logger.info('processing request');
 * });
 */
export function runWithLogContext<T>(
  context: Record<string, unknown>,
  fn: () => T,
): T {
  return ctx.run(getLogger().child().withContext(context), fn);
}

/**
 * Middleware that attaches a per-request logger and request ID to the request/response lifecycle.
 *
 * Behavior:
 * - Reads the request ID from the "X-Request-ID" header or generates one using crypto.randomUUID() if absent.
 * - Sets the same request ID on the response header "X-Request-ID".
 * - Creates a child logger enriched with contextual fields: requestId, method, and url.
 * - Executes downstream middleware/handlers inside the logger's async context using ctx.run(logger, next).
 * - After the downstream handler completes, augments the logger with the response status and emits:
 *   - a warning if the response status is >= 400, or
 *   - a debug message for successful responses.
 *
 * Notes:
 * - This middleware focuses on attaching request-scoped logging context and does not log request or response bodies.
 * - Side effects: sets a response header and emits log messages based on the final response status.
 *
 * @remarks
 * The exported value has the type ReturnType<typeof createMiddleware> and is intended to be registered in a middleware pipeline.
 *
 * @example
 * // app.use(withRequestLogger);
 *
 * @public
 */
export const withRequestLogger: ReturnType<typeof createMiddleware> =
  createMiddleware(async (c, next) => {
    const requestId = c.req.header("X-Request-ID") ?? crypto.randomUUID();
    c.res.headers.set("X-Request-ID", requestId);
    const logger = getLogger().child().withContext({
      requestId: requestId,
      method: c.req.method,
      url: c.req.url,
    });
    // logger.info(`Incoming request: ${c.req.method} ${c.req.url}`);

    try {
      await ctx.run(logger, next);
    } finally {
      const loggerWithMetadata = logger.withMetadata({
        status: c.res.status,
      });
      if (c.res.status >= 400) {
        loggerWithMetadata.warn(
          `Request completed with error status.`,
        );
      } else {
        loggerWithMetadata.debug(
          `Successful request.`,
        );
      }
    }
  });

/**
 * Creates a middleware that provides a logger enriched with the given metadata for the duration of the middleware chain.
 *
 * @param context - A record of key/value pairs to attach to a child logger. The object is treated as read-only; a child logger is created instead of mutating global state.
 * @returns A middleware (ReturnType<typeof createMiddleware>) that:
 *  - creates a child logger from `getLogger()` and attaches the provided `context` via `withContext`,
 *  - executes the remainder of the middleware chain with `ctx.run(logger, next)` so the enriched logger is available in the async context.
 *
 * @remarks
 * - This middleware relies on the presence of `getLogger()` (returning an object with `child()` and `withContext()` methods)
 *   and `ctx.run(logger, next)` to bind the logger to the asynchronous execution context.
 * - Any exceptions thrown by downstream middleware or handlers are propagated to the caller.
 *
 * @example
 * // Attach request-specific metadata for downstream handlers
 * const middleware = withMetadataLogger({ requestId: 'req-123', userId: 42 });
 * app.use(middleware);
 */
export const withMetadataLogger: (
  context: Record<string, unknown>,
) => ReturnType<typeof createMiddleware> = (context: Record<string, unknown>) =>
  createMiddleware(async (_c, next) => {
    const logger = getLogger().child().withContext(context);
    await ctx.run(logger, next);
  });
