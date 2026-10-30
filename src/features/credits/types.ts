export type CreditBalance = {
  limit: number;
  used: number;
  left: number;
  nextResetAt: string | null;
};

export type SpendResult =
  | { ok: true; useId: string }
  | { ok: false; nextResetAt: string | null };
