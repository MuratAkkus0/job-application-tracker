import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { initUserBoard } from "../init-user-board";
import connectDB from "@/lib/db";

// better-auth's mongodb adapter needs a live Db handle in order to be
// constructed, so building it at module scope opens a database connection at
// import time — which means `next build` cannot collect page data unless a
// database happens to be reachable. Building it lazily defers that to the
// first request instead.
//
// The return type is deliberately inferred: betterAuth() returns a type
// narrowed by the options passed to it, and annotating it as the generic
// Auth<BetterAuthOptions> widens it in a way TypeScript rejects.
async function createAuth() {
  const mongooseInstance = await connectDB();
  const client = mongooseInstance.connection.getClient();
  const db = client.db();

  return betterAuth({
    database: mongodbAdapter(db, {
      client,
    }),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60,
      },
    },
    emailAndPassword: {
      enabled: true,
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            if (user.id) {
              await initUserBoard(user.id);
            }
          },
        },
      },
    },
  });
}

type Auth = Awaited<ReturnType<typeof createAuth>>;

let authPromise: Promise<Auth> | null = null;

export function getAuth(): Promise<Auth> {
  if (!authPromise) {
    // Drop the cached promise on failure, otherwise one transient connection
    // error would poison every subsequent request for the process lifetime.
    authPromise = createAuth().catch((error) => {
      authPromise = null;
      throw error;
    });
  }
  return authPromise;
}

export async function getSession() {
  // headers() is read BEFORE the auth instance is built on purpose: it marks
  // the surrounding render as dynamic, so during a prerender Next bails out to
  // the Suspense fallback here rather than continuing on and opening a
  // database connection at build time.
  const requestHeaders = await headers();
  const auth = await getAuth();
  const result = await auth.api.getSession({
    headers: requestHeaders,
  });
  return result;
}

export const signOut = async () => {
  const requestHeaders = await headers();
  const auth = await getAuth();
  const result = await auth.api.signOut({
    headers: requestHeaders,
  });
  if (result.success) {
    redirect("/login");
  }
};
