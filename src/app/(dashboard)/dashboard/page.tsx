import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { UploadQuickAction } from "@/components/prescription/upload-quick-action";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FileText,
  Clock,
  Pill,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Server-side session verification — never trust client-provided user IDs
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;

  // Retrieve user-isolated counters and data
  const [prescriptionCount, schedules, recentPrescriptions] = await Promise.all([
    prisma.prescription.count({ where: { userId } }),
    prisma.medicineSchedule.findMany({
      where: { userId, isActive: true },
      include: { medicine: true },
    }),
    prisma.prescription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        doctorName: true,
        status: true,
        prescriptionDate: true,
        createdAt: true,
      },
    }),
  ]);

  // Derived metrics from schedules
  const activeSchedules = schedules;
  const uniqueMedicineIds = new Set(activeSchedules.map((s) => s.medicineId));
  const activeMedicinesCount = uniqueMedicineIds.size;
  const todayMedicinesCount = activeSchedules.length;

  // Helper to parse and sort scheduled times (e.g., "08:00", "22:00")
  const upcomingMedicines = [...activeSchedules].sort((a, b) => {
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  return (
    <div className="space-y-8">
      {/* 1. Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {(session.user as { name?: string | null }).name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here is a summary of your active prescriptions, medication schedules, and upcoming doses.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/prescriptions"
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white px-4 py-2 text-sm font-medium transition"
          >
            View Prescriptions
          </Link>
          <Link
            href="/dashboard/schedule"
            className="flex items-center gap-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-4 py-2 text-sm transition"
          >
            <Plus className="h-4 w-4" /> Add Dose
          </Link>
        </div>
      </div>

      {/* 2. Metrics Block */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Total Prescriptions</p>
            <p className="text-2xl font-bold text-white mt-1">{prescriptionCount}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Active Medicines</p>
            <p className="text-2xl font-bold text-white mt-1">{activeMedicinesCount}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Today&apos;s Medicines</p>
            <p className="text-2xl font-bold text-white mt-1">{todayMedicinesCount}</p>
          </div>
        </div>
      </div>

      {/* 3. Responsive Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Side columns: Schedule + Prescriptions */}
        <div className="space-y-8 lg:col-span-2">
          {/* Upcoming Schedule */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Today&apos;s Schedule</h2>
              {upcomingMedicines.length > 0 && (
                <Link
                  href="/dashboard/schedule"
                  className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-medium"
                >
                  Full calendar <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {upcomingMedicines.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No medicines scheduled"
                description="You haven't scheduled any medications for today. Head to schedules to set them up."
                action={
                  <Link
                    href="/dashboard/schedule"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 text-xs font-semibold border border-slate-700 transition"
                  >
                    Set Schedule
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {upcomingMedicines.map((sched) => (
                  <div
                    key={sched.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-800/60 bg-slate-950/40 p-4 transition hover:border-slate-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-semibold shrink-0">
                        <Clock className="h-4 w-4 text-teal-400" />
                        <span className="text-[10px] mt-0.5">{sched.scheduledTime}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100 text-sm">
                          {sched.medicine.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Dosage: {sched.dosage}
                          {sched.instructions && ` • ${sched.instructions}`}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Prescriptions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Recent Prescriptions</h2>
              {recentPrescriptions.length > 0 && (
                <Link
                  href="/dashboard/prescriptions"
                  className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-medium"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {recentPrescriptions.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No prescriptions found"
                description="Upload doctor prescriptions to extract medical information automatically."
              />
            ) : (
              <div className="divide-y divide-slate-800">
                {recentPrescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h4 className="font-medium text-slate-100 text-sm">{rx.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {rx.doctorName ? `Dr. ${rx.doctorName}` : "No Doctor Assigned"}
                        {rx.prescriptionDate &&
                          ` • ${new Date(rx.prescriptionDate).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          rx.status === "CONFIRMED"
                            ? "bg-teal-500/10 text-teal-400"
                            : rx.status === "REVIEW_REQUIRED"
                            ? "bg-orange-500/10 text-orange-400"
                            : rx.status === "PROCESSING"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : rx.status === "FAILED"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {rx.status.replace(/_/g, " ")}
                      </span>
                      <Link
                        href={`/dashboard/prescriptions/${rx.id}`}
                        className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action + Info cards */}
        <div className="space-y-8">
          {/* Quick upload card */}
          <UploadQuickAction />

          {/* Guidelines / Info card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 className="mb-3 text-base font-semibold text-slate-100 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-teal-400" />
              Safety Notice
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              MediVault AI utilizes optical character recognition and advanced AI models to translate and extract medication lists. 
            </p>
            <div className="mt-4 rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-2 text-[10px] text-orange-400 leading-normal">
              <strong>IMPORTANT:</strong> Always verify OCR-extracted medication schedules against your physician&apos;s physical copy before ingestion. Never self-prescribe or modify doses without consulting your doctor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
