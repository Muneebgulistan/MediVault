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
      {/* Back link */}
      <div>
        <Link
          href="/dashboard/medicines"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to medicines
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{medicine.name}</h1>
            {research.genericName && (
              <p className="text-xs text-slate-400 mt-0.5">Active Ingredient: {research.genericName}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: PRESCRIBED BY DOCTOR (Strict medical details) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-teal-500/35 bg-teal-500/5 p-6 space-y-4">
            <div className="border-b border-teal-500/20 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <HeartPulse className="h-4.5 w-4.5 text-teal-400" />
                Prescribed by Doctor
              </h2>
              <p className="text-[10px] text-teal-400/80 mt-1">
                Strict directions from your physician. Never alter these parameters.
              </p>
            </div>

            <div className="space-y-4">
              {prescriptionItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-teal-500/10 bg-slate-950/60 p-4 space-y-3"
                >
                  <p className="text-xs font-bold text-slate-200 truncate">
                    Rx: {item.prescription.title}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2.5 text-[11px] text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Dosage</span>
                      <strong className="text-slate-200">{item.dosage}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Frequency</span>
                      <strong className="text-slate-200">{item.frequency}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Route</span>
                      <strong className="text-slate-200">{item.route}</strong>
                    </div>
                    {item.duration && (
                      <div>
                        <span className="text-[10px] text-slate-500 block">Duration</span>
                        <strong className="text-slate-200">{item.duration}</strong>
                      </div>
                    )}
                  </div>

                  {item.instructions && (
                    <div className="text-xs border-t border-slate-800/80 pt-2 text-slate-400 leading-normal">
                      <strong className="text-slate-300 text-[10px] uppercase block mb-0.5">Instructions:</strong>
                      {item.instructions}
                    </div>
                  )}

                  <div className="flex items-center gap-2 border-t border-slate-800/80 pt-2 text-[10px] text-slate-500">
                    <User className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      Dr. {item.prescription.doctorName || "Unassigned"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: ADDITIONAL MEDICINE INFORMATION (Research block) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medical Disclaimer */}
          <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-3 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-orange-400">Medical Disclaimer</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                This information is for informational purposes and does not replace advice from your doctor or pharmacist. 
                External research information must never alter your doctor&apos;s prescribed medicine, dose, frequency, or duration.
              </p>
            </div>
          </div>

          {/* Research content card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-teal-400" />
                Additional Medicine Information
              </h2>
              {research.identified && research.retrievedAt && (
                <span className="text-[10px] text-slate-500">
                  Cached: {new Date(research.retrievedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {!research.identified ? (
              /* UNIDENTIFIED STATE */
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5 text-center flex flex-col items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-xs font-semibold text-yellow-500">
                  Medicine could not be confidently identified
                </p>
                <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-normal">
                  Please verify the medicine name with your doctor or pharmacist. We were unable to fetch matching labeling details from openFDA.
                </p>
              </div>
            ) : (
              /* IDENTIFIED MEDICINE DETAILS */
              <div className="space-y-6 text-sm">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Description
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                    {research.description}
                  </p>
                </div>

                {/* Common Brand Names */}
                {research.brandNames && research.brandNames.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Common Brand Names
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {research.brandNames.map((brand, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 text-xs"
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
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Common Uses & Indications
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                      {research.indications}
                    </p>
                  </div>
                )}

                {/* Side Effects */}
                {research.sideEffects && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Common Side Effects
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                      {research.sideEffects}
                    </p>
                  </div>
                )}

                {/* Warnings */}
                {research.warnings && (
                  <div>
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1.5">
                      Warnings & Precautions
                    </h4>
                    <p className="text-red-400/80 text-xs leading-relaxed whitespace-pre-line">
                      {research.warnings}
                    </p>
                  </div>
                )}

                {/* Interactions */}
                {research.interactions && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Drug Interactions
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                      {research.interactions}
                    </p>
                  </div>
                )}

                {/* Storage */}
                {research.storageInfo && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Storage & Handling
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                      {research.storageInfo}
                    </p>
                  </div>
                )}

                {/* Source footer */}
                {research.sourceName && research.sourceUrl && (
                  <div className="border-t border-slate-800/85 pt-4 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>
                      Data Source:{" "}
                      <a
                        href={research.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 underline"
                      >
                        {research.sourceName}
                      </a>
                    </span>
                    <span>
                      Retrieved: {research.retrievedAt ? new Date(research.retrievedAt).toLocaleString() : "Unknown"}
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
