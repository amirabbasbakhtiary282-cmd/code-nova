"use client";

import { cn } from "@/lib/utils";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used inside <Tabs>");
  return ctx;
}

export function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const [value, setValue] = useState(defaultValue);
  const context = useMemo(() => ({ value, setValue }), [value]);
  return <TabsContext.Provider value={context}>{children}</TabsContext.Provider>;
}

export function TabsList({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("inline-flex rounded-xl bg-surface-elevated p-1", className)}>{children}</div>;
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const { value: current, setValue } = useTabsContext();
  const active = current === value;

  return (
    <button
      type="button"
      onClick={() => setValue(value)}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: { value: string; children: ReactNode }) {
  const { value: current } = useTabsContext();
  if (current !== value) return null;
  return <div className="mt-4">{children}</div>;
}
