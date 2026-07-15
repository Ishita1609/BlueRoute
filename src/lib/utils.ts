import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatWeight(weight: number): string {
  return `${weight.toFixed(2)} kg`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatLastLogin(date: Date | string | null): string {
  if (!date) return "Never";
  const d = new Date(date);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86400000);

  if (dayDiff === 0) {
    return `Today ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff > 1) return `${dayDiff} days ago`;
  return formatDate(d);
}

export function generateTrackingNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `CL-${year}-${random}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "BOOKED": return "bg-blue-100 text-blue-800";
    case "IN_TRANSIT": return "bg-yellow-100 text-yellow-800";
    case "OUT_FOR_DELIVERY": return "bg-orange-100 text-orange-800";
    case "DELIVERED": return "bg-green-100 text-green-800";
    case "CANCELLED": return "bg-red-100 text-red-800";
    case "RETURNED": return "bg-purple-100 text-purple-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

export function getModeIcon(mode: string): string {
  switch (mode) {
    case "ROAD": return "🚛";
    case "TRAIN": return "🚂";
    case "AIR": return "✈️";
    default: return "📦";
  }
}

export function getExpenseCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    FUEL: "Fuel",
    SALARY: "Salary",
    RENT: "Rent",
    TRAIN_CHARGES: "Train Charges",
    AIR_CHARGES: "Air Charges",
    LOADING: "Loading",
    UNLOADING: "Unloading",
    MISC: "Miscellaneous",
  };
  return map[cat] || cat;
}

export function getPaymentModeLabel(mode: string): string {
  const map: Record<string, string> = {
    CASH: "Cash",
    BANK_TRANSFER: "Bank Transfer",
    UPI: "UPI",
    CHEQUE: "Cheque",
    CREDIT: "Credit",
  };
  return map[mode] || mode;
}
