import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { User, Mail, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, createdAt: true },
  });

  if (!dbUser) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Your Profile</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your personal metadata and account credentials.
        </p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-2xl font-bold text-teal-400">
            {dbUser.name ? dbUser.name[0].toUpperCase() : dbUser.email[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{dbUser.name ?? "MediVault User"}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Patient Account</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <User className="h-5 w-5 text-teal-400 shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Full Name</p>
              <p className="font-semibold text-slate-200 mt-0.5">{dbUser.name ?? "Not Provided"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Mail className="h-5 w-5 text-teal-400 shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Email Address</p>
              <p className="font-semibold text-slate-200 mt-0.5">{dbUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Calendar className="h-5 w-5 text-teal-400 shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Member Since</p>
              <p className="font-semibold text-slate-200 mt-0.5">
                {new Date(dbUser.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
