import mongoose, { type Mongoose } from "mongoose";

/* SRS NFR-PERF-11 / §2.2 stack note — "Mongoose connection MUST be globally
 * cached across lambda invocations (`global._mongoose`) — the standard
 * serverless Mongoose pitfall."
 *
 * Without this, every invocation opens a new pool. On MongoDB Atlas M0 the
 * connection limit is low enough that a modest traffic spike exhausts it and
 * the lead form starts timing out — SRS §11 risk 6 rates that CRITICAL, and
 * §NFR-OPS-02 states a lead must never be lost.
 *
 * The promise (not just the connection) is cached, so concurrent cold starts
 * inside one container await the same handshake rather than racing.
 */

declare global {
  var _mongoose:
    | { conn: Mongoose | null; promise: Promise<Mongoose> | null }
    | undefined;
}

const cached = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(
        "MONGODB_URI is not set. See .env.example for the full variable inventory.",
      );
    }

    cached.promise = mongoose.connect(uri, {
      // Fail fast rather than hanging a serverless invocation until it is
      // killed — a fast failure can fall back to the durable queue
      // (NFR-OPS-02); a hang cannot.
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 20000,
      // Serverless containers handle one request at a time; a large pool just
      // multiplies Atlas connection pressure across many warm lambdas.
      maxPoolSize: 10,
      minPoolSize: 0,
      // Writes must be acknowledged and durable before we tell a visitor their
      // enquiry was received.
      writeConcern: { w: "majority" },
      // Our schemas are explicit; strict query prevents a typo'd filter key
      // from silently matching every document.
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear the rejected promise, otherwise every later call replays the same
    // failure forever instead of retrying.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/** Better Auth needs the raw driver Db, not a Mongoose model layer. */
export async function getRawDb() {
  const connection = await connectToDatabase();
  return connection.connection.getClient().db();
}
