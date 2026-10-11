const STYLES = {
  error: 'bg-red-50 text-red-800 ring-red-200',
  info: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
};

export default function Alert({ type = 'error', children, onClose, className = '' }) {
  if (!children) return null;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`flex items-start justify-between gap-3 rounded-lg px-4 py-3 text-sm ring-1 ring-inset ${STYLES[type]} ${className}`}
    >
      <div>{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="-mr-1 rounded px-1 text-lg leading-none opacity-60 hover:opacity-100"
          aria-label="Dismiss"
        >
          &times;
        </button>
      )}
    </div>
  );
}
