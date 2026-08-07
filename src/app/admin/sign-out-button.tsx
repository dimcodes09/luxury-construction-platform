"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/* Sign-out posts to Better Auth's own endpoint, then hard-refreshes so the
 * server layout re-reads the (now absent) session. router.refresh() alone would
 * leave the client cache holding the signed-in shell. */
export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={signOut} loading={busy}>
      Sign out
    </Button>
  );
}
