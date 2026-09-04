import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { Pill, Activity, ArrowRight } from "lucide-react";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Your Medicines</h1>
        <p className="text-sm text-slate-400 mt-1">
          Catalog of medications extracted from your active and past prescriptions.
        </p>
      </div>

      {medicines.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={Pill}
            title="No medicines cataloged"
            description="Medicines will automatically populate here once you upload prescriptions and verify their extraction."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {medicines.map((med) => (
            <div
              key={med.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/15 mb-4">
                  <Pill className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-100 text-sm">{med.name}</h3>
                {med.genericName && (
                  <p className="text-xs text-slate-500 mt-1 italic">Generic: {med.genericName}</p>
                )}
                {med.description && (
                  <p className="text-xs text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                    {med.description}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-800/80 pt-4 mt-6 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-teal-400" />
                  {med.category ?? "Medication"}
                </span>
                <Link
                  href={`/dashboard/medicines/${med.id}`}
                  className="inline-flex items-center gap-1 font-semibold text-teal-400 hover:text-teal-300 transition"
                >
                  Research & Verify <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
