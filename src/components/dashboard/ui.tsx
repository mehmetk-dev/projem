export function Panel({ title, children, onAll }: { title: string; children: React.ReactNode; onAll?: () => void }) {
  return (
    <div className="bg-neutral-100 dark:bg-neutral-900/30 border border-neutral-200 dark:border-white/5 rounded-2xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-sm uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{title}</h2>
        {onAll && <button onClick={onAll} className="text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Tümü →</button>}
      </div>
      {children}
    </div>
  );
}

export function Empty() { return <p className="text-sm text-neutral-500 dark:text-neutral-400">Henüz yok.</p>; }

export function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>;
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-neutral-100 dark:bg-neutral-900/30 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 transition-all hover:border-neutral-400 dark:hover:border-white/10 ${className}`}>{children}</div>;
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
        rows={rows}
        required={required}
        className="w-full bg-transparent border-b border-neutral-300 dark:border-white/10 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 dark:focus:border-white/30 transition-colors resize-none"
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
      required={required}
      className="w-full bg-transparent border-b border-neutral-300 dark:border-white/10 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 dark:focus:border-white/30 transition-colors"
    />
  );
}

export function Btn({ children, onClick, variant = 'default' }: { children: React.ReactNode; onClick?: () => void; variant?: 'default' | 'danger' | 'ghost' }) {
  const base = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all';
  const styles = {
    default: 'bg-neutral-900 text-white dark:bg-white dark:text-black hover:bg-neutral-700 dark:hover:bg-neutral-200',
    danger: 'text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 border border-rose-500/20 hover:bg-rose-500/10',
    ghost: 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/20',
  };
  return <button type="button" onClick={onClick} className={`${base} ${styles[variant]}`}>{children}</button>;
}

export function ActionBtn({ onClick, title, children }: { onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} className="p-1.5 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors">
      {children}
    </button>
  );
}

export function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  );
}
