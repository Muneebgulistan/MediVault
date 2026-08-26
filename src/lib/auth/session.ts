import { auth } from "@/lib/auth/config";
import { UnauthorizedError } from "@/lib/utils/error-handler";

/**
 * Retrieves the authenticated session from the server side.
 * Never trusts userId from the client — always resolves from the session token.
 */
export async function getServerSession() {
  const session = await auth();
  return session;
}

/**
 * Returns the authenticated user ID from the server-side session.
 * Throws UnauthorizedError if the user is not authenticated.
 * Use this in API routes and server actions to enforce authentication.
 */
export async function requireAuth(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError("You must be signed in to access this resource.");
  }

  return session.user.id;
}

/**
 * Type-safe check: returns userId if authenticated, null otherwise.
 * Use this when authentication is optional.
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
