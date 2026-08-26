export function Button({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium bg-teal-500 hover:bg-teal-600 text-slate-950 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
