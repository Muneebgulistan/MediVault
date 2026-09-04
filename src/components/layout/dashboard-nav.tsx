"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Pill,
  Calendar,
  Bell,
  User,
  Settings,
  Menu,
  X,
  LogOut,
  Activity,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
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
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 shadow-md shadow-teal-500/10">
            <Activity className="h-4.5 w-4.5 text-slate-950" />
          </div>
          <span className="font-bold tracking-tight text-white text-sm">MediVault AI</span>
        </div>
        <button
          onClick={toggleMobile}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Desktop Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-800 bg-slate-900 md:flex">
        {/* Sidebar Brand Header */}
        <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 shadow-md shadow-teal-500/10">
            <Activity className="h-5 w-5 text-slate-950" />
          </div>
          <span className="font-bold tracking-tight text-white">MediVault AI</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6">
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
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-teal-500/10 text-teal-400"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Block & Sign Out */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 px-2 py-1.5 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-teal-400 font-semibold text-sm">
              {user.name ? user.name[0].toUpperCase() : user.email?.[0].toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user.name ?? "User"}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Slide-out navigation overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={toggleMobile} />

          {/* Drawer Menu */}
          <div className="relative flex w-4/5 max-w-sm flex-col border-r border-slate-800 bg-slate-900 p-6 shadow-2xl">
            {/* Close Button inside Menu */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 shadow-md shadow-teal-500/10">
                  <Activity className="h-4.5 w-4.5 text-slate-950" />
                </div>
                <span className="font-bold tracking-tight text-white text-sm">MediVault AI</span>
              </div>
              <button
                onClick={toggleMobile}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 space-y-1">
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
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-teal-500/10 text-teal-400"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Profile / Log Out Block */}
            <div className="mt-auto border-t border-slate-800 pt-4">
              <div className="flex items-center gap-3 px-2 py-1.5 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-teal-400 font-semibold text-sm">
                  {user.name ? user.name[0].toUpperCase() : user.email?.[0].toUpperCase() ?? "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user.name ?? "User"}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition"
              >
                <LogOut className="h-4.5 w-4.5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
