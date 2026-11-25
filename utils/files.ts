export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function toPdfFilename(originalName: string) {
  const basename = originalName.replaceAll("\\", "/").split("/").pop() ?? "";
  const name = basename.replace(/\.[^.]*$/, "")
    .replace(/[\u0000-\u001f\u007f"\\/<>:*?|]/g, "_")
    .trim()
    .slice(0, 140);
  return `${name || "converted-document"}.pdf`;
}
