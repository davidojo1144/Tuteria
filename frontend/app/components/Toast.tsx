"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
type ToastType = "success" | "error" | "info";
type ToastItem = { id: string; type: ToastType; title?: string; message?: string; duration?: number };
type ToastContextValue = { show: (t: Omit<ToastItem, "id">) => void };
const ToastContext = createContext<ToastContextValue | null>(null);
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("ToastProvider missing");
  return ctx;
}
function Icon({ type }: { type: ToastType }) {
  const map: Record<ToastType, { icon: string; color: string }> = {
    success: { icon: "check_circle", color: "text-green-600 dark:text-green-400" },
    error: { icon: "error", color: "text-red-600 dark:text-red-400" },
    info: { icon: "info", color: "text-blue-600 dark:text-blue-400" },
  };
  const s = map[type];
  return <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>;
}
export function ToastProvider({ children }: { children: any }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, type: t.type || "info", title: t.title, message: t.message, duration: t.duration || 4500 };
    setItems((prev) => [...prev, item]);
    const ms = item.duration!;
    setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), ms);
  }, []);
  const close = useCallback((id: string) => setItems((prev) => prev.filter((x) => x.id !== id)), []);
  const value = useMemo(() => ({ show }), [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[1000] flex flex-col gap-3">
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto w-[320px] rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111] p-4 flex items-start gap-3 transition transform"
          >
            <div className="mt-0.5">
              <Icon type={t.type} />
            </div>
            <div className="flex-1 min-w-0">
              {t.title && <div className="text-sm font-bold text-primary dark:text-white">{t.title}</div>}
              {t.message && <div className="text-sm text-gray-600 dark:text-gray-300 break-words">{t.message}</div>}
            </div>
            <button
              className="ml-2 text-gray-400 hover:text-primary dark:hover:text-white transition-colors"
              onClick={() => close(t.id)}
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
