import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { convertDocument } from "@/lib/server/convert-document";
import { MAX_UPLOAD_BYTES, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "@/lib/server/config";
import { consumeRateLimit } from "@/lib/server/rate-limit";
import { UploadValidationError, validateUpload } from "@/lib/server/validate-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number, requestId: string, headers?: HeadersInit) {
  return NextResponse.json({ error: message, requestId }, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Request-Id": requestId,
      ...headers,
    },
  });
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  const origin = request.headers.get("origin");
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  let expectedOrigin: string;
  try {
    expectedOrigin = configuredOrigin ? new URL(configuredOrigin).origin : new URL(request.url).origin;
  } catch {
    console.error(`[${requestId}] NEXT_PUBLIC_SITE_URL is not a valid URL.`);
    return jsonError("The conversion service is temporarily unavailable. Please try again.", 503, requestId);
  }
  const allowedOrigins = new Set([expectedOrigin]);
  const proxyHost = request.headers.get("host");
  if (proxyHost) {
    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const protocol = forwardedProtocol === "https" || forwardedProtocol === "http"
      ? forwardedProtocol
      : new URL(request.url).protocol.slice(0, -1);
    try {
      allowedOrigins.add(new URL(`${protocol}://${proxyHost}`).origin);
    } catch {
      // Ignore malformed proxy metadata; the configured site origin still applies.
    }
  }
  if (origin && !allowedOrigins.has(origin)) return jsonError("This request could not be verified.", 403, requestId);
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return jsonError("This request could not be verified.", 403, requestId);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_UPLOAD_BYTES + 1024 * 1024) {
    return jsonError("The selected file is larger than the upload limit.", 413, requestId);
  }
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data;")) {
    return jsonError("Send the document as a multipart form upload.", 415, requestId);
  }

  const forwardedIp = request.headers.get("x-real-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
  const limit = consumeRateLimit(forwardedIp.slice(0, 100));
  if (!limit.allowed) {
    return jsonError("You’ve reached the conversion limit. Try again shortly.", 429, requestId, {
      "Retry-After": String(limit.retryAfterSeconds),
      "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(Math.ceil((Date.now() + limit.retryAfterSeconds * 1000) / 1000)),
      "X-RateLimit-Window": String(RATE_LIMIT_WINDOW_MS),
    });
  }

  try {
    const form = await request.formData();
    const candidate = form.get("file");
    if (!(candidate instanceof File)) return jsonError("Choose a document to convert.", 400, requestId);
    if (candidate.size > MAX_UPLOAD_BYTES) return jsonError("The selected file is larger than the upload limit.", 413, requestId);

    const upload = await validateUpload(candidate);
    const pdf = await convertDocument(upload.bytes, upload.extension);
    const encodedName = encodeURIComponent(upload.downloadName)
      .replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdf.length),
        "Content-Disposition": `attachment; filename="converted-document.pdf"; filename*=UTF-8''${encodedName}`,
        "Cache-Control": "private, no-store, max-age=0",
        "Pragma": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "X-Request-Id": requestId,
        "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    });
  } catch (error) {
    if (error instanceof UploadValidationError) return jsonError(error.message, error.status, requestId);
    if (error instanceof Error && error.message.includes("ENOENT")) {
      console.error(`[${requestId}] LibreOffice executable was not found.`);
      return jsonError("The conversion service is temporarily unavailable. Please try again.", 503, requestId);
    }
    if (error instanceof Error && error.message.includes("timed out")) {
      return jsonError("This document took too long to convert. Try a smaller or simpler file.", 422, requestId);
    }
    console.error(`[${requestId}] Conversion failed:`, error instanceof Error ? error.message : "Unknown error");
    return jsonError("We couldn’t convert this file. Check the document and try again.", 422, requestId);
  }
}
