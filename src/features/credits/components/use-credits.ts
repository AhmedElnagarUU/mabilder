"use client";

import { useEffect, useState } from "react";
import type { CreditBalance } from "../types";

export function useCredits(): [CreditBalance | null, (balance: CreditBalance) => void] {
  const [balance, setBalance] = useState<CreditBalance | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/credits")
      .then((response) => (response.ok ? (response.json() as Promise<CreditBalance>) : null))
      .then((loaded) => {
        if (!cancelled && loaded) {
          setBalance(loaded);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  return [balance, setBalance];
}
