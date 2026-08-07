"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/* Posts to Better Auth's sign-in endpoint.
 *
 * The error message is deliberately identical for "unknown email" and "wrong
 * password" — distinguishing them tells an attacker which addresses exist.
 * NFR-SEC-05 rate-limits the endpoint itself at 5 attempts / 15 min / IP.
 */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError(
          response.status === 429
            ? "Too many attempts. Try again in fifteen minutes."
            : "That email and password don't match.",
        );
        setBusy(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {error ? (
        <p
          role="alert"
          className="rounded-sm border border-danger-600 bg-danger-100 px-4 py-3 font-sans text-body-sm text-danger-600"
        >
          {error}
        </p>
      ) : null}

      <Field id="email" label="Email">
        <Input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      <Field id="password" label="Password">
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>

      <Button type="submit" variant="primary" size="lg" loading={busy}>
        Sign in
      </Button>
    </form>
  );
}
