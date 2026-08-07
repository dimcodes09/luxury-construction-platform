import { headers } from "next/headers";

import { getAuth, toRole } from "./index";
import {
  ForbiddenError,
  assertCan,
  can,
  type Capability,
  type Role,
} from "./permissions";

/* NFR-SEC-11 — "Admin routes protected by middleware; EVERY SERVER ACTION
 * INDEPENDENTLY RE-CHECKS ROLE — never trust the client."
 *
 * Phase 4 acceptance: "a Manager cannot reach a rate-card mutation even by
 * direct request." Middleware alone cannot deliver that, because a Server
 * Action is invoked by a POST to the page route and middleware matching is
 * easy to get subtly wrong. So every mutation calls requireCapability() itself.
 *
 * Usage in an action:
 *
 *   "use server";
 *   export async function updateRateCard(input: unknown) {
 *     const { user } = await requireCapability("rateCard.edit");
 *     ...
 *   }
 */

export type AdminContext = {
  userId: string;
  email: string;
  role: Role;
};

export class UnauthenticatedError extends Error {
  readonly code = "UNAUTHENTICATED";
  readonly status = 401;

  constructor() {
    super("Sign in to continue.");
    this.name = "UnauthenticatedError";
  }
}

/** Reads the current admin session. Returns null when signed out. */
export async function getAdminContext(): Promise<AdminContext | null> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const role = toRole((session.user as { role?: unknown }).role);
  if (!role) return null;

  return {
    userId: session.user.id,
    email: session.user.email,
    role,
  };
}

export async function requireAdmin(): Promise<AdminContext> {
  const context = await getAdminContext();
  if (!context) throw new UnauthenticatedError();
  return context;
}

/**
 * The one to call at the top of every admin mutation.
 * Throws UnauthenticatedError (401) or ForbiddenError (403).
 */
export async function requireCapability(
  capability: Capability,
): Promise<AdminContext> {
  const context = await requireAdmin();
  assertCan(context.role, capability);
  return context;
}

/** Non-throwing check, for conditionally rendering admin UI. */
export async function hasCapability(capability: Capability): Promise<boolean> {
  const context = await getAdminContext();
  return can(context?.role, capability);
}

export { ForbiddenError };
