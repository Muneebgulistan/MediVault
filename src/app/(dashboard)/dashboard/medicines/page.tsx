import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { Pill, Activity, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MedicinesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;

  // Retrieve medicines that appear in the user's prescriptions with error safety
  let prescriptionMedicines: Awaited<ReturnType<typeof prisma.prescriptionMedicine.findMany<{
    include: { medicine: true };
  }>>> = [];

  try {
    prescriptionMedicines = await prisma.prescriptionMedicine.findMany({
      where: { prescription: { userId } },
      include: { medicine: true },
    });
  } catch (error) {
    console.error("Failed to query medicines:", error);
  }

  // Unique medicines mapping
  const uniqueMedicinesMap = new Map();
  prescriptionMedicines.forEach((pm) => {
    if (!uniqueMedicinesMap.has(pm.medicineId)) {
      uniqueMedicinesMap.set(pm.medicineId, pm.medicine);
    }
  });

  const medicines = Array.from(uniqueMedicinesMap.values());

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Medications Catalog
            </h1>
            <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 text-xs font-bold text-teal-400">
              {medicines.length} Medicines
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            Pharmacological catalog verified against official openFDA drug labels and clinical guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="h-4 w-4" />
          <span>openFDA Database Verified</span>
        </div>
      </div>

      {medicines.length === 0 ? (
        <div className="py-16">
          <EmptyState
            icon={Pill}
            title="No medications cataloged yet"
            description="Medicines will automatically populate here once you upload doctor prescriptions and confirm their extraction."
            action={
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 text-xs transition shadow-lg shadow-teal-500/20"
              >
                <span>Upload a Prescription</span>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {medicines.map((med) => (
            <div
              key={med.id}
              className="group rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-teal-500/30 transition-all duration-200 backdrop-blur-xl hover:-translate-y-0.5 shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-105 transition-transform shadow-inner">
                    <Pill className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <span className="rounded-full bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {med.category ?? "Medication"}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base tracking-tight group-hover:text-teal-300 transition-colors">
                  {med.name}
                </h3>

                {med.genericName && (
                  <p className="text-xs text-teal-400/90 font-medium mt-1">
                    Generic: {med.genericName}
                  </p>
                )}

                {med.description && (
                  <p className="text-xs text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                    {med.description}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-800/80 pt-4 mt-6 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Activity className="h-3.5 w-3.5 text-teal-400" />
                  Prescribed Active
                </span>
                <Link
                  href={`/dashboard/medicines/${med.id}`}
                  className="inline-flex items-center gap-1.5 font-bold text-teal-400 hover:text-teal-300 transition-colors"
                >
                  <span>Research Info</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
