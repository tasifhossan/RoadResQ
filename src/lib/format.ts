/**
 * Formatting utilities for RoadResQ frontend.
 * Backend uses BDT currency for payments and invoices.
 */

export function formatMoney(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") {
    return "BDT 0.00";
  }

  const numericValue = typeof amount === "string" ? parseFloat(amount) : Number(amount);

  if (isNaN(numericValue)) {
    return "BDT 0.00";
  }

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function formatDate(date: string | Date | number | null | undefined): string {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: string | Date | number | null | undefined): string {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatDistanceKm(distanceKm: number | string | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined || distanceKm === "") {
    return "0 km";
  }

  const num = typeof distanceKm === "string" ? parseFloat(distanceKm) : Number(distanceKm);

  if (isNaN(num)) {
    return "0 km";
  }

  const formatted = num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
  return `${formatted} km`;
}

export function relativeTime(date: string | Date | number | null | undefined): string {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const elapsedSeconds = Math.round((d.getTime() - now.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const cutoffs = [
    { limit: 60, unit: "second", factor: 1 },
    { limit: 3600, unit: "minute", factor: 60 },
    { limit: 86400, unit: "hour", factor: 3600 },
    { limit: 604800, unit: "day", factor: 86400 },
    { limit: 2592000, unit: "week", factor: 604800 },
    { limit: 31536000, unit: "month", factor: 2592000 },
    { limit: Infinity, unit: "year", factor: 31536000 },
  ];

  const absSeconds = Math.abs(elapsedSeconds);

  for (const { limit, unit, factor } of cutoffs) {
    if (absSeconds < limit) {
      const value = Math.round(elapsedSeconds / factor);
      return rtf.format(value, unit as Intl.RelativeTimeFormatUnit);
    }
  }

  return formatDate(d);
}
