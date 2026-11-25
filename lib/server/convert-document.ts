import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { CONVERSION_TIMEOUT_MS } from "@/lib/server/config";
import type { SupportedExtension } from "@/lib/server/validate-upload";

const MAX_PDF_BYTES = 50 * 1024 * 1024;

function runLibreOffice(inputPath: string, outputDirectory: string, profileDirectory: string) {
  const command = process.env.LIBREOFFICE_BIN || "soffice";
  const args = [
    "--headless", "--nologo", "--nodefault", "--nolockcheck", "--norestore",
    `-env:UserInstallation=${pathToFileURL(profileDirectory).href}`,
    "--convert-to", "pdf:writer_pdf_Export", "--outdir", outputDirectory, inputPath,
  ];

  return new Promise<void>((resolve, reject) => {
    let timeoutHit = false;
    const process = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    // Consume output without logging it: office tools can include document
    // metadata in diagnostics, and that should not enter application logs.
    process.stdout.resume();
    process.stderr.resume();

    const timer = setTimeout(() => {
      timeoutHit = true;
      process.kill("SIGKILL");
    }, CONVERSION_TIMEOUT_MS);

    process.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    process.once("close", (code, signal) => {
      clearTimeout(timer);
      if (timeoutHit) {
        reject(new Error("Document conversion timed out."));
      } else if (code !== 0) {
        reject(new Error(`LibreOffice exited with ${signal ?? code}.`));
      } else {
        resolve();
      }
    });
  });
}

export async function convertDocument(bytes: Buffer, extension: SupportedExtension) {
  const workDirectory = await mkdtemp(path.join(os.tmpdir(), "pdfforge-"));
  const inputPath = path.join(workDirectory, `source.${extension}`);
  const outputDirectory = path.join(workDirectory, "output");
  const profileDirectory = path.join(workDirectory, "profile");
  const outputPath = path.join(outputDirectory, "source.pdf");

  try {
    await Promise.all([
      writeFile(inputPath, bytes, { mode: 0o600, flag: "wx" }),
      mkdir(outputDirectory, { mode: 0o700 }),
      mkdir(profileDirectory, { mode: 0o700 }),
    ]);
    await runLibreOffice(inputPath, outputDirectory, profileDirectory);
    const info = await stat(outputPath);
    if (!info.isFile() || info.size < 5 || info.size > MAX_PDF_BYTES) {
      throw new Error("The generated PDF is empty or too large.");
    }
    const pdf = await readFile(outputPath);
    if (pdf.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error("The conversion did not produce a valid PDF.");
    return pdf;
  } finally {
    await rm(workDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}
