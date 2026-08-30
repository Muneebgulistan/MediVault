"use client";

import { useState, useTransition } from "react";
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
        // Optimistic UI update
        setSchedules((prev) =>
          prev.map((s) => {
            if (s.id === scheduleId) {
              return { ...s, logs: [{ status }] };
            }
            return s;
          })
        );
      } catch {
        setErrorMsg("Failed to update status.");
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
        setErrorMsg("Failed to update schedule status.");
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

  // Sort: Chronological time slots, with "As Needed" at the bottom
  const sortedSchedules = [...schedules].sort((a, b) => {
    if (a.scheduledTime === "As Needed") return 1;
    if (b.scheduledTime === "As Needed") return -1;
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TIMETABLE LAYOUT */}
      <div className="divide-y divide-slate-800 border-t border-b border-slate-800/80">
        {sortedSchedules.map((item) => {
          const todayLog = item.logs[0];
          const isTaken = todayLog?.status === "TAKEN";
          const isSkipped = todayLog?.status === "SKIPPED";
          const isEdited = editingId === item.id;

          return (
            <div
              key={item.id}
              className={`py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                !item.isActive ? "opacity-45" : ""
              }`}
            >
              {/* Left Column: Time & Badge Info */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/80 text-slate-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {isEdited ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          placeholder="e.g. 08:30"
                          className="w-20 rounded bg-slate-900 border border-slate-700 text-xs px-2 py-1 text-slate-100 focus:outline-none focus:border-teal-500"
                        />
                        <button
                          onClick={() => handleSaveTime(item.id)}
                          className="rounded bg-teal-500 hover:bg-teal-400 p-1 text-slate-950 transition"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-base font-bold text-slate-200">
                        {item.scheduledTime}
                      </span>
                    )}

                    {/* Prescription generation indicator badge */}
                    {item.prescriptionMedicineId && (
                      <span className="rounded bg-teal-500/10 text-teal-400 border border-teal-500/15 px-1.5 py-0.5 text-[9px] font-semibold flex items-center gap-1">
                        <FileText className="h-2.5 w-2.5" />
                        Prescribed
                      </span>
                    )}

                    {/* Inactive badge */}
                    {!item.isActive && (
                      <span className="rounded bg-slate-800 text-slate-400 border border-slate-700/85 px-1.5 py-0.5 text-[9px] font-medium">
                        Paused
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-slate-100 text-sm mt-1">
                    {item.medicine.name} — <span className="text-slate-400">{item.dosage}</span>
                  </h3>
                  {item.instructions && (
                    <p className="text-xs text-slate-400 mt-1">{item.instructions}</p>
                  )}
                </div>
              </div>

              {/* Right Column: Actions (Pause, Edit, Taken, Skipped) */}
              <div className="flex items-center gap-3 self-end md:self-center">
                {/* Time edit trigger */}
                {item.isActive && !isEdited && (
                  <button
                    onClick={() => {
                      setEditingId(item.id);
                      setEditTime(item.scheduledTime);
                    }}
                    className="p-2 text-slate-500 hover:text-slate-350 hover:bg-slate-900 rounded-lg border border-slate-800 bg-slate-900/10 transition"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                )}

                {/* Pause/Resume toggler */}
                <button
                  onClick={() => handleToggleActive(item.id, item.isActive)}
                  className={`p-2 rounded-lg border border-slate-800 transition ${
                    item.isActive
                      ? "text-slate-500 hover:text-orange-400 hover:bg-orange-500/5"
                      : "text-teal-400 hover:text-teal-300 hover:bg-teal-500/5"
                  }`}
                >
                  {item.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>

                {/* Log Taken / Skipped controls */}
                {item.isActive && (
                  <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
                    <button
                      onClick={() => handleLogStatus(item.id, "TAKEN")}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        isTaken
                          ? "bg-teal-500/10 border-teal-500/25 text-teal-400"
                          : "border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Taken
                    </button>
                    <button
                      onClick={() => handleLogStatus(item.id, "SKIPPED")}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        isSkipped
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : "border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-750 hover:text-slate-200"
                      }`}
                    >
                      <XCircle className="h-4 w-4" />
                      Skipped
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
