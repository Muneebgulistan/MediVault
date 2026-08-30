"use client";

import { useEffect, useState, useTransition } from "react";
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

  // Step 1: Trigger Simulated AI OCR Extraction on mount if status is UPLOADED
  useEffect(() => {
    if (status === "UPLOADED") {
      startTransition(async () => {
        try {
          const res = await startOcrExtraction(prescriptionId);
          if (res.success && res.status) {
            setStatus(res.status);
            // Refresh parent state or reload page
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
        confidence: 1.0, // manually added
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
    // Basic validation
    const hasEmptyName = medicines.some((m) => !m.medicineName.trim());
    if (hasEmptyName) {
      setErrorMsg("All medicines must have a name.");
      return;
    }

    setErrorMsg("");

    startTransition(async () => {
      try {
        await savePrescriptionReview(prescriptionId, medicines);
        setStatus("CONFIRMED");
        router.refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to confirm prescription. Please try again.";
        setErrorMsg(msg);
      }
    });
  };

  // Render Loader if Processing
  if (status === "UPLOADED" || status === "PROCESSING") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-2xl border border-slate-800 bg-slate-900/10 p-8">
        <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
        <div>
          <h3 className="font-bold text-slate-200 text-sm">Processing Prescription</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            Our AI/OCR engine is securely extracting medications, dosages, routes, and scheduling directions...
          </p>
        </div>
      </div>
    );
  }

  // Render Confirmation Success banner if already confirmed
  if (status === "CONFIRMED") {
    return (
      <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-6 text-center space-y-4">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/15 border border-teal-500/20 text-teal-400">
          <Check className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-teal-400 text-sm">Prescription Confirmed</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            This prescription has been verified. The medicine information has been cached, and your daily schedule has been generated!
          </p>
        </div>
      </div>
    );
  }

  // Render Form Review Interface
  return (
    <div className="space-y-6">
      {/* Title / Banner */}
      <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wide">Review Required</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            AI extracted the following items. Please verify their accuracy and make corrections where needed. Confirmed schedules will generate automatically.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Medicines list inputs */}
      <div className="space-y-4">
        {medicines.map((med, index) => {
          const showConfidence = med.confidence && med.confidence < 1.0;
          const confPercent = med.confidence ? Math.round(med.confidence * 100) : 100;

          return (
            <div
              key={index}
              className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-4 transition hover:border-slate-700/80"
            >
              {/* Row Header with index and Delete */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  Medication #{index + 1}
                  {showConfidence && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/15 px-1 py-0.25 text-[8px] font-semibold">
                      <Sparkles className="h-2 w-2" />
                      {confPercent}% confidence
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => deleteMedicineRow(index)}
                  className="text-slate-500 hover:text-red-400 transition p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Input Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Medicine Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Medicine Name
                  </label>
                  <input
                    type="text"
                    value={med.medicineName}
                    onChange={(e) => handleInputChange(index, "medicineName", e.target.value)}
                    placeholder="e.g. Metformin"
                    className="w-full rounded-lg bg-slate-900 border border-slate-850 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Dosage */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => handleInputChange(index, "dosage", e.target.value)}
                    placeholder="e.g. 1 tablet"
                    className="w-full rounded-lg bg-slate-900 border border-slate-850 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Frequency */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Frequency / Intervals
                  </label>
                  <input
                    type="text"
                    value={med.frequency}
                    onChange={(e) => handleInputChange(index, "frequency", e.target.value)}
                    placeholder="e.g. twice daily"
                    className="w-full rounded-lg bg-slate-900 border border-slate-850 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Route of Administration */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Route
                  </label>
                  <select
                    value={med.route}
                    onChange={(e) => handleInputChange(index, "route", e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-850 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
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
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={med.duration}
                    onChange={(e) => handleInputChange(index, "duration", e.target.value)}
                    placeholder="e.g. for 7 days"
                    className="w-full rounded-lg bg-slate-900 border border-slate-850 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Instructions */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Special Instructions
                  </label>
                  <input
                    type="text"
                    value={med.instructions}
                    onChange={(e) => handleInputChange(index, "instructions", e.target.value)}
                    placeholder="e.g. after breakfast"
                    className="w-full rounded-lg bg-slate-900 border border-slate-850 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-900">
        <button
          type="button"
          onClick={addMedicineRow}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/30 px-4 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 transition"
        >
          <Plus className="h-4 w-4" />
          Add Medication
        </button>

        <button
          type="button"
          onClick={handleConfirmReview}
          disabled={isPending || medicines.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 px-5 py-2.5 text-xs font-semibold transition shadow-md shadow-teal-500/10"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Confirm & Verify Prescription
        </button>
      </div>
    </div>
  );
}
