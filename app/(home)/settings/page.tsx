'use client';

import { SignedIn, SignOutButton } from '@clerk/nextjs';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

const SettingsPage = () => {
  return (
    <div>
      <Header />
      <div className="flex flex-col gap-6 px-4 pb-10 pt-6 md:flex-row md:items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-muted-foreground">
              Update your preferences and account controls.
            </p>
          </div>

          <section className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Theme</h2>
                <p className="text-sm text-muted-foreground">
                  Choose the appearance that matches your workspace.
                </p>
              </div>
              <ThemeToggle />
            </div>
          </section>

          <section className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Account</h2>
                <p className="text-sm text-muted-foreground">
                  Sign out of Foody on this device.
                </p>
              </div>
              <SignedIn>
                <SignOutButton redirectUrl="/">
                  <Button variant="outline">Logout</Button>
                </SignOutButton>
              </SignedIn>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
