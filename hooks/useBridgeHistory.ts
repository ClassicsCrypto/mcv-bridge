"use client";

import { useEffect, useState, useCallback } from "react";

export interface BridgeHistoryEntry {
  txHash: string;
  tokenIds: string[];
  fromChain: string;
  toChain: string;
  timestamp: number;
  status: "completed" | "pending";
}

const STORAGE_KEY = "mcv_bridge_history";
const MAX_ENTRIES = 10;

export function useBridgeHistory() {
  const [history, setHistory] = useState<BridgeHistoryEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const addEntry = useCallback((entry: BridgeHistoryEntry) => {
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, MAX_ENTRIES);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  return { history, addEntry };
}
