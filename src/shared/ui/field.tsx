export const inputClass =
  "w-full rounded-xl border border-line bg-white/[0.025] px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-faint focus:border-accent/45 focus:bg-white/[0.04] focus:ring-2 focus:ring-accent/15";

export const labelClass =
  "mb-1.5 block font-mono text-[11px] font-medium tracking-[0.1em] text-muted uppercase";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className={labelClass}>
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className={labelClass}>
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`${inputClass} resize-y`}
      />
    </label>
  );
}
