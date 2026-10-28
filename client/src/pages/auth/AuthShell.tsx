import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Car, Gauge, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-main px-4 py-10">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-primary-yellow/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-[120px]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary shadow-2xl lg:grid-cols-[1.05fr_1fr]">
        <div className="hidden flex-col justify-between border-r border-border-subtle bg-bg-sidebar p-8 lg:flex">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-yellow text-black shadow-[0_0_32px_rgba(255,212,0,0.2)]">
              <Car className="h-6 w-6" strokeWidth={2.4} />
            </span>
            <span>
              <span className="block font-display text-2xl font-extrabold tracking-[0.18em] text-text-main">
                MY<span className="text-primary-yellow">VEEL</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-text-secondary">
                Smart Garage
              </span>
            </span>
          </Link>

          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-yellow/30 bg-primary-yellow/10 px-3 py-1 text-[11px] font-medium text-primary-yellow">
              <Sparkles className="h-3.5 w-3.5" /> Every vehicle. One command centre.
            </p>
            <h2 className="max-w-sm font-display text-3xl font-bold leading-tight text-text-main">
              Track every service, renewal and rupee in one premium garage.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-secondary">
              MyVeel keeps your maintenance history, legal documents, insurance, warranties and
              running costs organized — without any in-car hardware.
            </p>
            <div className="mt-8 grid gap-3 text-sm">
              <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-card p-3">
                <Gauge className="h-5 w-5 text-primary-yellow" />
                <span className="text-text-secondary">Odometer trends & fuel efficiency analytics</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-card p-3">
                <ShieldCheck className="h-5 w-5 text-primary-yellow" />
                <span className="text-text-secondary">Staged renewal alerts for every document</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-card p-3">
                <Sparkles className="h-5 w-5 text-primary-yellow" />
                <span className="text-text-secondary">PDF vehicle dossiers on demand</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-text-secondary">
            Hardware-independent · Multi-vehicle · Secure by design
          </p>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-9">
          <div className="mb-7 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-yellow text-black">
                <Car className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-extrabold tracking-[0.16em]">
                MY<span className="text-primary-yellow">VEEL</span>
              </span>
            </Link>
          </div>
          <h1 className="font-display text-2xl font-bold text-text-main">{title}</h1>
          <p className="mt-1.5 text-sm text-text-secondary">{subtitle}</p>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-sm text-text-secondary">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
