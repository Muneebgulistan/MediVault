import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PrescriptionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;

  // Retrieve user's prescriptions only (data isolation)
  const prescriptions = await prisma.prescription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { files: true, medicines: true } } },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Your Prescriptions</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your historical health records and track AI extraction status.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-4 py-2.5 text-sm transition"
        >
          <Plus className="h-4 w-4" /> Upload New
        </Link>
      </div>

      {/* Grid or Empty State */}
      {prescriptions.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={FileText}
            title="No prescriptions uploaded yet"
            description="Upload prescription photos or PDF reports to organize medications and timelines automatically."
            action={
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-4 py-2 text-xs transition"
              >
                Upload Prescription
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-slate-100 line-clamp-1 text-sm">{rx.title}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase shrink-0 ${
                      rx.status === "CONFIRMED"
                        ? "bg-teal-500/10 text-teal-400 border border-teal-500/25"
                        : rx.status === "REVIEW_REQUIRED"
                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/25"
                        : rx.status === "PROCESSING"
                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/25"
                        : rx.status === "FAILED"
                        ? "bg-red-500/10 text-red-400 border border-red-500/25"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {rx.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-400 mb-6">
                  {rx.doctorName && <p>Doctor: Dr. {rx.doctorName}</p>}
                  {rx.prescriptionDate && (
                    <p>Date: {new Date(rx.prescriptionDate).toLocaleDateString()}</p>
                  )}
                  <p className="pt-2 text-[10px] text-slate-500">
                    Medicines: {rx._count.medicines} • Files: {rx._count.files}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Added: {new Date(rx.createdAt).toLocaleDateString()}
                </span>
                <Link
                  href={`/dashboard/prescriptions/${rx.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300"
                >
                  View Details <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
