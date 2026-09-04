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
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-4 backdrop-blur-xl md:hidden sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 via-teal-500 to-blue-600 shadow-md shadow-teal-500/10">
            <Pill className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="font-bold tracking-tight text-white text-base">MediVault AI</span>
        </Link>
        <button
          onClick={toggleMobile}
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-900 hover:text-white border border-slate-800 transition"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Desktop Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl md:flex z-30">
        {/* Sidebar Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800/80 px-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 via-teal-500 to-blue-600 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Pill className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white text-sm">MediVault AI</span>
              <span className="text-[9px] font-semibold text-teal-400/90 tracking-wider">
                CLINICAL PORTAL
              </span>
            </div>
          </Link>

          {/* Online status indicator */}
          <div className="flex items-center gap-1.5" title="Encrypted Connection Active">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                    ? "bg-teal-500/10 text-teal-300 font-semibold shadow-inner border border-teal-500/20"
                    : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-100 hover:translate-x-0.5"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />
                )}
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                    isActive
                      ? "text-teal-400"
                      : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Security Badge & User Profile Block */}
        <div className="border-t border-slate-800/80 p-4 space-y-3 bg-slate-950/40">
          <div className="flex items-center gap-2 px-2 text-[10px] text-slate-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
            <span>Encrypted Vault Active</span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-teal-500/30 text-teal-400 font-bold text-sm shadow-inner">
              {user.name ? user.name[0].toUpperCase() : user.email?.[0].toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name ?? "Patient"}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-red-950/30 hover:border-red-500/30 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors"
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
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
            onClick={toggleMobile}
          />

          {/* Drawer Menu */}
          <div className="relative flex w-4/5 max-w-sm flex-col border-r border-slate-800 bg-slate-950 p-6 shadow-2xl">
            {/* Close Button inside Menu */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 shadow-md">
                  <Pill className="h-5 w-5 text-slate-950 stroke-[2.5]" />
                </div>
                <span className="font-bold tracking-tight text-white text-base">MediVault AI</span>
              </div>
              <button
                onClick={toggleMobile}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-900 hover:text-white border border-slate-800 transition"
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
                        ? "bg-teal-500/10 text-teal-300 font-semibold border border-teal-500/25"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Profile Block */}
            <div className="border-t border-slate-800 pt-6 mt-4 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-teal-400 font-bold text-sm">
                  {user.name ? user.name[0].toUpperCase() : user.email?.[0].toUpperCase() ?? "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user.name ?? "Patient"}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 px-4 py-2.5 text-xs font-semibold text-red-400 transition"
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
