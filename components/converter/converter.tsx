"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useController, useForm } from "react-hook-form";
import { ArrowDownToLine, Check, FileText, LockKeyhole, RefreshCw, ShieldCheck, Upload, X } from "lucide-react";
import { useConversion } from "@/hooks/use-conversion";
import type { ConversionFormValues } from "@/types/conversion";
import { formatFileSize, toPdfFilename } from "@/utils/files";

const configuredMaxMb = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB);
const MAX_FILE_MB = Number.isInteger(configuredMaxMb) && configuredMaxMb >= 1 && configuredMaxMb <= 25 ? configuredMaxMb : 25;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ["doc", "docx", "txt"];

export function Converter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();
  const [dragging, setDragging] = useState(false);
  const { status, progress, error, requestId, pdfUrl, convert, reset: resetConversion } = useConversion();
  const { control, handleSubmit, resetField } = useForm<ConversionFormValues>({ mode: "onChange" });
  const { field, fieldState } = useController({
    control,
    name: "file",
    rules: {
      validate: {
        present: (selected) => selected instanceof File || "Choose a file to get started.",
        format: (selected) => {
          const extension = selected?.name.split(".").pop()?.toLowerCase();
          return (extension && ACCEPTED_EXTENSIONS.includes(extension)) || "Use a DOC, DOCX, or TXT file.";
        },
        size: (selected) => !selected || selected.size <= MAX_FILE_BYTES || `Choose a file smaller than ${MAX_FILE_MB} MB.`,
      },
    },
  });
  const file = field.value ?? null;
  const inputId = "converter-file-input";
  const uploadLimit = `${MAX_FILE_MB} MB`;

  const selectFile = (selected: File | null) => {
    if (!selected) return;
    resetConversion();
    field.onChange(selected);
  };

  const removeFile = () => {
    if (status === "uploading" || status === "converting") return;
    resetField("file");
    resetConversion();
    if (inputRef.current) inputRef.current.value = "";
  };

  const onSubmit = (values: ConversionFormValues) => { if (values.file) void convert(values.file); };
  const busy = status === "uploading" || status === "converting";
  const validationError = fieldState.error?.message;

  return (
    <form id="converter" className="converter-card" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="converter-head">
        <h2 className="converter-title">Document to PDF</h2>
        <span className="secure-pill"><ShieldCheck size={12} /> Secure conversion</span>
      </div>

      <input
        id={inputId}
        ref={(element) => { inputRef.current = element; field.ref(element); }}
        className="sr-only"
        tabIndex={-1}
        type="file"
        accept=".doc,.docx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        aria-label="Choose a DOC, DOCX, or TXT document"
        aria-describedby={file ? "upload-limit" : "upload-hint upload-format upload-limit"}
        aria-invalid={Boolean(fieldState.error)}
        onChange={(event) => {
          const selected = event.currentTarget.files?.[0] ?? null;
          event.currentTarget.value = "";
          selectFile(selected);
        }}
      />

      {!file ? (
        <div
          className={`dropzone${dragging ? " is-dragging" : ""}`}
          role="group"
          aria-label="Choose or drop a document"
          onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            selectFile(event.dataTransfer.files[0] ?? null);
          }}
        >
          <label className="drop-content" htmlFor={inputId}>
            <span className="drop-icon-wrap"><Upload size={21} strokeWidth={1.8} /></span>
            <span className="drop-title">Drop your document here</span>
            <span id="upload-hint" className="drop-subtitle">or choose a file from your device</span>
          </label>
          <button className="browse-button" type="button" onClick={() => inputRef.current?.click()}>
            Browse files
          </button>
          <div id="upload-format" className="format-list" aria-label="Supported formats">
            <span className="format-chip">DOC</span><span className="format-chip">DOCX</span><span className="format-chip">TXT</span>
          </div>
        </div>
      ) : (
        <div className="file-summary">
          <span className="file-icon"><FileText size={21} /></span>
          <div className="file-details">
            <p className="file-name" title={file.name}>{file.name}</p>
            <p className="file-meta">{formatFileSize(file.size)} <span aria-hidden="true">·</span> {file.name.split(".").pop()?.toUpperCase()}</p>
          </div>
          <button className="remove-file" type="button" onClick={removeFile} disabled={busy} aria-label="Remove selected file">
            <X size={16} />
          </button>
        </div>
      )}

      <p id="upload-limit" className="limit-note">Maximum file size {uploadLimit} <span aria-hidden="true">·</span> Your document stays yours</p>

      {file && (
        <motion.div
          key={`${status}-${file.name}`}
          initial={reduceMotion ? false : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.16 }}
        >
          <div className="status-row">
            <span className="status-label">
              <span className={`status-dot ${busy ? "busy" : status === "completed" ? "complete" : status === "error" ? "error" : ""}`} />
              {status === "uploading" ? "Uploading your file…" : status === "converting" ? "Creating your PDF…" : status === "completed" ? "Your PDF is ready" : status === "error" ? "Conversion needs another try" : "Ready to convert"}
            </span>
            {busy && <span className="status-percent">{status === "converting" ? "Working" : `${progress}%`}</span>}
            {status === "completed" && <span className="status-percent">100%</span>}
          </div>
          <div className="progress-track" role="progressbar" aria-label="Conversion progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={busy ? (status === "converting" ? 72 : progress) : status === "completed" ? 100 : 0}>
            <div className={`progress-value${status === "converting" ? " is-indeterminate" : ""}`} style={{ width: status === "converting" ? undefined : `${status === "completed" ? 100 : progress}%` }} />
          </div>
          {status === "completed" && <p className="success-message" role="status"><Check size={13} /> Converted successfully. Your upload has been cleared.</p>}
          {error && <p className="error-message" role="alert">{error}{requestId && <span> Reference: {requestId}</span>}</p>}
          {validationError && <p className="error-message" role="alert">{validationError}</p>}
        </motion.div>
      )}

      {!file && validationError && <p className="error-message" role="alert">{validationError}</p>}

      <div className={`converter-actions${status === "completed" ? " has-download" : ""}`}>
        {status === "completed" && pdfUrl ? (
          <>
            <a className="download-button" href={pdfUrl} download={toPdfFilename(file?.name ?? "document.txt")}><ArrowDownToLine size={15} /> Download PDF</a>
            <button className="button button-secondary" type="button" onClick={removeFile}>Convert another</button>
          </>
        ) : status === "error" ? (
          <>
            <button className="button button-primary" type="submit" disabled={busy}><RefreshCw size={14} /> Try again</button>
            <button className="button button-secondary" type="button" onClick={removeFile}>Choose another</button>
          </>
        ) : (
          <button className="button button-primary" type="submit" disabled={!file || busy}>
            {busy ? <><span className="button-spinner" aria-hidden="true" /> {status === "uploading" ? "Uploading…" : "Converting…"}</> : <><LockKeyhole size={14} /> Convert to PDF</>}
          </button>
        )}
      </div>
      <p className="sr-only" aria-live="polite">{busy ? (status === "uploading" ? "Uploading document" : "Converting document") : status === "completed" ? "Conversion completed. Download is available." : ""}</p>
    </form>
  );
}
