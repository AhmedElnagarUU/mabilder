type ButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "soft"
  | "ghost"
  | "danger"
  | "inverse";
type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white shadow-[0_10px_24px_-12px_rgba(6,91,92,0.65),inset_0_1px_0_rgba(255,255,255,0.24)] hover:-translate-y-px hover:bg-accent-strong",
  accent:
    "bg-accent text-white shadow-[0_10px_24px_-12px_rgba(6,91,92,0.65),inset_0_1px_0_rgba(255,255,255,0.24)] hover:-translate-y-px hover:bg-accent-strong",
  secondary:
    "border border-white/85 bg-white/55 text-ink shadow-[inset_0_1px_0_#ffffff] backdrop-blur hover:-translate-y-px hover:bg-white/85",
  soft: "border border-white/85 bg-accent-soft text-accent-strong hover:bg-[#cfeeea]",
  ghost: "text-muted hover:bg-accent/10 hover:text-ink",
  danger:
    "border border-danger/15 bg-danger-soft text-danger hover:bg-danger/12",
  inverse: "bg-white text-ink shadow-[0_12px_28px_-16px_rgba(2,40,42,0.55)] hover:-translate-y-px hover:bg-white/90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-[18px] text-sm",
  lg: "h-[54px] px-7 text-sm",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
): string {
  return [base, variants[variant], sizes[size], className]
    .filter(Boolean)
    .join(" ");
}
