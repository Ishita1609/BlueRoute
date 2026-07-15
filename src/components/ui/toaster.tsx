"use client";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { useToast, dismissToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-lg border-l-4 bg-white p-4 shadow-lg ${
            t.variant === "success" ? "border-green-500" : "border-red-500"
          }`}
        >
          {t.variant === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">{t.title}</p>
            {t.description && <p className="mt-0.5 text-xs text-gray-500">{t.description}</p>}
          </div>
          <button onClick={() => dismissToast(t.id)} className="shrink-0 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
