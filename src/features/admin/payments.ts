import {
  approvePayment,
  listPayments,
  rejectPayment,
} from "../billing/payments/service";
import type { ReviewPaymentResult } from "../billing/payments/types";
import { getProPriceEgp } from "../billing/settings/service";
import { findUsersByIds } from "./repository";
import { ADMIN_ACTOR_ID, type AdminPaymentList } from "./types";

export async function listAdminPayments(queryInput: unknown): Promise<AdminPaymentList> {
  const payments = await listPayments(queryInput);
  const users = await findUsersByIds([...new Set(payments.map((payment) => payment.userId))]);

  return {
    items: payments.map((payment) => ({
      ...payment,
      userName: users.get(payment.userId)?.name ?? "",
      userEmail: users.get(payment.userId)?.email ?? "",
    })),
    expectedPriceEgp: getProPriceEgp(),
  };
}

export function approveUserPayment(paymentId: string, input: unknown): Promise<ReviewPaymentResult> {
  return approvePayment(paymentId, ADMIN_ACTOR_ID, input);
}

export function rejectUserPayment(paymentId: string, input: unknown): Promise<ReviewPaymentResult> {
  return rejectPayment(paymentId, ADMIN_ACTOR_ID, input);
}
