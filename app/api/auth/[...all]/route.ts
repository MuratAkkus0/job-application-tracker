import { getAuth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Resolved per request rather than at module scope, so importing this route
// does not require a database connection during the build.
export async function GET(request: Request) {
  const { GET: handler } = toNextJsHandler(await getAuth());
  return handler(request);
}

export async function POST(request: Request) {
  const { POST: handler } = toNextJsHandler(await getAuth());
  return handler(request);
}
