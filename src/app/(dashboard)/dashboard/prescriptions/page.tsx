import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FileText,
  Plus,
  ArrowRight,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PrescriptionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;

  // Retrieve user's prescriptions only (data isolation) with error safety
  let prescriptions: Awaited<ReturnType<typeof prisma.prescription.findMany<{
    include: { _count: { select: { files: true; medicines: true } } };
  }>>> = [];

  try {
    prescriptions = await prisma.prescription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { files: true, medicines: true } } },
    });
  } catch (error) {
    console.error("Failed to query prescriptions:", error);
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Prescription Vault
            </h1>
            <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 text-xs font-bold text-teal-400">
              {prescriptions.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            Historical medical documents, OCR extraction reviews, and verified doctor prescriptions.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 font-bold px-5 py-2.5 text-xs sm:text-sm transition shadow-lg shadow-teal-500/20 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Upload Document</span>
        </Link>
      </div>

      {/* Grid or Empty State */}
      {prescriptions.length === 0 ? (
        <div className="py-16">
          <EmptyState
            icon={FileText}
            title="No prescriptions in vault"
            description="Upload clinical photos, hospital discharge notes, or PDF scans to automatically structure medication timetables."
            action={
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 text-xs transition shadow-lg shadow-teal-500/20"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Upload First Prescription</span>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((rx) => {
            const isConfirmed = rx.status === "CONFIRMED";
            const isReview = rx.status === "REVIEW_REQUIRED";
            const isProcessing = rx.status === "PROCESSING";

            return (
              <div
                key={rx.id}
                className="group relative rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-teal-500/30 transition-all duration-200 backdrop-blur-xl hover:-translate-y-0.5 shadow-lg"
              >
                <div>
                  {/* Top Status & Type */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-105 transition-transform shadow-inner">
                      <FileText className="h-5 w-5" />
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase shrink-0 ${
                        isConfirmed
                          ? "bg-teal-500/10 text-teal-400 border border-teal-500/25"
                          : isReview
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                          : isProcessing
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/25"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isConfirmed ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : isReview ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      <span>{rx.status.replace(/_/g, " ")}</span>
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <h3 className="font-bold text-white text-base tracking-tight line-clamp-1 group-hover:text-teal-300 transition-colors">
                    {rx.title}
                  </h3>

                  <div className="space-y-2 text-xs text-slate-400 mt-3">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-teal-400/80 shrink-0" />
                      <span className="truncate">
                        {rx.doctorName ? `Dr. ${rx.doctorName}` : "Doctor Unassigned"}
                      </span>
                    </div>

                    {rx.prescriptionDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-teal-400/80 shrink-0" />
                        <span>Issued: {new Date(rx.prescriptionDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Layers className="h-3.5 w-3.5" />
                    <span>
                      {rx._count?.medicines ?? 0} Meds &bull; {rx._count?.files ?? 0} Files
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/prescriptions/${rx.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    <span>{isConfirmed ? "View Details" : "Review Extraction"}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
