const integerSetting = (name: string, fallback: number, min: number, max: number) => {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value >= min && value <= max ? value : fallback;
};

export const MAX_UPLOAD_BYTES = integerSetting("NEXT_PUBLIC_MAX_UPLOAD_MB", 25, 1, 25) * 1024 * 1024;
export const RATE_LIMIT_WINDOW_MS = integerSetting("RATE_LIMIT_WINDOW_MS", 900_000, 60_000, 86_400_000);
export const RATE_LIMIT_MAX = integerSetting("RATE_LIMIT_MAX", 10, 1, 100);
export const CONVERSION_TIMEOUT_MS = integerSetting("CONVERSION_TIMEOUT_MS", 45_000, 5_000, 120_000);

export const UPLOAD_LIMIT_LABEL = `${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB`;
