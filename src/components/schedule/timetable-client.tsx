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
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-300 flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
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
              className={`rounded-2xl border p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 ${
                !item.isActive
                  ? "border-slate-800/40 bg-slate-950/30 opacity-50"
                  : isTaken
                  ? "border-teal-500/30 bg-teal-950/10 shadow-sm"
                  : isSkipped
                  ? "border-red-500/20 bg-red-950/10 opacity-70"
                  : "border-slate-800/80 bg-slate-950/60 hover:border-slate-700"
              }`}
            >
              {/* Left Column: Time & Medicine Details */}
              <div className="flex items-start gap-4">
                {/* Time Badge */}
                <div className="flex h-12 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-teal-400 font-mono font-bold text-xs shadow-inner">
                  <Clock className="h-3.5 w-3.5 mb-0.5 text-teal-400" />
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
                          className="w-24 rounded-lg bg-slate-900 border border-slate-700 text-xs px-2.5 py-1 text-white focus:outline-none focus:border-teal-500 font-mono"
                        />
                        <button
                          onClick={() => handleSaveTime(item.id)}
                          className="rounded-lg bg-teal-500 hover:bg-teal-400 p-1.5 text-slate-950 transition"
                          title="Save time"
                        >
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    ) : (
                      <h3 className="font-bold text-white text-base">
                        {item.medicine.name}
                      </h3>
                    )}

                    {item.prescriptionMedicineId && (
                      <span className="rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <FileText className="h-2.5 w-2.5" />
                        Prescribed
                      </span>
                    )}

                    {!item.isActive && (
                      <span className="rounded-full bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        Paused
                      </span>
                    )}

                    {isTaken && (
                      <span className="rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 text-[10px] font-bold">
                        Dose Taken ✓
                      </span>
                    )}

                    {isSkipped && (
                      <span className="rounded-full bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold">
                        Skipped ✕
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300">
                    Dosage: <strong className="text-white font-semibold">{item.dosage}</strong>
                    {item.instructions && (
                      <span className="text-slate-400"> &bull; {item.instructions}</span>
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
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl border border-slate-800 bg-slate-900/40 transition"
                    title="Adjust schedule time"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                )}

                {/* Pause/Resume toggler */}
                <button
                  onClick={() => handleToggleActive(item.id, item.isActive)}
                  className={`p-2 rounded-xl border border-slate-800 transition ${
                    item.isActive
                      ? "text-slate-400 hover:text-amber-400 hover:bg-amber-950/20"
                      : "text-teal-400 hover:text-teal-300 hover:bg-teal-950/20"
                  }`}
                  title={item.isActive ? "Pause schedule" : "Resume schedule"}
                >
                  {item.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>

                {/* Log Taken / Skipped controls */}
                {item.isActive && (
                  <div className="flex items-center gap-2 border-l border-slate-800/80 pl-2">
                    <button
                      onClick={() => handleLogStatus(item.id, "TAKEN")}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                        isTaken
                          ? "bg-teal-500 text-slate-950 shadow-teal-500/20"
                          : "border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-teal-500/30 hover:text-teal-300"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Taken
                    </button>
                    <button
                      onClick={() => handleLogStatus(item.id, "SKIPPED")}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                        isSkipped
                          ? "bg-red-500 text-white shadow-red-500/20"
                          : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-red-500/30 hover:text-red-300"
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
