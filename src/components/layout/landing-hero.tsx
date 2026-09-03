import React from "react";
import Link from "next/link";
import { Pill, Shield, Sparkles, Clock, FileText, Search, LogIn } from "lucide-react";

export function LandingHero() {
  return (
    <div className="relative overflow-hidden bg-slate-950 text-white min-h-screen flex flex-col justify-between">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 backdrop-blur-md bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Pill className="h-6 w-6 text-slate-950" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              MediVault AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs font-semibold px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              v0.1.0
            </span>
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-semibold px-4 py-2 transition shadow-lg shadow-teal-500/20"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-sm mb-8 backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-teal-400" />
          <span>Intelligent Prescription & Medication Management</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
          MediVault AI
        </h1>

        <p className="text-xl md:text-2xl font-medium text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
          &quot;Your prescriptions, organized intelligently.&quot;
        </p>

        {/* Feature Cards Grid (Preview) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-teal-500/30 transition-all duration-300 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Prescription Storage & OCR</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Securely store prescription images and automatically extract medication details using AI powered OCR.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-teal-500/30 transition-all duration-300 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Medication Intelligence</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Organize dosage information and research medications securely from verified health data sources.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-teal-500/30 transition-all duration-300 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Automated Timetables</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate structured daily medication schedules and adherence reminders tailored to your prescriptions.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-8 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-teal-400" />
            <span>MediVault AI &mdash; Enterprise Health Vault Architecture</span>
          </div>
          <p>&copy; {new Date().getFullYear()} MediVault AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
