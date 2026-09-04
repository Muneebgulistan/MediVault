"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  ImageIcon,
} from "lucide-react";

type UploadStatus = "idle" | "validating" | "uploading" | "success" | "error" | "cancelled";

export function UploadQuickAction() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  const maxBytes = 10 * 1024 * 1024; // 10MB

  const handleFile = (selectedFile: File) => {
    setErrorMsg("");
    setStatus("idle");

    // 1. Client-side size validation
    if (selectedFile.size > maxBytes) {
      setErrorMsg("File size exceeds the 10MB limit. Please upload a compressed scan or image.");
      setStatus("error");
      return;
    }

    // 2. Client-side MIME validation
    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMsg("Unsupported file format. Please upload a JPG, PNG, WEBP, or PDF document.");
      setStatus("error");
      return;
    }

    setFile(selectedFile);

    // 3. Generate preview URL for images
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const clearSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
    setCreatedId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFile = () => {
    if (!file) return;

    setStatus("uploading");
    setProgress(0);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name.split(".")[0]);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    // Monitor upload progress
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setProgress(percent);
      }
    });

    // Handle load completion
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.success && res.data?.prescriptionId) {
            setCreatedId(res.data.prescriptionId);
            setStatus("success");
          } else {
            setErrorMsg(res.error?.message || "Prescription ingestion failed.");
            setStatus("error");
          }
        } catch {
          setErrorMsg("Server returned an unrecognized response format.");
          setStatus("error");
        }
      } else {
        try {
          const res = JSON.parse(xhr.responseText);
          setErrorMsg(res.error?.message || `Ingestion error (${xhr.status})`);
        } catch {
          setErrorMsg(`Network request failed with status ${xhr.status}.`);
        }
        setStatus("error");
      }
    });

    // Handle errors
    xhr.addEventListener("error", () => {
      setErrorMsg("A network transmission error occurred. Please verify your connection.");
      setStatus("error");
    });

    // Send request
    xhr.open("POST", "/api/prescriptions/upload");
    xhr.send(formData);
  };

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      setStatus("cancelled");
      setProgress(0);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-5 backdrop-blur-xl shadow-xl hover:border-slate-700/80 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Upload Prescription</h3>
            <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[9px] font-bold text-teal-400 uppercase tracking-wider">
              Secure Ingestion
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Upload doctor notes, scans, or digital reports for automated OCR extraction.
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner">
          <UploadCloud className="h-5 w-5" />
        </div>
      </div>

      {/* Error block */}
      {status === "error" && errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-red-200">Upload Issue Encountered</p>
            <p className="mt-1 leading-relaxed text-red-300/90">{errorMsg}</p>
            {file && (
              <button
                type="button"
                onClick={uploadFile}
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry Ingestion
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success block */}
      {status === "success" && createdId && (
        <div className="space-y-4 rounded-2xl border border-teal-500/30 bg-teal-950/20 p-5">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 border border-teal-500/30">
              <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-bold text-sm text-teal-300">Prescription Ingested Successfully</p>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Medical document encrypted, quarantined in private vault, and ready for OCR verification.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={() => router.push(`/dashboard/prescriptions/${createdId}`)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 text-xs font-bold py-2.5 px-4 transition shadow-lg shadow-teal-500/20"
            >
              <span>Review AI Extraction</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
            <button
              onClick={clearSelection}
              className="rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold py-2.5 px-4 transition"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}

      {/* Upload progress indicator */}
      {status === "uploading" && (
        <div className="space-y-3 rounded-2xl border border-teal-500/30 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-200 truncate max-w-[180px]">{file?.name}</span>
            <span className="font-mono font-bold text-teal-400">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-150 shadow-[0_0_12px_#2dd4bf]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-slate-500">Encrypting & streaming file...</span>
            <button
              type="button"
              onClick={cancelUpload}
              className="text-red-400 hover:text-red-300 font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cancelled state block */}
      {status === "cancelled" && (
        <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400">
          <AlertCircle className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-slate-300">Upload Cancelled</p>
            <button
              type="button"
              onClick={uploadFile}
              className="mt-2 inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-bold"
            >
              <RefreshCw className="h-3 w-3" /> Resume Ingestion
            </button>
          </div>
        </div>
      )}

      {/* Main File picker & preview region */}
      {(status === "idle" || status === "error" || status === "cancelled") && !createdId && (
        <div className="space-y-4">
          {file ? (
            /* Selected File Preview Box */
            <div className="relative rounded-2xl border border-slate-700/80 bg-slate-950/60 p-4 flex items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3.5 overflow-hidden">
                {previewUrl ? (
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-slate-800 shrink-0 bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="prescription preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] font-bold text-center text-teal-400 uppercase py-0.5">
                      IMG
                    </div>
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-teal-400 shrink-0 shadow-inner">
                    <FileText className="h-6 w-6 stroke-[2]" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-[260px]">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {(file.size / 1024 / 1024).toFixed(2)} MB &bull; {file.type.split("/")[1]?.toUpperCase() ?? "DOC"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={clearSelection}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent hover:border-slate-700 transition shrink-0"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* Dropzone Region */
            <label
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-8 px-4 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-teal-400 bg-teal-500/10 scale-[1.01]"
                  : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/30"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept={allowedTypes.join(",")}
                onChange={onFileSelect}
                className="hidden"
              />
              <div className="h-12 w-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-3 border border-teal-500/20">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-200">
                Select prescription file or drag & drop
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                Supports clinical images & documents (PDF, JPG, PNG, WEBP up to 10MB)
              </p>

              <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-400 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
                <span>AES-256 Storage &bull; Strict Access Control</span>
              </div>
            </label>
          )}

          {file && status === "idle" && (
            <button
              type="button"
              onClick={uploadFile}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 text-xs font-bold py-3 transition shadow-lg shadow-teal-500/20 hover:-translate-y-0.5"
            >
              <UploadCloud className="h-4 w-4 stroke-[2.5]" />
              <span>Securely Ingest Prescription</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
