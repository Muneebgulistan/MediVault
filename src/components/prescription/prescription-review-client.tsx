"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startOcrExtraction, savePrescriptionReview } from "@/app/actions/ocr";
import {
  Loader2,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface ExtractedMedicine {
  id?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  instructions: string;
  confidence?: number;
}

interface PrescriptionReviewClientProps {
  prescriptionId: string;
  initialStatus: string;
  initialMedicines: ExtractedMedicine[];
}

export function PrescriptionReviewClient({
  prescriptionId,
  initialStatus,
  initialMedicines,
}: PrescriptionReviewClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [medicines, setMedicines] = useState<ExtractedMedicine[]>(initialMedicines);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  // Trigger Simulated AI OCR Extraction on mount if status is UPLOADED
  useEffect(() => {
    if (status === "UPLOADED") {
      startTransition(async () => {
        try {
          const res = await startOcrExtraction(prescriptionId);
          if (res.success && res.status) {
            setStatus(res.status);
            router.refresh();
          }
        } catch {
          setErrorMsg("AI OCR extraction failed. Please try again.");
        }
      });
    }
  }, [status, prescriptionId, router]);

  // Handle adding a new row
  const addMedicineRow = () => {
    setMedicines((prev) => [
      ...prev,
      {
        medicineName: "",
        dosage: "1 tablet",
        frequency: "once daily",
        route: "ORAL",
        duration: "ongoing",
        instructions: "",
        confidence: 1.0,
      },
    ]);
  };

  // Handle deleting a row
  const deleteMedicineRow = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle input changes
  const handleInputChange = (index: number, field: keyof ExtractedMedicine, value: string) => {
    setMedicines((prev) =>
      prev.map((med, i) => {
        if (i === index) {
          return { ...med, [field]: value };
        }
        return med;
      })
    );
  };

  // Handle final submission review
  const handleConfirmReview = () => {
    const hasEmptyName = medicines.some((m) => !m.medicineName.trim());
    if (hasEmptyName) {
      setErrorMsg("All medications must have a valid name before confirmation.");
      return;
    }

    setErrorMsg("");
    startTransition(async () => {
      try {
        const payload = medicines.map((m) => ({
          medicineName: m.medicineName.trim(),
          dosage: m.dosage.trim(),
          frequency: m.frequency.trim(),
          route: (m.route.toUpperCase() as "ORAL" | "INJECTION" | "TOPICAL" | "INHALATION" | "OPHTHALMIC" | "OTIC") || "ORAL",
          duration: m.duration.trim() || undefined,
          instructions: m.instructions.trim() || undefined,
        }));

        const res = await savePrescriptionReview(prescriptionId, payload);
        if (res.success) {
          router.refresh();
        } else {
          setErrorMsg("Failed to save changes. Please try again.");
        }
      } catch {
        setErrorMsg("An error occurred during confirmation.");
      }
    });
  };

  // Loading state during initial OCR pipeline
  if (status === "UPLOADED" || status === "PROCESSING") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner">
          <Sparkles className="h-7 w-7 animate-pulse" />
        </div>
        <div>
          <h4 className="text-base font-bold text-white">AI OCR Extraction in Progress</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Scanning document layout, optical characters, and matching active ingredients against verified registries...
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-teal-400 font-mono">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing prescription stream</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner / Instructions */}
      <div className="rounded-2xl border border-teal-500/25 bg-teal-950/20 p-4 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-teal-300 font-bold">
          <CheckCircle2 className="h-4 w-4 text-teal-400" />
          <span>Human-in-the-Loop Clinical Verification</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Carefully verify extracted medication names, dosage strength, and frequency. Once confirmed, these instructions will directly feed the deterministic scheduling engine.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/20 p-3.5 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Medication List */}
      <div className="space-y-4">
        {medicines.map((med, index) => {
          const confidencePct = Math.round((med.confidence ?? 0.85) * 100);
          const isHighConfidence = confidencePct >= 90;

          return (
            <div
              key={med.id || index}
              className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5 space-y-4 shadow-sm hover:border-slate-700 transition"
            >
              {/* Row Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-bold text-teal-400">
                    #{index + 1}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                      isHighConfidence
                        ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {isHighConfidence ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    <span>{confidencePct}% Confidence</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => deleteMedicineRow(index)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-red-950/30 hover:text-red-400 transition"
                  title="Remove medication"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Input Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Medicine Name */}
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    value={med.medicineName}
                    onChange={(e) => handleInputChange(index, "medicineName", e.target.value)}
                    placeholder="e.g. Amoxicillin"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>

                {/* Dosage */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => handleInputChange(index, "dosage", e.target.value)}
                    placeholder="e.g. 500mg, 1 tablet"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>

                {/* Frequency */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Frequency / Interval *
                  </label>
                  <input
                    type="text"
                    value={med.frequency}
                    onChange={(e) => handleInputChange(index, "frequency", e.target.value)}
                    placeholder="e.g. twice daily, every 8 hours"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>

                {/* Route of Administration */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Administration Route
                  </label>
                  <select
                    value={med.route}
                    onChange={(e) => handleInputChange(index, "route", e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  >
                    <option value="ORAL">Oral</option>
                    <option value="INJECTION">Injection</option>
                    <option value="TOPICAL">Topical</option>
                    <option value="INHALATION">Inhalation</option>
                    <option value="OPHTHALMIC">Ophthalmic (Eye)</option>
                    <option value="OTIC">Otic (Ear)</option>
                  </select>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Treatment Duration
                  </label>
                  <input
                    type="text"
                    value={med.duration}
                    onChange={(e) => handleInputChange(index, "duration", e.target.value)}
                    placeholder="e.g. 7 days, ongoing"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>

                {/* Instructions */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Food & Bedtime Instructions
                  </label>
                  <input
                    type="text"
                    value={med.instructions}
                    onChange={(e) => handleInputChange(index, "instructions", e.target.value)}
                    placeholder="e.g. after breakfast, before sleeping"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
        <button
          type="button"
          onClick={addMedicineRow}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 transition"
        >
          <Plus className="h-4 w-4 text-teal-400" />
          <span>Add Another Medication</span>
        </button>

        <button
          type="button"
          onClick={handleConfirmReview}
          disabled={isPending || medicines.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold px-6 py-2.5 text-xs transition shadow-lg shadow-teal-500/20 hover:-translate-y-0.5"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4 stroke-[2.5]" />
          )}
          <span>Confirm & Lock Extracted Regimen</span>
        </button>
      </div>
    </div>
  );
}
