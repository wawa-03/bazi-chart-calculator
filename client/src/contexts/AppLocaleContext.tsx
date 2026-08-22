import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { type ManualLocale } from "@/lib/manualLanguage";

type AppLocaleContextValue = {
  locale: ManualLocale;
  source: string;
  isLoading: boolean;
  setLocale: (locale: ManualLocale) => void;
};

const AppLocaleContext = createContext<AppLocaleContextValue | null>(null);

export function AppLocaleProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const localeQuery = trpc.locale.current.useQuery();
  const [sessionLocale, setSessionLocale] = useState<ManualLocale | null>(null);
  const setPreference = trpc.locale.set.useMutation({
    onSuccess: () => localeQuery.refetch(),
  });
  const locale = sessionLocale || localeQuery.data?.locale || "zh-CN";

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<AppLocaleContextValue>(() => ({
    locale,
    source: sessionLocale ? "session-choice" : localeQuery.data?.source || "fallback",
    isLoading: localeQuery.isLoading,
    setLocale(nextLocale) {
      setSessionLocale(nextLocale);
      if (isAuthenticated) setPreference.mutate({ locale: nextLocale });
    },
  }), [isAuthenticated, locale, localeQuery.data?.source, localeQuery.isLoading, sessionLocale, setPreference]);

  return <AppLocaleContext.Provider value={value}>{children}</AppLocaleContext.Provider>;
}

export function useAppLocale() {
  const context = useContext(AppLocaleContext);
  if (!context) throw new Error("useAppLocale must be used within AppLocaleProvider");
  return context;
}
