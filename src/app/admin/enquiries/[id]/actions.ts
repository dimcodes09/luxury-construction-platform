"use server";

import { revalidatePath } from "next/cache";

import { requireCapability } from "@/lib/auth/guard";
import { connectToDatabase } from "@/lib/db/connect";
import { AuditLog, Lead } from "@/lib/db/models";
import { leadStatusUpdateSchema } from "@/lib/schemas/lead";

/* NFR-SEC-11 — "EVERY SERVER ACTION INDEPENDENTLY RE-CHECKS ROLE — never trust
 * the client." The UI hiding a control is a courtesy; requireCapability() is the
 * boundary. Phase 4's acceptance criterion is that a Manager cannot reach an
 * Owner-only mutation EVEN BY DIRECT REQUEST, and that only holds if the check
 * lives here rather than in the page.
 */

export async function updateLeadStatus(
  id: string,
  status: string,
  reason: string,
): Promise<{ error?: string }> {
  let actor;
  try {
    actor = await requireCapability("leads.edit");
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "You cannot change this.",
    };
  }

  /* FR-ADM-07 — the discriminated union makes `lostReason` required by the type
   * system when status is "lost", so it cannot be forgotten here. */
  const parsed = leadStatusUpdateSchema.safeParse(
    status === "lost" ? { status, lostReason: reason } : { status },
  );

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "That status isn't valid.",
    };
  }

  try {
    await connectToDatabase();

    const existing = await Lead.findById(id).select("status").lean();
    if (!existing) return { error: "That enquiry no longer exists." };

    const previous = (existing as { status?: string }).status ?? "new";

    await Lead.updateOne(
      { _id: id },
      {
        $set: {
          status: parsed.data.status,
          ...(parsed.data.status === "lost"
            ? { lostReason: parsed.data.lostReason }
            : {}),
          /* Powers the median-response metric (§0.8). Stamped on the first move
           * away from "new", because that is when someone actually replied. */
          ...(previous === "new" && parsed.data.status !== "new"
            ? { firstResponseAt: new Date() }
            : {}),
        },
        $push: {
          statusHistory: {
            from: previous,
            to: parsed.data.status,
            by: actor.userId,
            at: new Date(),
          },
        },
      },
    );

    // FR-ADM-24 / NFR-SEC-13 — every admin mutation is audited with a diff.
    await AuditLog.create({
      actor: actor.userId,
      action: "lead.status",
      entity: "Lead",
      entityId: id,
      diff: { from: previous, to: parsed.data.status },
      at: new Date(),
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/enquiries/${id}`);
    return {};
  } catch {
    // §6 conventions — safe to display, no internals.
    return { error: "Couldn't save that. Try again." };
  }
}
