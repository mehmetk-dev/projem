/*
 * Dashboard ortak bileşenleri ve sınıfları.
 * Renkler tema token'larıdır (bg-surface, text-ink, border-line…); açık/koyu mod
 * dashboard.css'te tanımlandığı için burada dark: varyantı yazılmaz.
 */

/** Modüllerde doğrudan kullanılacak ortak sınıflar */
export const ui = {
  card: 'rounded-2xl border border-line bg-surface',
  label: 'mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted',
  input:
    'w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 outline-none transition-colors focus:border-accent',
  sectionTitle: 'font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted',
  btnPrimary:
    'inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-accent hover:text-white disabled:opacity-50 disabled:pointer-events-none',
  btnSecondary:
    'inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-50',
  badge: 'inline-flex items-center rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-soft',
} as const;

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ title, children, onAll }: { title: string; children: React.ReactNode; onAll?: () => void }) {
  return (
    <div className={`${ui.card} p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={ui.sectionTitle}>{title}</h2>
        {onAll && (
          <button type="button" onClick={onAll} className="text-[12px] font-medium text-ink-muted transition-colors hover:text-accent">
            Tümü →
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function Empty({ text = 'Henüz yok.' }: { text?: string }) {
  return <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink-muted">{text}</p>;
}

export function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`${ui.card} p-5 transition-colors hover:border-ink/15 ${className}`}>{children}</div>;
}

type InputProps = {
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  placeholder?: string;
  type?: string;
  rows?: number;
  required?: boolean;
};

export function Input({ name, value, onChange, placeholder, type = 'text', rows, required }: InputProps) {
  if (rows) {
    return (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        rows={rows}
        required={required}
        className={`${ui.input} resize-none`}
      />
    );
  }
  return (
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={placeholder}
      required={required}
      className={ui.input}
    />
  );
}

export function Btn({ children, onClick, variant = 'default' }: { children: React.ReactNode; onClick?: () => void; variant?: 'default' | 'danger' | 'ghost' }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors';
  const styles = {
    default: 'bg-ink text-paper hover:bg-accent hover:text-white',
    danger: 'border border-rose-500/25 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400',
    ghost: 'border border-line text-ink-muted hover:border-ink/30 hover:text-ink',
  };
  return <button type="button" onClick={onClick} className={`${base} ${styles[variant]}`}>{children}</button>;
}

export function ActionBtn({ onClick, title, children }: { onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {children}
    </button>
  );
}

export function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  );
}
