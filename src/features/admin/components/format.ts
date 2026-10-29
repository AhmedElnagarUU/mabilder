import type { ActivityType } from "@/features/activity/types";

export function formatDateTime(value: string | null): string {
  if (!value) {
    return "Never";
  }

  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).concat(" UTC");
}

export function formatDate(value: string | null): string {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleDateString("en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  });
}

export const activityLabels: Record<ActivityType, string> = {
  signed_up: "Created the account",
  signed_in: "Signed in",
  site_created: "Created the website",
  site_generated: "Website draft generated",
  site_generation_failed: "Website draft failed",
  content_saved: "Saved website changes",
  payment_submitted: "Submitted a payment",
  payment_approved: "Payment approved",
  payment_rejected: "Payment rejected",
  plan_changed: "Plan changed",
  account_deactivated: "Account deactivated",
  account_activated: "Account activated",
  feedback_sent: "Sent feedback",
  feedback_replied: "Feedback replied to",
};
