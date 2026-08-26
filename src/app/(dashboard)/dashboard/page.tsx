import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { FileText, Clock, Pill } from "lucide-react";

export default async function DashboardPage() {
  // Resolve authenticated user from the server-side session — never from client input
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;

  // Fetch only the authenticated user's data
  const [prescriptionCount, scheduleCount, activeScheduleCount] = await Promise.all([
    prisma.prescription.count({ where: { userId } }),
    prisma.medicineSchedule.count({ where: { userId } }),
    prisma.medicineSchedule.count({ where: { userId, isActive: true } }),
  ]);

  const recentPrescriptions = await prisma.prescription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, title: true, doctorName: true, status: true, createdAt: true },
  });

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {session.user.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="mt-1 text-slate-400">Here&apos;s an overview of your health vault.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard icon={FileText} label="Prescriptions" value={prescriptionCount} color="teal" />
        <StatCard icon={Clock} label="Active schedules" value={activeScheduleCount} color="blue" />
        <StatCard icon={Pill} label="Total schedules" value={scheduleCount} color="purple" />
      </div>

      {/* Recent prescriptions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Recent Prescriptions</h2>

        {recentPrescriptions.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p>No prescriptions yet. Upload your first one to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentPrescriptions.map((rx: typeof recentPrescriptions[number]) => (
              <div key={rx.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-white">{rx.title}</p>
                  {rx.doctorName && (
                    <p className="text-sm text-slate-400">{rx.doctorName}</p>
                  )}
                </div>
                <StatusBadge status={rx.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "teal" | "blue" | "purple";
}) {
  const colorMap = {
    teal: "bg-teal-500/10 text-teal-400",
    blue: "bg-blue-500/10 text-blue-400",
    purple: "bg-purple-500/10 text-purple-400",
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${colorMap[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-slate-700 text-slate-300",
    PROCESSING: "bg-yellow-500/10 text-yellow-400",
    EXTRACTED: "bg-blue-500/10 text-blue-400",
    REVIEW_REQUIRED: "bg-orange-500/10 text-orange-400",
    VERIFIED: "bg-teal-500/10 text-teal-400",
    ARCHIVED: "bg-slate-600/10 text-slate-500",
  };

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? map["DRAFT"]}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
