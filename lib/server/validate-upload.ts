import path from "node:path";

export type SupportedExtension = "doc" | "docx" | "txt";
export type ValidatedUpload = { extension: SupportedExtension; bytes: Buffer; downloadName: string };

export class UploadValidationError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "UploadValidationError";
  }
}

const MIME_BY_EXTENSION: Record<SupportedExtension, string[]> = {
  doc: ["", "application/msword", "application/vnd.ms-word", "application/octet-stream"],
  docx: ["", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip", "application/octet-stream"],
  txt: ["", "text/plain", "application/octet-stream"],
};

const LEGACY_WORD_SIGNATURE = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const MAX_ZIP_ENTRIES = 10_000;
const MAX_EXPANDED_ZIP_BYTES = 150 * 1024 * 1024;

function extensionOf(name: string): SupportedExtension | undefined {
  const ext = path.extname(name).slice(1).toLowerCase();
  return ext === "doc" || ext === "docx" || ext === "txt" ? ext : undefined;
}

function safeDownloadName(original: string) {
  const basename = path.basename(original.replaceAll("\\", "/"));
  const stem = basename.replace(/\.[^.]*$/, "")
    .replace(/[\u0000-\u001f\u007f"\\/<>:*?|]/g, "_")
    .trim()
    .replace(/[. ]+$/g, "")
    .slice(0, 140);
  return `${stem || "converted-document"}.pdf`;
}

function validateDocxZip(bytes: Buffer) {
  if (bytes.length < 22 || bytes.readUInt32LE(0) !== 0x04034b50) return false;
  const searchStart = Math.max(0, bytes.length - 65_557);
  let eocd = -1;
  for (let index = bytes.length - 22; index >= searchStart; index -= 1) {
    if (bytes.readUInt32LE(index) === 0x06054b50) {
      eocd = index;
      break;
    }
  }
  if (eocd < 0) return false;

  const entryCount = bytes.readUInt16LE(eocd + 10);
  const entriesOnDisk = bytes.readUInt16LE(eocd + 8);
  const centralSize = bytes.readUInt32LE(eocd + 12);
  const centralOffset = bytes.readUInt32LE(eocd + 16);
  const commentLength = bytes.readUInt16LE(eocd + 20);
  if (
    bytes.readUInt16LE(eocd + 4) !== 0 || bytes.readUInt16LE(eocd + 6) !== 0
    || entriesOnDisk !== entryCount || entryCount === 0 || entryCount > MAX_ZIP_ENTRIES
    || eocd + 22 + commentLength !== bytes.length || centralOffset + centralSize > eocd
  ) return false;

  let cursor = centralOffset;
  let expandedBytes = 0;
  const names = new Set<string>();
  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > bytes.length || bytes.readUInt32LE(cursor) !== 0x02014b50) return false;
    const flags = bytes.readUInt16LE(cursor + 8);
    const compressed = bytes.readUInt32LE(cursor + 20);
    const expanded = bytes.readUInt32LE(cursor + 24);
    const nameLength = bytes.readUInt16LE(cursor + 28);
    const extraLength = bytes.readUInt16LE(cursor + 30);
    const commentLength = bytes.readUInt16LE(cursor + 32);
    const end = cursor + 46 + nameLength + extraLength + commentLength;
    if (end > bytes.length || flags & 0x1) return false;
    expandedBytes += expanded;
    if (expandedBytes > MAX_EXPANDED_ZIP_BYTES || (expanded > 0 && compressed === 0)) return false;
    if (compressed > 0 && expanded / compressed > 250) return false;
    const name = bytes.toString("utf8", cursor + 46, cursor + 46 + nameLength);
    if (name.startsWith("/") || name.includes("\\") || name.includes("\0") || name.split("/").includes("..")) return false;
    names.add(name);
    cursor = end;
  }
  return names.has("[Content_Types].xml") && names.has("word/document.xml");
}

function validateText(bytes: Buffer) {
  if (bytes.length === 0) return false;
  try {
    const text = bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe
      ? new TextDecoder("utf-16le", { fatal: true }).decode(bytes.subarray(2))
      : bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff
        ? new TextDecoder("utf-16be", { fatal: true }).decode(bytes.subarray(2))
        : new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (text.includes("\0")) return false;
    let unusualControls = 0;
    for (const char of text) {
      const code = char.codePointAt(0) ?? 0;
      if ((code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0c && code !== 0x0d) || code === 0x7f) {
        unusualControls += 1;
      }
    }
    return unusualControls / Math.max(1, text.length) < 0.01;
  } catch {
    return false;
  }
}

export async function validateUpload(file: File): Promise<ValidatedUpload> {
  const extension = extensionOf(file.name);
  if (!extension) throw new UploadValidationError("Choose a DOC, DOCX, or TXT file.");
  const mime = file.type.toLowerCase().split(";")[0].trim();
  if (!MIME_BY_EXTENSION[extension].includes(mime)) {
    throw new UploadValidationError("The file type does not match its extension.");
  }
  if (file.size === 0) throw new UploadValidationError("This file is empty.");

  const bytes = Buffer.from(await file.arrayBuffer());
  const valid = extension === "doc"
    ? bytes.subarray(0, LEGACY_WORD_SIGNATURE.length).equals(LEGACY_WORD_SIGNATURE)
    : extension === "docx"
      ? validateDocxZip(bytes)
      : validateText(bytes);
  if (!valid) throw new UploadValidationError("This file could not be verified as a valid document.");
  return { extension, bytes, downloadName: safeDownloadName(file.name) };
}
