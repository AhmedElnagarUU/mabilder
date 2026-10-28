export function SectionLabel({
  num,
  label,
  aside,
  center = false,
}: {
  num?: string;
  label: string;
  aside?: string;
  center?: boolean;
}) {
  return (
    <div
      className={`mono-label flex items-center gap-[13px] text-[9px] tracking-[0.17em] text-[#75757c] ${
        center ? "justify-center" : ""
      }`}
    >
      {center ? null : <span aria-hidden className="h-px w-7 bg-[#3a3a40]" />}
      {num ? <span className="text-[#9d9da4]">{num}</span> : null}
      <span>{label}</span>
      {aside ? (
        <>
          <span aria-hidden className="h-px flex-1 bg-line-soft" />
          <span>{aside}</span>
        </>
      ) : null}
    </div>
  );
}
