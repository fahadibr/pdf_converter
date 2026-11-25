export type ConversionStatus = "idle" | "uploading" | "converting" | "completed" | "error";

export type ConversionFormValues = { file?: File };

export type ConversionApiError = {
  error?: string;
  requestId?: string;
};
