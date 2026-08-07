import { toNextJsHandler } from "better-auth/next-js";

import { getAuth } from "@/lib/auth";

/* Better Auth's own endpoints (sign-in, sign-out, session).
 *
 * SRS §3 — these serve /admin only. There is no public account system; the
 * instance has `disableSignUp: true`, so this surface can authenticate an
 * invited back-office user and nothing else.
 */

async function handler(request: Request) {
  const auth = await getAuth();
  const { GET, POST } = toNextJsHandler(auth);
  return request.method === "GET" ? GET(request) : POST(request);
}

export const GET = handler;
export const POST = handler;
