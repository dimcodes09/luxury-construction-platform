/* SRS §3 — the permission matrix, transcribed exactly.
 *
 * This file is deliberately dependency-free so it can be imported by
 * middleware, Server Actions, Route Handlers and admin UI alike without
 * dragging in the auth runtime.
 *
 * NFR-SEC-11 is the rule that matters: "Admin routes protected by middleware;
 * EVERY SERVER ACTION INDEPENDENTLY RE-CHECKS ROLE — never trust the client."
 * Middleware is a convenience, not a boundary. FR-ADM-02 requires enforcement
 * server-side on every action, and Phase 4's acceptance criterion is explicit:
 * "a Manager cannot reach a rate-card mutation EVEN BY DIRECT REQUEST."
 *
 * There is no public account system. Visitors are always anonymous — the
 * shortlist is localStorage (FR-GBL-07) and the estimator is anonymous. These
 * three roles exist only behind /admin.
 */

export const ROLES = ["owner", "manager", "editor"] as const;
export type Role = (typeof ROLES)[number];

export const CAPABILITIES = [
  "dashboard.view",
  "dashboard.viewLimited",
  "leads.view",
  "leads.edit",
  "leads.delete",
  "leads.export",
  "projects.manage",
  "testimonials.manage",
  "journal.manage",
  "materials.manage",
  "rateCard.edit",
  "ai.viewUsage",
  "ai.changeSettings",
  "users.manage",
  "settings.manage",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

/* SRS §3 permission matrix.
 *
 * | Capability          | Owner | Manager | Editor      |
 * |---------------------|-------|---------|-------------|
 * | View dashboard      |   ✓   |    ✓    | ✓ (limited) |
 * | View / edit leads   |   ✓   |    ✓    |      ✗      |
 * | Delete leads        |   ✓   |    ✗    |      ✗      |
 * | Export leads CSV    |   ✓   |    ✓    |      ✗      |
 * | Manage projects     |   ✓   |    ✓    |      ✗      |
 * | Manage testimonials |   ✓   |    ✓    |      ✓      |
 * | Manage journal      |   ✓   |    ✓    |      ✓      |
 * | Manage materials    |   ✓   |    ✓    |      ✗      |
 * | Edit rate card      |   ✓   |    ✗    |      ✗      |
 * | View AI usage       |   ✓   |    ✓    |      ✗      |
 * | Change AI settings  |   ✓   |    ✗    |      ✗      |
 * | Manage users        |   ✓   |    ✗    |      ✗      |
 * | Site settings       |   ✓   |    ✗    |      ✗      |
 */
const MATRIX: Record<Role, ReadonlySet<Capability>> = {
  owner: new Set(CAPABILITIES),

  manager: new Set<Capability>([
    "dashboard.view",
    "leads.view",
    "leads.edit",
    "leads.export",
    "projects.manage",
    "testimonials.manage",
    "journal.manage",
    "materials.manage",
    "ai.viewUsage",
  ]),

  // Editor is a CONTENT contributor. No lead access at all — leads carry
  // personal data (NFR-PRIV-07) and content work never needs it.
  editor: new Set<Capability>([
    "dashboard.viewLimited",
    "testimonials.manage",
    "journal.manage",
  ]),
};

export function can(role: Role | undefined, capability: Capability): boolean {
  if (!role) return false;
  return MATRIX[role]?.has(capability) ?? false;
}

/**
 * Throwing variant for Server Actions and Route Handlers.
 *
 * NFR-SEC-11: call this at the TOP of every mutation, even when the UI already
 * hides the control. The UI hiding a button is a courtesy; this is the boundary.
 */
export class ForbiddenError extends Error {
  readonly code = "FORBIDDEN";
  readonly status = 403;

  constructor(capability: Capability, role?: Role) {
    // Message is safe to surface (§6 conventions) — it names the capability,
    // never internals.
    super(
      `Your role${role ? ` (${role})` : ""} cannot perform this action (${capability}).`,
    );
    this.name = "ForbiddenError";
  }
}

export function assertCan(
  role: Role | undefined,
  capability: Capability,
): asserts role is Role {
  if (!can(role, capability)) throw new ForbiddenError(capability, role);
}

/** Owner-only actions per §3. Kept as a named list so it reads as the spec. */
export const OWNER_ONLY: readonly Capability[] = [
  "leads.delete",
  "rateCard.edit",
  "ai.changeSettings",
  "users.manage",
  "settings.manage",
];
