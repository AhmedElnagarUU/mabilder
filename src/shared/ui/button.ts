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
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#f2f2ee] text-[#08080a] hover:-translate-y-px hover:bg-white",
  accent:
    "bg-accent text-[#04211f] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] hover:-translate-y-px hover:bg-[#8ff5e4]",
  secondary:
    "border border-white/[0.13] bg-white/[0.045] text-[#e7e7e5] backdrop-blur-[16px] hover:-translate-y-px hover:border-white/[0.22] hover:bg-white/[0.09]",
  soft: "border border-accent/20 bg-accent/10 text-accent hover:bg-accent/15",
  ghost: "text-muted hover:bg-white/[0.06] hover:text-ink",
  danger:
    "border border-danger/25 bg-danger-soft text-danger hover:bg-danger/15",
  inverse:
    "bg-white text-[#08080a] hover:-translate-y-px hover:bg-white/90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-[18px] text-sm",
  lg: "h-[52px] px-6 text-[13px]",
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
