import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";

/**
 * /dashboard redirects to /dashboard/dashboard for the overview.
 */
export default async function DashboardRedirectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  redirect("/dashboard/dashboard");
}
