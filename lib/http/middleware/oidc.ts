// deno-lint-ignore-file no-explicit-any
// We need any to resolve incompatibilities between node and deno hono types
import { createMiddleware } from "@hono/hono/factory";
import {
  getAuth,
  type IDToken,
  type OidcAuth,
  oidcAuthMiddleware,
  processOAuthCallback,
  type TokenEndpointResponses,
} from "@hono/oidc-auth";
import { z } from "@collinhacks/zod";
import { HTTPException } from "@hono/hono/http-exception";

export const withUser = createMiddleware<{
  Variables: {
    readonly user?: User;
    readonly oidcClaimsHook: typeof oidcClaimsHook;
  };
}>(async (c, next) => {
  if (!Deno.env.has("OIDC_ISSUER")) {
    return next();
  }

  if (c.get("user")) {
    // apperently, we've already run this middleware
    return next();
  }

  if (c.req.path === "/oidc/callback") {
    c.set("oidcClaimsHook", oidcClaimsHook);
    // "as any" is needed because of incompatible types between node and deno
    return processOAuthCallback(c as any);
  }

  return await oidcAuthMiddleware()(c as any, async () => {
    c.set("oidcClaimsHook", oidcClaimsHook); // re-set in case the token gets refreshed
    // "as any" is needed because of incompatible types between node and deno
    // "as User" is safe since we know "oidcClaimsHook" will return a User
    const authorizedUser = await getAuth(c as any) as unknown as User;
    c.set("user", authorizedUser);
    return next();
  });
});

function oidcClaimsHook(
  orig: OidcAuth | undefined,
  claims: IDToken | undefined,
  _response: TokenEndpointResponses,
): Promise<User> {
  // Define oidcConfig with the necessary properties
  const oidcConfig = {
    OIDC_UID_CLAIM: Deno.env.get("OIDC_UID_CLAIM") ?? "sub",
    OIDC_NAME_CLAIM: Deno.env.get("OIDC_NAME_CLAIM") ?? "name",
    OIDC_ROLES_CLAIM: Deno.env.get("OIDC_ROLES_CLAIM") ?? "groups",
  };

  const { data: userClaims, error } = z.object({
    id: z.string().min(1),
    name: z.string().default("Anonymous User"),
    roles: z.union([z.string(), z.array(z.string())]).transform((roles) =>
      // if roles is a string, split it by space
      Array.isArray(roles) ? roles : roles.split(" ")
    ),
  }).safeParse({
    id: claims?.[oidcConfig.OIDC_UID_CLAIM] ??
      orig?.[oidcConfig.OIDC_UID_CLAIM],
    name: claims?.[oidcConfig.OIDC_NAME_CLAIM] ??
      orig?.[oidcConfig.OIDC_NAME_CLAIM],
    roles: claims?.[oidcConfig.OIDC_ROLES_CLAIM] ??
      orig?.[oidcConfig.OIDC_ROLES_CLAIM] ?? [],
  });

  if (error) {
    throw new HTTPException(500, {
      message: "Failed to parse user claims",
      cause: error,
    });
  }

  return Promise.resolve(userClaims);
}

export interface User {
  id: string;
  name: string;
  roles: string[];
}
