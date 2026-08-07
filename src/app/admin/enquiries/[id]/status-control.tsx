"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Select } from "@/components/ui/input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateLeadStatus } from "./actions";

/* FR-ADM-07 — the status pipeline, with a MANDATORY reason on Lost.
 *
 * The reason field appears only for "lost" and the action refuses the write
 * without it. Without that, the pipeline data is useless for the Phase 13
 * lead-quality review, which is the whole reason the field exists.
 */

const STATUSES = [
  "new", "contacted", "visit-booked", "visit-done", "quoted", "won", "lost",
] as const;

export function StatusControl({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(current);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = status !== current;
  const needsReason = status === "lost";

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateLeadStatus(id, status, reason);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setReason("");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-3">
        <label htmlFor="lead-status" className="font-sans text-body-sm text-fg-secondary">
          Status
        </label>
        <Select
          id="lead-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-48"
        >
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        {dirty ? (
          <Button
            variant="primary"
            size="md"
            loading={pending}
            disabled={needsReason && reason.trim().length < 3}
            onClick={save}
          >
            Save
          </Button>
        ) : null}
      </div>

      {dirty && needsReason ? (
        <Input
          aria-label="Why was this lost?"
          placeholder="Why was it lost? (required)"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="w-80"
        />
      ) : null}

      {error ? (
        <p role="alert" className="font-sans text-caption text-danger-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
