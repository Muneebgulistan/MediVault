"use server";

import { auth, signOut } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

/**
 * Permanently deletes the authenticated user's account and all associated medical records.
 * Relies on database foreign key cascading rules (onDelete: Cascade).
 */
export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthenticated");
  }

  const userId = session.user.id;

  // 1. Delete user from database (Cascades to all user resources)
  await prisma.user.delete({
    where: { id: userId },
  });

  // 2. Clear authentication session and redirect to signin
  await signOut({ redirectTo: "/auth/signin" });
}
