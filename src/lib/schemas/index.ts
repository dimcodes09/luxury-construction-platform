/* SRS §2.2 — the shared Zod layer. Imported by React Hook Form on the client
 * and by every Route Handler and Server Action on the server.
 *
 * §6 conventions: "all inputs validated with Zod on the server regardless of
 * client validation · errors return {error: {code, message}} with the message
 * SAFE TO DISPLAY · no stack traces or provider errors ever reach the client."
 */

export * from "./common";
export * from "./lead";
export * from "./estimate";
export * from "./generation";
export * from "./subscribe";
export * from "./enquiry";
