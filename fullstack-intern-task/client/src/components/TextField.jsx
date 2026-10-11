export default function TextField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  autoComplete,
  placeholder,
  disabled = false,
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`input disabled:bg-slate-50 ${
          error ? 'ring-red-400 focus:ring-red-500' : ''
        }`}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
