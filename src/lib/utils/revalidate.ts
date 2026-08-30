import { revalidatePath } from "next/cache";

/**
 * Safely calls revalidatePath inside Next.js environment.
 * Catches and silences static generation store invariant errors in offline/test scripts.
 */
export function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch (error: unknown) {
    // Silence static generation store missing error outside Next.js request context
    if (error instanceof Error && (error.message.includes("static generation store") || error.message.includes("Invariant"))) {
      return;
    }
    throw error;
  }
}
