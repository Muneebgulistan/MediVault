"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Pill,
  Calendar,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Prescriptions", href: "/dashboard/prescriptions", icon: FileText },
  { label: "Medicines", href: "/dashboard/medicines", icon: Pill },
  { label: "Schedule", href: "/dashboard/schedule", icon: Calendar },
  { label: "Reminders", href: "/dashboard/reminders", icon: Bell },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface DashboardNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {/* Mobile Top Navbar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-surface)] px-4 backdrop-blur-xl md:hidden sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--ink-0)] shadow-md shadow-[var(--accent)]/15">
            <Pill className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="font-bold tracking-tight text-[var(--text-primary)] text-base">MediVault AI</span>
        </Link>
        <button
          onClick={toggleMobile}
          className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)] border border-[var(--border-default)] transition"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Desktop Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-[var(--border-default)] bg-[var(--bg-surface)] backdrop-blur-xl md:flex z-30">
        {/* Sidebar Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-[var(--border-default)] px-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--ink-0)] shadow-lg shadow-[var(--accent)]/20 group-hover:scale-105 transition-transform">
              <Pill className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-[var(--text-primary)] text-sm">MediVault AI</span>
              <span className="text-[9px] font-semibold text-[var(--accent)] tracking-wider">
                CLINICAL PORTAL
              </span>
            </div>
          </Link>

          {/* Connection status indicator */}
          <div className="flex items-center gap-1.5" title="Encrypted Connection Active">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-[var(--accent-bg)] text-[var(--accent-text)] font-semibold shadow-inner border border-[var(--accent)]/30"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)] hover:translate-x-0.5"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                )}
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                    isActive
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Security Badge & User Profile Block */}
        <div className="border-t border-[var(--border-default)] p-4 space-y-3 bg-[var(--bg-surface-alt)]/50">
          <div className="flex items-center gap-2 px-2 text-[10px] text-[var(--text-muted)] font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>Encrypted Vault Active</span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-bg)] border border-[var(--accent)]/30 text-[var(--accent-text)] font-bold text-sm shadow-inner">
              {user.name ? user.name[0].toUpperCase() : user.email?.[0].toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">{user.name ?? "Patient"}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--danger-bg)] hover:border-[var(--danger-fg)]/30 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--danger-fg)] transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Slide-out navigation overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={toggleMobile}
          />

          {/* Drawer Menu */}
          <div className="relative flex w-4/5 max-w-sm flex-col border-r border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-2xl">
            {/* Close Button inside Menu */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--ink-0)] shadow-md">
                  <Pill className="h-5 w-5 stroke-[2.5]" />
                </div>
                <span className="font-bold tracking-tight text-[var(--text-primary)] text-base">MediVault AI</span>
              </div>
              <button
                onClick={toggleMobile}
                className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)] border border-[var(--border-default)] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={toggleMobile}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-[var(--accent-bg)] text-[var(--accent-text)] font-semibold border border-[var(--accent)]/30"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Profile Block */}
            <div className="border-t border-[var(--border-default)] pt-6 mt-4 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-bg)] text-[var(--accent-text)] font-bold text-sm border border-[var(--accent)]/30">
                  {user.name ? user.name[0].toUpperCase() : user.email?.[0].toUpperCase() ?? "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">{user.name ?? "Patient"}</p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--danger-bg)] border border-[var(--border-default)] hover:border-[var(--danger-fg)]/30 px-4 py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--danger-fg)] transition"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
