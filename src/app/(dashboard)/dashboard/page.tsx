import React from "react";
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
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Server-side session verification — never trust client-provided user IDs
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;

  // Retrieve user-isolated counters and data with safe fallbacks
  let prescriptionCount = 0;
  let schedules: Awaited<ReturnType<typeof prisma.medicineSchedule.findMany<{
    include: { medicine: true };
  }>>> = [];
  let recentPrescriptions: Awaited<ReturnType<typeof prisma.prescription.findMany<{
    select: {
      id: true;
      title: true;
      doctorName: true;
      status: true;
      prescriptionDate: true;
      createdAt: true;
    };
  }>>> = [];

  try {
    const results = await Promise.all([
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

    prescriptionCount = results[0];
    schedules = results[1];
    recentPrescriptions = results[2];
  } catch (error) {
    console.error("Dashboard query failed:", error);
  }

  // Derived metrics from schedules
  const activeSchedules = schedules;
  const uniqueMedicineIds = new Set(activeSchedules.map((s) => s.medicineId));
  const activeMedicinesCount = uniqueMedicineIds.size;
  const todayMedicinesCount = activeSchedules.length;

  // Sort upcoming medicines by scheduledTime
  const upcomingMedicines = [...activeSchedules].sort((a, b) => {
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  const userName = (session.user as { name?: string | null }).name?.split(" ")[0] ?? "Patient";
  const formattedToday = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* 1. Clinical Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)]">
            <Sparkles className="h-4 w-4" />
            <span>CLINICAL OVERVIEW &bull; {formattedToday}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Welcome back, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
            Your active prescriptions, openFDA verified medication schedules, and upcoming daily doses are synchronized.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href="/dashboard/schedule"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--ink-0)] text-xs font-bold px-4 py-2.5 transition shadow-lg shadow-[var(--accent)]/20"
          >
            <Calendar className="h-4 w-4" />
            <span>Today&apos;s Schedule</span>
          </Link>
        </div>
      </div>

      {/* 2. Elevated Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Card 1: Prescriptions */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 backdrop-blur-xl shadow-lg hover:border-[var(--border-strong)] transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Total Prescriptions</span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]/25 shadow-inner group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">{prescriptionCount}</p>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1">Encrypted in personal vault</p>
          </div>
        </div>

        {/* Card 2: Active Medicines */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 backdrop-blur-xl shadow-lg hover:border-[var(--border-strong)] transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Active Regimens</span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]/25 shadow-inner group-hover:scale-105 transition-transform">
              <Pill className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">{activeMedicinesCount}</p>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1">Cataloged & researched</p>
          </div>
        </div>

        {/* Card 3: Today's Medicines */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 backdrop-blur-xl shadow-lg hover:border-[var(--border-strong)] transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Scheduled Today</span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]/25 shadow-inner group-hover:scale-105 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">{todayMedicinesCount}</p>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1">Daily dose occurrences</p>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Schedule + Recent Prescriptions */}
        <div className="space-y-8 lg:col-span-2">
          {/* Upcoming Schedule Timeline */}
          <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">Today&apos;s Timetable</h2>
              </div>
              {upcomingMedicines.length > 0 && (
                <Link
                  href="/dashboard/schedule"
                  className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] font-semibold transition"
                >
                  <span>Full Calendar</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {upcomingMedicines.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No doses scheduled for today"
                description="Upload a doctor prescription to automatically generate accurate medication intervals."
                action={
                  <Link
                    href="/dashboard/schedule"
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] px-4 py-2.5 text-xs font-bold border border-[var(--border-default)] transition"
                  >
                    Manage Regimens
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {upcomingMedicines.map((sched) => (
                  <div
                    key={sched.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-alt)] p-4 transition hover:border-[var(--border-strong)]"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-14 flex-col items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--accent)] font-mono font-bold text-xs shrink-0 shadow-inner">
                        <Clock className="h-3.5 w-3.5 mb-0.5" />
                        <span>{sched.scheduledTime}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[var(--text-primary)] text-sm truncate">
                          {sched.medicine.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          <span className="font-medium text-[var(--text-secondary)]">{sched.dosage}</span>
                          {sched.instructions && ` &bull; ${sched.instructions}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="rounded-full bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent)]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Active Regimen
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Prescriptions */}
          <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-[var(--accent)]" />
                <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">Recent Prescriptions</h2>
              </div>
              {recentPrescriptions.length > 0 && (
                <Link
                  href="/dashboard/prescriptions"
                  className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] font-semibold transition"
                >
                  <span>View All ({prescriptionCount})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {recentPrescriptions.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No prescriptions in vault"
                description="Upload medical documents using the panel on the right to extract prescriptions."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentPrescriptions.map((rx) => (
                  <Link
                    key={rx.id}
                    href={`/dashboard/prescriptions/${rx.id}`}
                    className="group rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-alt)] p-5 hover:border-[var(--accent)]/40 transition-all flex flex-col justify-between space-y-4 hover:-translate-y-0.5 shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm group-hover:text-[var(--accent)] transition-colors truncate">
                          {rx.title}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase shrink-0 ${
                            rx.status === "CONFIRMED"
                              ? "bg-[var(--success-bg)] text-[var(--success-fg)] border border-[var(--success-fg)]/25"
                              : rx.status === "REVIEW_REQUIRED"
                              ? "bg-[var(--warning-bg)] text-[var(--warning-fg)] border border-[var(--warning-fg)]/25"
                              : rx.status === "PROCESSING"
                              ? "bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent)]/25"
                              : "bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-default)]"
                          }`}
                        >
                          {rx.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        {rx.doctorName ? `Doctor: Dr. ${rx.doctorName}` : "Doctor unassigned"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--border-default)] pt-3 text-[11px] text-[var(--text-muted)]">
                      <span>
                        {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : ""}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-[var(--accent)] group-hover:translate-x-0.5 transition-transform">
                        Details <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upload Prescription + Medical Safety */}
        <div className="space-y-6">
          {/* Quick Prescription Upload Widget */}
          <UploadQuickAction />

          {/* Clinical Safety & Privacy Notice */}
          <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface-alt)] p-6 space-y-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--warning-fg)] uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4" />
              <span>Medical Safety Protocol</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              MediVault AI strictly enforces deterministic dosage scheduling. The system never invents medication dosages or frequency, and all AI-extracted records require explicit human verification before timetable generation.
            </p>
            <div className="pt-2 border-t border-[var(--border-default)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
              <span>Patient Data Isolated</span>
              <span className="text-[var(--text-muted)] font-semibold font-mono">Strict Compliance Standard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
