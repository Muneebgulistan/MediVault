import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Pass necessary user information down to DashboardNav Client Component
  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Side bar and Mobile navigation layout */}
      <DashboardNav user={user} />

      {/* Main content body */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
