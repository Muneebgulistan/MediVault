"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, File as FileIcon, X, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

type UploadStatus = "idle" | "validating" | "uploading" | "success" | "error" | "cancelled";

export function UploadQuickAction() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  const maxBytes = 10 * 1024 * 1024; // 10MB

  const handleFile = (selectedFile: File) => {
    setErrorMsg("");
    setStatus("idle");

    // 1. Client-side size validation
    if (selectedFile.size > maxBytes) {
      setErrorMsg("File size exceeds the 10MB limit.");
      setStatus("error");
      return;
    }

    // 2. Client-side MIME validation
    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMsg("Unsupported file format. Please upload a JPG, PNG, WEBP, or PDF.");
      setStatus("error");
      return;
    }

    setFile(selectedFile);

    // 3. Generate preview URL for images
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null); // PDF does not get preview
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  // Drag and drop handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
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
            setErrorMsg(res.error?.message || "Upload failed.");
            setStatus("error");
          }
        } catch {
          setErrorMsg("Server returned an invalid response.");
          setStatus("error");
        }
      } else {
        try {
          const res = JSON.parse(xhr.responseText);
          setErrorMsg(res.error?.message || `Server error (${xhr.status})`);
        } catch {
          setErrorMsg(`Network request failed with status ${xhr.status}.`);
        }
        setStatus("error");
      }
    });

    // Handle errors
    xhr.addEventListener("error", () => {
      setErrorMsg("A network error occurred. Please check your connection.");
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-100">Upload Prescription</h3>
        <p className="text-xs text-slate-400 mt-1">
          Upload an image or PDF scan. Files are encrypted and securely stored.
        </p>
      </div>

      {/* Error block */}
      {status === "error" && errorMsg && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Upload failed</p>
            <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
            {file && (
              <button
                type="button"
                onClick={uploadFile}
                className="mt-2 inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-semibold"
              >
                <RefreshCw className="h-3 w-3" /> Retry upload
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success block */}
      {status === "success" && createdId && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-teal-500/25 bg-teal-500/5 px-4 py-3 text-xs text-teal-400">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Prescription uploaded successfully</p>
              <p className="mt-0.5 leading-relaxed">
                The file is stored securely and queued for processing.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/dashboard/prescriptions/${createdId}`)}
              className="flex-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold py-2 px-3 transition"
            >
              View Record
            </button>
            <button
              onClick={clearSelection}
              className="rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 text-xs font-semibold py-2 px-3 transition"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}

      {/* Upload progress indicator */}
      {status === "uploading" && (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-medium truncate max-w-[150px]">{file?.name}</span>
            <span className="font-semibold text-teal-400">{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button
            type="button"
            onClick={cancelUpload}
            className="w-full text-center text-xs text-red-400 hover:text-red-300 font-medium py-1 transition"
          >
            Cancel Upload
          </button>
        </div>
      )}

      {/* Cancelled state block */}
      {status === "cancelled" && (
        <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3 text-xs text-slate-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Upload cancelled</p>
            <button
              type="button"
              onClick={uploadFile}
              className="mt-1.5 inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-semibold"
            >
              <RefreshCw className="h-3 w-3" /> Start upload again
            </button>
          </div>
        </div>
      )}

      {/* Main File picker & preview region */}
      {(status === "idle" || status === "error" || status === "cancelled") && !createdId && (
        <div className="space-y-4">
          {file ? (
            /* Selected File Preview Box */
            <div className="relative rounded-xl border border-slate-800 bg-slate-950/50 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                {previewUrl ? (
                  // Image thumbnail preview
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="prescription thumbnail"
                    className="h-12 w-12 rounded-lg object-cover border border-slate-800 shrink-0"
                  />
                ) : (
                  // PDF representation icon
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-teal-400 shrink-0">
                    <FileIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-200 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-900 hover:text-slate-300 transition shrink-0"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            /* Dropzone Region */
            <label
              onDragOver={onDragOver}
              onDrop={onDrop}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 py-8 px-4 text-center cursor-pointer transition hover:border-slate-700 hover:bg-slate-900/20"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept={allowedTypes.join(",")}
                onChange={onFileSelect}
                className="hidden"
              />
              <Upload className="mb-3 h-8 w-8 text-slate-500" />
              <p className="text-xs font-semibold text-slate-300">Choose file or drag & drop</p>
              <p className="text-[10px] text-slate-500 mt-1">Supports PDF, JPG, PNG, WEBP (max 10MB)</p>
            </label>
          )}

          {file && status === "idle" && (
            <button
              type="button"
              onClick={uploadFile}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold py-2.5 transition"
            >
              Start Upload
            </button>
          )}
        </div>
      )}
    </div>
  );
}
