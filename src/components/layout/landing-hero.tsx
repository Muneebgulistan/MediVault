import React from "react";
import Link from "next/link";
import {
  Pill,
  Shield,
  Sparkles,
  Clock,
  FileText,
  Search,
  LogIn,
  ArrowRight,
  CheckCircle2,
  Lock,
  Database,
  CalendarCheck,
  Cpu,
} from "lucide-react";

export function LandingHero() {
  return (
    <div className="relative overflow-hidden bg-slate-950 text-white min-h-screen flex flex-col justify-between selection:bg-teal-500 selection:text-slate-950">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-teal-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative z-20 border-b border-slate-800/80 backdrop-blur-xl bg-slate-950/70 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 via-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Pill className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                MediVault AI
              </span>
              <span className="text-[10px] text-teal-400/90 font-medium tracking-wide">
                HEALTHCARE INTELLIGENCE
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-teal-400 transition-colors">
              Features
            </a>
            <a href="#safety" className="hover:text-teal-400 transition-colors">
              Safety & Security
            </a>
            <a href="#how-it-works" className="hover:text-teal-400 transition-colors">
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold px-4 py-2.5 transition shadow-sm"
            >
              <LogIn className="h-4 w-4 text-teal-400" />
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 transition shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center my-auto">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md shadow-inner">
          <Sparkles className="h-4 w-4 text-teal-400 animate-pulse" />
          <span>AI-Powered Prescription OCR & Deterministic Scheduling</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-[1.1]">
          Your Medical Prescriptions,{" "}
          <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
            Organized Intelligently.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg sm:text-xl font-normal text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload doctor prescriptions to automatically extract dosages, verify interactions via openFDA, and generate personalized daily timetables with zero guesswork.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold px-8 py-3.5 transition shadow-xl shadow-teal-500/20 hover:-translate-y-0.5"
          >
            Start Organizing Free
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </Link>
          <Link
            href="/auth/signin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-200 text-sm font-semibold px-8 py-3.5 transition backdrop-blur-sm hover:border-slate-700"
          >
            Explore Demo Patient
          </Link>
        </div>

        {/* Interactive Clinical Preview Mockup */}
        <div className="relative max-w-4xl mx-auto rounded-3xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-6 shadow-2xl backdrop-blur-xl text-left overflow-hidden group hover:border-teal-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Window Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-teal-500/80" />
              <span className="ml-2 text-xs font-mono text-slate-400">medivault_preview // rx_extraction</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              AI Verified (98% Confidence)
            </div>
          </div>

          {/* Clinical Card Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Medication Card 1 */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Amoxicillin</h4>
                  <p className="text-[11px] text-slate-400">Antibiotic • Oral Capsule</p>
                </div>
                <span className="text-[10px] font-mono bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/20">
                  500 mg
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-1 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                <p className="text-[11px] text-slate-400">Instructions:</p>
                <p className="font-medium text-teal-300">1 capsule 3x daily with meals</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Clock className="h-3 w-3 text-teal-400" />
                <span>08:00 AM • 02:00 PM • 08:00 PM</span>
              </div>
            </div>

            {/* Medication Card 2 */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Metformin HCl</h4>
                  <p className="text-[11px] text-slate-400">Antidiabetic • Oral Tablet</p>
                </div>
                <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                  850 mg
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-1 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                <p className="text-[11px] text-slate-400">Instructions:</p>
                <p className="font-medium text-blue-300">1 tablet twice daily after food</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Clock className="h-3 w-3 text-blue-400" />
                <span>08:30 AM • 08:30 PM</span>
              </div>
            </div>

            {/* Timetable Schedule Strip */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950/80 to-teal-950/20 border border-teal-500/20 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarCheck className="h-4 w-4 text-teal-400" />
                  <h4 className="font-bold text-white text-sm">Today&apos;s Compliance</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automated schedules adjust dynamically around meal times and intervals.
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Morning Regimen</span>
                  <span className="text-teal-400 font-semibold font-mono text-[11px]">Taken ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Afternoon Regimen</span>
                  <span className="text-amber-400 font-semibold font-mono text-[11px]">Upcoming</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety & Trust Pillars */}
        <section id="safety" className="mt-20 pt-8 border-t border-slate-800/60">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <Lock className="h-5 w-5 text-teal-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Private Storage</p>
                <p className="text-[11px] text-slate-400">UUID Encrypted Files</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <Database className="h-5 w-5 text-blue-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">openFDA Catalog</p>
                <p className="text-[11px] text-slate-400">Verified Drug Database</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <Cpu className="h-5 w-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Deterministic Logic</p>
                <p className="text-[11px] text-slate-400">No Hallucinated Doses</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <Shield className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">User Isolation</p>
                <p className="text-[11px] text-slate-400">Strict Data Privacy</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section id="features" className="mt-24 text-left">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Engineered for Precision Healthcare
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              Every prescription undergoes rigorous validation, OCR extraction review, and clinical verification before timetables are generated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-7 rounded-3xl bg-slate-900/40 border border-slate-800/80 hover:border-teal-500/40 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
              <div className="h-12 w-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-5 border border-teal-500/20 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Secure Prescription Ingestion</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Verify magic-byte signatures for PDFs, JPGs, and PNGs. Files are isolated outside public web roots with authenticated temporary streaming.
              </p>
              <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                  <span>10MB upload threshold validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                  <span>Zero public URL exposure</span>
                </li>
              </ul>
            </div>

            <div className="group p-7 rounded-3xl bg-slate-900/40 border border-slate-800/80 hover:border-blue-500/40 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-5 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">openFDA Intelligence Layer</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Cross-references normalized medicine names against official US FDA drug labels, retrieving adverse side effects, contraindications, and warnings.
              </p>
              <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>30-day smart local database cache</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>Verified pharmacological generic names</span>
                </li>
              </ul>
            </div>

            <div className="group p-7 rounded-3xl bg-slate-900/40 border border-slate-800/80 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-5 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Deterministic Scheduling</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Parses complex doctor instructions into accurate daily time slots. Automatically accounts for food associations and hourly interval regimens.
              </p>
              <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                  <span>Strict zero-guess dosage policy</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                  <span>Interactive Taken / Skipped tracker</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-10 bg-slate-950/90">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-slate-400 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
              <Shield className="h-4 w-4" />
            </div>
            <span>MediVault AI &mdash; Clinical Grade Prescription Management Platform</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <span>Encrypted In Transit & At Rest</span>
            <span>&bull;</span>
            <p>&copy; {new Date().getFullYear()} MediVault AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
