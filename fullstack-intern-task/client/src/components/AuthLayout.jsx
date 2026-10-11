import { LogoMark } from './icons';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto flex max-w-md flex-col py-6 sm:py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <LogoMark className="mb-4 h-12 w-12" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        {children}
      </div>

      {footer && <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>}
    </div>
  );
}
