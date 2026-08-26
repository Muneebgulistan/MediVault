"use client";

import { useState } from "react";
import { Upload, File, CheckCircle2 } from "lucide-react";

export function UploadQuickAction() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus("idle");
    }
  };

  const handleUploadMock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    // Simulate upload delay
    setTimeout(() => {
      setLoading(false);
      setStatus("success");
      setFile(null);
    }, 1500);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <h3 className="mb-1 text-base font-semibold text-slate-100">Upload Prescription</h3>
      <p className="mb-4 text-xs text-slate-400">
        Upload an image or PDF. Our AI will extract dosage, frequency, and instructions.
      </p>

      {status === "success" && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-teal-500/20 bg-teal-500/5 px-4 py-3 text-sm text-teal-400">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Prescription Uploaded</p>
            <p className="text-xs text-slate-400 mt-0.5">
              The file is now in queue for AI processing. You can check status under "Prescriptions".
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleUploadMock} className="space-y-4">
        <label
          className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center cursor-pointer transition ${
            file
              ? "border-teal-500/40 bg-teal-500/5"
              : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/20"
          }`}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />
          {file ? (
            <div className="flex flex-col items-center">
              <File className="mb-2 h-8 w-8 text-teal-400" />
              <p className="max-w-[200px] truncate text-sm font-medium text-slate-200">
                {file.name}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="mb-2 h-8 w-8 text-slate-500" />
              <p className="text-sm font-medium text-slate-300">Click or drag file here</p>
              <p className="text-xs text-slate-500 mt-1">Supports PDF, JPEG, PNG (max 10MB)</p>
            </div>
          )}
        </label>

        {file && (
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-4 py-2.5 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading..." : "Process Prescription"}
          </button>
        )}
      </form>
    </div>
  );
}
