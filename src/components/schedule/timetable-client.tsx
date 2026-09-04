"use client";

import React, { useState, useTransition } from "react";
import {
  logMedicationTake,
  toggleScheduleActive,
  updateScheduleTime,
} from "@/app/actions/schedule";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  Pause,
  Play,
  Check,
  AlertCircle,
  FileText,
  Sparkles,
} from "lucide-react";

interface ScheduleWithDetails {
  id: string;
  scheduledTime: string;
  dosage: string;
  instructions: string | null;
  isActive: boolean;
  prescriptionMedicineId: string | null;
  medicine: {
    id: string;
    name: string;
  };
  logs: {
    status: "TAKEN" | "SKIPPED";
  }[];
}

interface TimetableClientProps {
  initialSchedules: ScheduleWithDetails[];
  todayStr: string;
}

export function TimetableClient({ initialSchedules, todayStr }: TimetableClientProps) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  // Handle marking taken/skipped
  const handleLogStatus = (scheduleId: string, status: "TAKEN" | "SKIPPED") => {
    startTransition(async () => {
      try {
        await logMedicationTake(scheduleId, todayStr, status);
        setSchedules((prev) =>
          prev.map((s) => {
            if (s.id === scheduleId) {
              return { ...s, logs: [{ status }] };
            }
            return s;
          })
        );
      } catch {
        setErrorMsg("Failed to update dose status.");
      }
    });
  };

  // Handle toggling pause/active state
  const handleToggleActive = (scheduleId: string, currentActive: boolean) => {
    startTransition(async () => {
      try {
        await toggleScheduleActive(scheduleId, !currentActive);
        setSchedules((prev) =>
          prev.map((s) => {
            if (s.id === scheduleId) {
              return { ...s, isActive: !currentActive };
            }
            return s;
          })
        );
      } catch {
        setErrorMsg("Failed to update regimen active status.");
      }
    });
  };

  // Handle saving modified time slot
  const handleSaveTime = (scheduleId: string) => {
    if (!editTime) return;
    setErrorMsg("");

    startTransition(async () => {
      try {
        await updateScheduleTime(scheduleId, editTime);
        setSchedules((prev) =>
          prev.map((s) => {
            if (s.id === scheduleId) {
              return { ...s, scheduledTime: editTime };
            }
            return s;
          })
        );
        setEditingId(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to save time.";
        setErrorMsg(msg);
      }
    });
  };

  // Sort: Chronological time slots
  const sortedSchedules = [...schedules].sort((a, b) => {
    if (a.scheduledTime === "As Needed") return 1;
    if (b.scheduledTime === "As Needed") return -1;
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="rounded-xl border border-[var(--danger-fg)]/25 bg-[var(--danger-bg)] p-4 text-xs text-[var(--danger-fg)] flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-[var(--danger-fg)]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Timetable List */}
      <div className="space-y-3">
        {sortedSchedules.map((item) => {
          const todayLog = item.logs[0];
          const isTaken = todayLog?.status === "TAKEN";
          const isSkipped = todayLog?.status === "SKIPPED";
          const isEdited = editingId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 ${
                !item.isActive
                  ? "border-[var(--border-default)] bg-[var(--bg-surface-alt)] opacity-50"
                  : isTaken
                  ? "border-[var(--success-fg)]/30 bg-[var(--success-bg)]/20 shadow-sm"
                  : isSkipped
                  ? "border-[var(--danger-fg)]/30 bg-[var(--danger-bg)]/20 opacity-70"
                  : "border-[var(--border-default)] bg-[var(--bg-surface-alt)] hover:border-[var(--border-strong)]"
              }`}
            >
              {/* Left Column: Time & Medicine Details */}
              <div className="flex items-start gap-4">
                {/* Time Badge */}
                <div className="flex h-12 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] font-mono font-bold text-xs shadow-sm">
                  <Clock className="h-3.5 w-3.5 mb-0.5 text-[var(--text-muted)]" />
                  <span>{item.scheduledTime}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {isEdited ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          placeholder="e.g. 08:30"
                          className="w-24 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs px-2.5 py-1 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono"
                        />
                        <button
                          onClick={() => handleSaveTime(item.id)}
                          className="rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] p-1.5 text-[var(--ink-0)] transition"
                          title="Save time"
                        >
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    ) : (
                      <h3 className="font-bold text-[var(--text-primary)] text-base">
                        {item.medicine.name}
                      </h3>
                    )}

                    {item.prescriptionMedicineId && (
                      <span className="rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)] px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider flex items-center gap-1">
                        <FileText className="h-2.5 w-2.5 text-[var(--text-muted)]" />
                        Prescribed
                      </span>
                    )}

                    {!item.isActive && (
                      <span className="rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-default)] px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider">
                        Paused
                      </span>
                    )}

                    {isTaken && (
                      <span className="rounded-full bg-[var(--success-bg)] text-[var(--success-fg)] border border-[var(--success-fg)]/30 px-2 py-0.5 text-[10px] font-mono font-medium">
                        Dose Taken ✓
                      </span>
                    )}

                    {isSkipped && (
                      <span className="rounded-full bg-[var(--danger-bg)] text-[var(--danger-fg)] border border-[var(--danger-fg)]/30 px-2 py-0.5 text-[10px] font-mono font-medium">
                        Skipped ✕
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)]">
                    Dosage: <strong className="text-[var(--text-primary)] font-semibold">{item.dosage}</strong>
                    {item.instructions && (
                      <span className="text-[var(--text-muted)]"> &bull; {item.instructions}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {/* Time edit trigger */}
                {item.isActive && !isEdited && (
                  <button
                    onClick={() => {
                      setEditingId(item.id);
                      setEditTime(item.scheduledTime);
                    }}
                    className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] transition"
                    title="Adjust schedule time"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                )}

                {/* Pause/Resume toggler */}
                <button
                  onClick={() => handleToggleActive(item.id, item.isActive)}
                  className={`p-2 rounded-xl border border-[var(--border-default)] transition ${
                    item.isActive
                      ? "text-[var(--text-muted)] hover:text-[var(--warning-fg)] hover:bg-[var(--warning-bg)]"
                      : "text-[var(--accent)] hover:bg-[var(--accent-bg)]"
                  }`}
                  title={item.isActive ? "Pause schedule" : "Resume schedule"}
                >
                  {item.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>

                {/* Log Taken / Skipped controls */}
                {item.isActive && (
                  <div className="flex items-center gap-2 border-l border-[var(--border-default)] pl-2">
                    <button
                      onClick={() => handleLogStatus(item.id, "TAKEN")}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-sm ${
                        isTaken
                          ? "bg-[var(--success-bg)] text-[var(--success-fg)] border border-[var(--success-fg)]/30"
                          : "border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--success-fg)]/30 hover:text-[var(--success-fg)]"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Taken
                    </button>
                    <button
                      onClick={() => handleLogStatus(item.id, "SKIPPED")}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                        isSkipped
                          ? "bg-[var(--danger-bg)] text-[var(--danger-fg)] border border-[var(--danger-fg)]/30"
                          : "border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--danger-fg)]/30 hover:text-[var(--danger-fg)]"
                      }`}
                    >
                      <XCircle className="h-4 w-4" />
                      Skip
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
