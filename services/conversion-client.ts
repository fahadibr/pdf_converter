import type { ConversionApiError } from "@/types/conversion";

export class ConversionClientError extends Error {
  constructor(message: string, public readonly requestId?: string) {
    super(message);
    this.name = "ConversionClientError";
  }
}

type ConversionCallbacks = {
  onUploadProgress: (percentage: number) => void;
  onConverting: () => void;
};

export function startConversionRequest(file: File, callbacks: ConversionCallbacks) {
  const xhr = new XMLHttpRequest();
  const promise = new Promise<Blob>((resolve, reject) => {
    xhr.open("POST", "/api/convert");
    xhr.responseType = "blob";
    xhr.timeout = 60_000;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) callbacks.onUploadProgress(Math.min(68, Math.max(4, Math.round((event.loaded / event.total) * 68))));
    };
    xhr.upload.onload = callbacks.onConverting;
    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300 && xhr.response instanceof Blob) {
        resolve(xhr.response);
        return;
      }
      let body: ConversionApiError = {};
      try {
        body = JSON.parse(await (xhr.response as Blob).text()) as ConversionApiError;
      } catch {
        // A proxy may return a non-JSON error page; show a generic message.
      }
      reject(new ConversionClientError(
        body.error || "We couldn’t convert this file. Check the document and try again.",
        body.requestId,
      ));
    };
    xhr.onerror = () => reject(new Error("A network error interrupted the conversion. Check your connection and retry."));
    xhr.ontimeout = () => reject(new Error("This conversion took too long. Try a smaller or simpler file."));
    xhr.onabort = () => reject(new DOMException("The conversion was cancelled.", "AbortError"));

    const payload = new FormData();
    payload.append("file", file);
    xhr.send(payload);
  });

  return { promise, abort: () => xhr.abort() };
}
