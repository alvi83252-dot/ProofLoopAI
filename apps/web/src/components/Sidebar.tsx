'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, ICON_PATHS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg gradient-text">Corroba</h1>
            <p className="text-[10px] text-muted-foreground">Proof → Growth Engine</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-primary/15 text-primary shadow-sm shadow-primary/10'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-1'
                )}
              >
                <svg className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-110', active && 'text-primary')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICON_PATHS[item.icon]} />
                </svg>
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-primary/10 p-3 text-xs">
            <p className="font-semibold text-primary">Demo Mode Active</p>
            <p className="mt-1 text-muted-foreground">Preloaded proof data ready. Upload or paste to discover more.</p>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
    </>
  );
}
