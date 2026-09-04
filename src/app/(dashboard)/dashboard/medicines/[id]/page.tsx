import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { researchMedicine } from "@/lib/medicines/research";
import Link from "next/link";
import {
  ArrowLeft,
  Pill,
  ShieldAlert,
  AlertTriangle,
  BookOpen,
  User,
  HeartPulse,
} from "lucide-react";

interface MedicineDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function MedicineDetailPage({ params }: MedicineDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;
  const { id } = await params;

  // 1. Fetch medicine and confirm the user actually has it prescribed (data isolation)
  const prescriptionItems = await prisma.prescriptionMedicine.findMany({
    where: {
      medicineId: id,
      prescription: { userId },
    },
    include: {
      prescription: true,
      medicine: true,
    },
  });

  if (prescriptionItems.length === 0) {
    // Security: redirect if user doesn't have this medicine prescribed
    redirect("/dashboard/medicines");
  }

  const medicine = prescriptionItems[0].medicine;

  // 2. Perform medicine research (with database caching)
  const research = await researchMedicine(medicine.id, medicine.name);

  return (
    <div className="space-y-6">
      {/* Back link & Title Bar */}
      <div>
        <Link
          href="/dashboard/medicines"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-4 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> Back to medicines catalog
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-surface-alt)] text-[var(--accent)] border border-[var(--border-default)] shadow-sm">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{medicine.name}</h1>
                <span className="rounded-full bg-[var(--success-bg)] border border-[var(--success-fg)]/25 px-2.5 py-0.5 text-[10px] font-mono font-medium text-[var(--success-fg)]">
                  Prescription Active
                </span>
              </div>
              {research.genericName && (
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Active Molecule: <span className="text-[var(--text-primary)] font-medium">{research.genericName}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: PRESCRIBED BY DOCTOR (Strict medical directions) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-sm space-y-5">
            <div className="border-b border-[var(--border-default)] pb-3.5">
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <HeartPulse className="h-4 w-4 text-[var(--accent)]" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider">
                  Doctor's Prescribed Orders
                </h2>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                Strict directions authorized by your physician. Do not deviate from these instructions.
              </p>
            </div>

            <div className="space-y-4">
              {prescriptionItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-alt)] p-4 space-y-3.5 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                      {item.prescription.title}
                    </p>
                    <span className="text-[9px] font-mono text-[var(--success-fg)] bg-[var(--success-bg)] px-1.5 py-0.5 rounded border border-[var(--success-fg)]/25">
                      Verified
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] p-2">
                      <span className="text-[10px] text-[var(--text-muted)] block font-mono font-medium">Dosage</span>
                      <strong className="text-[var(--text-primary)] font-semibold">{item.dosage}</strong>
                    </div>
                    <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] p-2">
                      <span className="text-[10px] text-[var(--text-muted)] block font-mono font-medium">Frequency</span>
                      <strong className="text-[var(--text-primary)] font-semibold">{item.frequency}</strong>
                    </div>
                    <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] p-2">
                      <span className="text-[10px] text-[var(--text-muted)] block font-mono font-medium">Route</span>
                      <strong className="text-[var(--text-primary)] font-semibold">{item.route}</strong>
                    </div>
                    <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] p-2">
                      <span className="text-[10px] text-[var(--text-muted)] block font-mono font-medium">Duration</span>
                      <strong className="text-[var(--text-primary)] font-semibold">{item.duration || "Ongoing"}</strong>
                    </div>
                  </div>

                  {item.instructions && (
                    <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] p-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                      <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[var(--text-muted)] block mb-0.5">
                        Specific Instructions:
                      </span>
                      {item.instructions}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-[var(--text-muted)]">
                    <User className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                    <span className="truncate font-medium">
                      Dr. {item.prescription.doctorName || "Licensed Physician"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: ADDITIONAL MEDICINE INFORMATION (Research block) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medical Disclaimer Banner */}
          <div className="rounded-2xl bg-[var(--warning-bg)] border border-[var(--warning-fg)]/25 p-4 flex items-start gap-3.5 shadow-sm">
            <ShieldAlert className="h-5 w-5 text-[var(--warning-fg)] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--warning-fg)]">Clinical Knowledge Notice</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                This monograph is synthesized from openFDA records for educational reference. It never replaces direct medical advice from your physician or pharmacist. Never alter your prescribed regimen based on secondary reference data.
              </p>
            </div>
          </div>

          {/* Research content card */}
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-sm space-y-6">
            <div className="border-b border-[var(--border-default)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-[var(--accent)]" />
                openFDA Clinical Monograph
              </h2>
              {research.identified && research.retrievedAt && (
                <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface-alt)] px-2 py-0.5 rounded border border-[var(--border-default)]">
                  Cached: {new Date(research.retrievedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {!research.identified ? (
              /* UNIDENTIFIED STATE */
              <div className="rounded-xl border border-[var(--warning-fg)]/25 bg-[var(--warning-bg)] p-8 text-center flex flex-col items-center">
                <AlertTriangle className="h-10 w-10 text-[var(--warning-fg)] mb-3" />
                <p className="text-sm font-semibold text-[var(--warning-fg)]">
                  No matching FDA labeling monograph found
                </p>
                <p className="text-xs text-[var(--text-muted)] max-w-md mt-1.5 leading-relaxed">
                  We could not automatically match this medication name against current openFDA catalogs. Your prescribed regimen remains valid as entered above.
                </p>
              </div>
            ) : (
              /* IDENTIFIED MEDICINE DETAILS */
              <div className="space-y-6 text-sm">
                {/* Description */}
                <div>
                  <h4 className="text-[11px] font-mono font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    Description & Overview
                  </h4>
                  <div className="rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)] p-4 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                    {research.description}
                  </div>
                </div>

                {/* Common Brand Names */}
                {research.brandNames && research.brandNames.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-mono font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                      Recognized Commercial Brand Names
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {research.brandNames.map((brand, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-default)] text-[var(--text-primary)] px-2.5 py-1 text-xs font-mono"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Uses / Indications */}
                {research.indications && (
                  <div>
                    <h4 className="text-[11px] font-mono font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                      Clinical Uses & Indications
                    </h4>
                    <div className="rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)] p-4 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                      {research.indications}
                    </div>
                  </div>
                )}

                {/* Side Effects */}
                {research.sideEffects && (
                  <div>
                    <h4 className="text-[11px] font-mono font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                      Reported Adverse Reactions & Side Effects
                    </h4>
                    <div className="rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)] p-4 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                      {research.sideEffects}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {research.warnings && (
                  <div>
                    <h4 className="text-[11px] font-mono font-bold text-[var(--danger-fg)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-[var(--danger-fg)]" /> Black Box Warnings & Precautions
                    </h4>
                    <div className="rounded-xl bg-[var(--danger-bg)] border border-[var(--danger-fg)]/25 p-4 text-xs text-[var(--danger-fg)] leading-relaxed whitespace-pre-line">
                      {research.warnings}
                    </div>
                  </div>
                )}

                {/* Interactions */}
                {research.interactions && (
                  <div>
                    <h4 className="text-[11px] font-mono font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                      Known Drug Interactions
                    </h4>
                    <div className="rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)] p-4 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                      {research.interactions}
                    </div>
                  </div>
                )}

                {/* Storage */}
                {research.storageInfo && (
                  <div>
                    <h4 className="text-[11px] font-mono font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                      Storage, Handling & Stability
                    </h4>
                    <div className="rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)] p-4 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                      {research.storageInfo}
                    </div>
                  </div>
                )}

                {/* Source footer */}
                {research.sourceName && research.sourceUrl && (
                  <div className="border-t border-[var(--border-default)] pt-4 text-xs text-[var(--text-muted)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span>
                      Official Data Source:{" "}
                      <a
                        href={research.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent)] hover:text-[var(--accent-hover)] underline font-medium"
                      >
                        {research.sourceName}
                      </a>
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono">
                      Timestamp: {research.retrievedAt ? new Date(research.retrievedAt).toLocaleString() : "Live"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
