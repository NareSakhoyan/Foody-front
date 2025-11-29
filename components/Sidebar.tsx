'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Discover' },
  { href: '/my-recipes', label: 'My recipes' },
  { href: '/pantry', label: 'Pantry' },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <nav className="w-full max-w-[220px] rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-foreground uppercase tracking-wide">
        Menu
      </div>
      <ul className="space-y-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === item.href
              : pathname?.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground',
                )}
              >
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Sidebar;
