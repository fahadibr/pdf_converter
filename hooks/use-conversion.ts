"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConversionClientError, startConversionRequest } from "@/services/conversion-client";
import type { ConversionStatus } from "@/types/conversion";

const INITIAL_STATUS: ConversionStatus = "idle";

export function useConversion() {
  const [status, setStatus] = useState<ConversionStatus>(INITIAL_STATUS);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const requestRef = useRef<ReturnType<typeof startConversionRequest> | null>(null);
  const pdfUrlRef = useRef("");

  const revokePdf = useCallback(() => {
    if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    pdfUrlRef.current = "";
    setPdfUrl("");
  }, []);

  const reset = useCallback(() => {
    const request = requestRef.current;
    requestRef.current = null;
    request?.abort();
    revokePdf();
    setStatus(INITIAL_STATUS);
    setProgress(0);
    setError("");
    setRequestId("");
  }, [revokePdf]);

  const convert = useCallback(async (file: File) => {
    requestRef.current?.abort();
    requestRef.current = null;
    revokePdf();
    setStatus("uploading");
    setProgress(0);
    setError("");
    setRequestId("");

    const request = startConversionRequest(file, {
      onUploadProgress: (value) => setProgress(value),
      onConverting: () => { setStatus("converting"); setProgress(72); },
    });
    requestRef.current = request;

    try {
      const pdf = await request.promise;
      if (requestRef.current !== request) return;
      const url = URL.createObjectURL(pdf);
      pdfUrlRef.current = url;
      setPdfUrl(url);
      setProgress(100);
      setStatus("completed");
    } catch (cause) {
      if (requestRef.current !== request || (cause instanceof DOMException && cause.name === "AbortError")) return;
      setError(cause instanceof Error ? cause.message : "The conversion failed. Please retry.");
      setRequestId(cause instanceof ConversionClientError ? cause.requestId ?? "" : "");
      setStatus("error");
      setProgress(0);
    } finally {
      if (requestRef.current === request) requestRef.current = null;
    }
  }, [revokePdf]);

  useEffect(() => () => {
    requestRef.current?.abort();
    if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
  }, []);

  return { status, progress, error, requestId, pdfUrl, convert, reset };
}
