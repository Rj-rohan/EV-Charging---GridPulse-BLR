"use client";
import { useState, useCallback } from "react";
import { askGroq } from "@/lib/groq";

export function useGroq<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetch = useCallback(async (prompt: string, context?: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await askGroq<T>(prompt, context);
      setData(result);
      setLastFetched(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch AI data");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, lastFetched, fetch };
}
