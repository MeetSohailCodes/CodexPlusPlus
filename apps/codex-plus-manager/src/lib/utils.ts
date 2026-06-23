import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stringifyError(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function isSuccessStatus(status?: string) {
  return status === "ok" || status === "accepted";
}
