'use client';

import { SignedIn, SignOutButton } from '@clerk/nextjs';
import {
  BookOpen,
  Compass,
  LogOut,
  Settings,
  ShoppingBasket,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import ThemeToggle from './ThemeToggle';
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Discover', icon: Compass },
  { href: '/my-recipes', label: 'My recipes', icon: BookOpen },
  { href: '/pantry', label: 'Pantry', icon: ShoppingBasket },
];

const SidebarNav = ({ pathname }: { pathname: string | null }) => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <>
      <SidebarHeader className="flex flex-row items-center justify-between">
        <span
          className={cn(
            'text-xs font-semibold uppercase tracking-wide text-muted-foreground',
            collapsed && 'sr-only',
          )}
        >
          Menu
        </span>
        <SidebarTrigger className="hidden md:inline-flex" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && 'sr-only')}>
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === item.href
                  : pathname?.startsWith(item.href);

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3">
        <SidebarSeparator />
        <ThemeToggle collapsed={collapsed} />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname?.startsWith('/settings')}
              tooltip="Settings"
            >
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SignedIn>
            <SidebarMenuItem>
              <SignOutButton redirectUrl="/">
                <SidebarMenuButton asChild tooltip="Logout">
                  <button
                    type="button"
                    className="text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SignOutButton>
            </SidebarMenuItem>
          </SignedIn>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
};

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <SidebarProvider className="flex-none w-auto min-h-0">
      <div className="md:sticky md:top-4 md:h-[calc(100vh-5rem)] md:self-start">
        <div className="mb-4 md:hidden">
          <SidebarTrigger className="justify-start gap-2" />
        </div>
        <UISidebar
          collapsible="icon"
          className="w-64 border bg-card shadow-sm md:w-64"
        >
          <SidebarNav pathname={pathname} />
          <SidebarRail />
        </UISidebar>
      </div>
    </SidebarProvider>
  );
};

export default Sidebar;
