export default function EmptyState({ icon, title, description, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
