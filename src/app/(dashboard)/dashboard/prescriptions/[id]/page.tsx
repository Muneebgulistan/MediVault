import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { generatePrescriptionSchedules } from "@/app/actions/schedule";
import { deletePrescription } from "@/app/actions/prescription";
import { PrescriptionReviewClient } from "@/components/prescription/prescription-review-client";
import { requirePrescriptionOwnership } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";

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

  const isConfirmed = rx.status === "CONFIRMED";

  return (
    <div className="space-y-8">
      {/* Navigation and Top Bar */}
      <div>
        <Link
          href="/dashboard/prescriptions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors mb-4 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Prescription Vault</span>
        </Link>

        {/* Hero Header Card */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {rx.title}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase ${
                  isConfirmed
                    ? "bg-teal-500/10 text-teal-400 border border-teal-500/25"
                    : rx.status === "REVIEW_REQUIRED"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                    : "bg-blue-500/10 text-blue-400 border border-blue-500/25"
                }`}
              >
                {isConfirmed ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )}
                <span>{rx.status.replace(/_/g, " ")}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Prescription record created on {new Date(rx.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            {!isConfirmed && (
              <form action={generatePrescriptionSchedules.bind(null, rx.id)}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 text-xs font-bold py-2.5 px-4 transition shadow-lg shadow-teal-500/20"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Confirm & Generate Timetable</span>
                </button>
              </form>
            )}

            <form action={deletePrescription.bind(null, rx.id)}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 text-xs font-semibold py-2.5 px-3.5 transition"
                title="Delete prescription permanently"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Grid: Clinical Details + Scans */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Metadata & Medication Review */}
        <div className="lg:col-span-2 space-y-8">
          {/* Metadata Card */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800/80 pb-3">
              Clinical Document Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-950/50 border border-slate-800/60 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Attending Physician
                  </p>
                  <p className="font-semibold text-white text-sm mt-0.5">
                    {rx.doctorName ? `Dr. ${rx.doctorName}` : "Not Assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-950/50 border border-slate-800/60 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Prescription Date
                  </p>
                  <p className="font-semibold text-white text-sm mt-0.5">
                    {rx.prescriptionDate ? new Date(rx.prescriptionDate).toLocaleDateString() : "Undated"}
                  </p>
                </div>
              </div>
            </div>

            {rx.notes && (
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Physician Notes & Instructions
                </p>
                <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800/80 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {rx.notes}
                </div>
              </div>
            )}
          </div>

          {/* Medicines Card */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Extracted Medications ({rx.medicines.length})
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Deterministic Extraction &bull; Zero Guessing
              </span>
            </div>

            {!isConfirmed ? (
              <PrescriptionReviewClient
                prescriptionId={rx.id}
                initialStatus={rx.status}
                initialMedicines={rx.medicines.map((m) => ({
                  id: m.id,
                  medicineName: m.medicine.name,
                  dosage: m.dosage,
                  frequency: m.frequency,
                  route: m.route,
                  duration: m.duration || "",
                  instructions: m.instructions || "",
                  confidence: m.confidence || undefined,
                }))}
              />
            ) : rx.medicines.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-400/60" />
                <p className="text-xs">No medications extracted from this prescription yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rx.medicines.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5 space-y-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-white text-base">
                          {item.medicine.name}
                        </h4>
                        {item.medicine.genericName && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            Generic: {item.medicine.genericName}
                          </p>
                        )}
                      </div>
                      <span className="rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                        {item.verificationStatus.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Dosage</p>
                        <p className="font-bold text-white mt-1">{item.dosage}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Frequency</p>
                        <p className="font-bold text-white mt-1">{item.frequency}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Route</p>
                        <p className="font-bold text-white mt-1">{item.route}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Duration</p>
                        <p className="font-bold text-white mt-1">{item.duration || "Ongoing"}</p>
                      </div>
                    </div>

                    {item.instructions && (
                      <div className="text-xs text-slate-300 pt-2 border-t border-slate-800/60 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                        <span><strong>Special Instructions:</strong> {item.instructions}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attached Scans */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Original Scans ({rx.files.length})
              </h3>
              <span className="text-[10px] text-teal-400 font-semibold font-mono">Encrypted</span>
            </div>

            {rx.files.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No images or documents attached.</p>
            ) : (
              <div className="space-y-4">
                {rx.files.map((f) => {
                  const secureUrl = `/api/files/${rx.id}/${f.id}`;
                  const isImage = f.mimeType.startsWith("image/");

                  return (
                    <div key={f.id} className="space-y-3">
                      <a
                        href={secureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 hover:border-teal-500/40 transition group shadow-sm"
                      >
                        <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0 border border-teal-500/20 group-hover:scale-105 transition-transform">
                          <FileText className="h-5 w-5 stroke-[2]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white group-hover:text-teal-300 truncate">
                            {f.originalFilename}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            {(f.fileSize / 1024).toFixed(1)} KB &bull; Click to open
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-teal-300" />
                      </a>

                      {isImage && (
                        <div className="rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950/40 p-2 shadow-inner flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={secureUrl}
                            alt={f.originalFilename}
                            className="max-h-64 object-contain rounded-xl shadow"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
