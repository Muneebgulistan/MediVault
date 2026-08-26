import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { requirePrescriptionOwnership } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowLeft, Calendar, User, FileText, AlertTriangle } from "lucide-react";

interface PrescriptionDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function PrescriptionDetailPage({ params }: PrescriptionDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const { id } = await params;

  // Enforce server-side user-specific data isolation
  try {
    await requirePrescriptionOwnership(id);
  } catch {
    redirect("/dashboard/prescriptions");
  }

  const rx = await prisma.prescription.findUnique({
    where: { id },
    include: {
      files: true,
      medicines: { include: { medicine: true } },
    },
  });

  if (!rx) {
    redirect("/dashboard/prescriptions");
  }

  return (
    <div className="space-y-6">
      {/* Back button and navigation */}
      <div>
        <Link
          href="/dashboard/prescriptions"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to list
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">{rx.title}</h1>
          <span
            className={`self-start sm:self-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${
              rx.status === "VERIFIED"
                ? "bg-teal-500/10 text-teal-400 border border-teal-500/25"
                : rx.status === "REVIEW_REQUIRED"
                ? "bg-orange-500/10 text-orange-400 border border-orange-500/25"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {rx.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
            <h3 className="font-semibold text-slate-100 text-sm border-b border-slate-800/80 pb-3">
              Prescription Info
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <User className="h-4 w-4 text-teal-400" />
                <span>Doctor: {rx.doctorName ? `Dr. ${rx.doctorName}` : "Not Assigned"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="h-4 w-4 text-teal-400" />
                <span>
                  Date: {rx.prescriptionDate ? new Date(rx.prescriptionDate).toLocaleDateString() : "Unknown"}
                </span>
              </div>
            </div>
            {rx.notes && (
              <div className="pt-2">
                <p className="text-xs font-medium text-slate-400 mb-1">Clinical Notes</p>
                <div className="rounded-xl bg-slate-950/40 p-4 border border-slate-800/60 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {rx.notes}
                </div>
              </div>
            )}
          </div>

          {/* Medicines Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 className="font-semibold text-slate-100 text-sm border-b border-slate-800/80 pb-3 mb-4">
              Medicines & Dosage Instructions
            </h3>

            {rx.medicines.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <AlertTriangle className="mx-auto mb-3 h-8 w-8 opacity-40" />
                <p className="text-xs">No medications extracted from this prescription yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rx.medicines.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-200 text-sm">
                          {item.medicine.name}
                        </h4>
                        {item.medicine.genericName && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Generic: {item.medicine.genericName}
                          </p>
                        )}
                      </div>
                      <span className="rounded bg-teal-500/10 text-teal-400 border border-teal-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        {item.verificationStatus.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 bg-slate-900/30 rounded-lg p-3">
                      <div>
                        <p className="text-[10px] text-slate-500">Dosage</p>
                        <p className="font-medium text-slate-300 mt-0.5">{item.dosage}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Frequency</p>
                        <p className="font-medium text-slate-300 mt-0.5">{item.frequency}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Route</p>
                        <p className="font-medium text-slate-300 mt-0.5">{item.route}</p>
                      </div>
                      {item.duration && (
                        <div>
                          <p className="text-[10px] text-slate-500">Duration</p>
                          <p className="font-medium text-slate-300 mt-0.5">{item.duration}</p>
                        </div>
                      )}
                    </div>

                    {item.instructions && (
                      <div className="text-xs text-slate-400 pt-1">
                        <strong className="text-slate-300">Instructions:</strong> {item.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side files column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 className="font-semibold text-slate-100 text-sm border-b border-slate-800/80 pb-3 mb-4">
              Attached Files
            </h3>

            {rx.files.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No images or document files attached.</p>
            ) : (
              <div className="space-y-3">
                {rx.files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-3 hover:border-slate-700 transition"
                  >
                    <FileText className="h-6 w-6 text-teal-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-300 truncate">
                        {f.originalFilename}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {(f.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
