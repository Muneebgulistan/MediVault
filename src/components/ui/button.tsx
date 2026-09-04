export function Button({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--ink-0)] transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
