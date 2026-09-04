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
    <div className="relative overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] min-h-screen flex flex-col justify-between selection:bg-[var(--accent)] selection:text-[var(--ink-0)]">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[var(--accent)]/10 via-[var(--accent)]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-default)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-default)_1px,transparent_1px)] opacity-20 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative z-20 border-b border-[var(--border-default)] backdrop-blur-xl bg-[var(--bg-surface)]/80 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-[var(--accent)] flex items-center justify-center text-[var(--ink-0)] shadow-lg shadow-[var(--accent)]/20 group-hover:scale-105 transition-transform">
              <Pill className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                MediVault AI
              </span>
              <span className="text-[10px] text-[var(--accent)] font-semibold tracking-wide">
                HEALTHCARE INTELLIGENCE
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-secondary)]">
            <a href="#features" className="hover:text-[var(--accent)] transition-colors">
              Features
            </a>
            <a href="#safety" className="hover:text-[var(--accent)] transition-colors">
              Safety & Security
            </a>
            <a href="#how-it-works" className="hover:text-[var(--accent)] transition-colors">
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs sm:text-sm font-semibold px-4 py-2.5 transition shadow-sm"
            >
              <LogIn className="h-4 w-4 text-[var(--accent)]" />
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--ink-0)] text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 transition shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/30 hover:-translate-y-0.5"
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-bg)] border border-[var(--accent)]/30 text-[var(--accent-text)] text-xs sm:text-sm font-medium mb-8 backdrop-blur-md shadow-inner">
          <Sparkles className="h-4 w-4 text-[var(--accent)] animate-pulse" />
          <span>AI-Powered Prescription OCR & Deterministic Scheduling</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--text-primary)] mb-6 max-w-4xl mx-auto leading-[1.1]">
          Your Medical Prescriptions,{" "}
          <span className="text-[var(--accent)]">
            Organized Intelligently.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg sm:text-xl font-normal text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload doctor prescriptions to automatically extract dosages, verify interactions via openFDA, and generate personalized daily timetables with zero guesswork.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--ink-0)] text-sm font-bold px-8 py-3.5 transition shadow-xl shadow-[var(--accent)]/20 hover:-translate-y-0.5"
          >
            Start Organizing Free
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </Link>
          <Link
            href="/auth/signin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm font-semibold px-8 py-3.5 transition backdrop-blur-sm hover:border-[var(--border-strong)]"
          >
            Explore Demo Patient
          </Link>
        </div>

        {/* Interactive Clinical Preview Mockup */}
        <div className="relative max-w-4xl mx-auto rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 sm:p-6 shadow-2xl backdrop-blur-xl text-left overflow-hidden group hover:border-[var(--accent)]/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Window Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[var(--danger-fg)]/80" />
              <span className="h-3 w-3 rounded-full bg-[var(--warning-fg)]/80" />
              <span className="h-3 w-3 rounded-full bg-[var(--success-fg)]/80" />
              <span className="ml-2 text-xs font-mono text-[var(--text-muted)]">medivault_preview // rx_extraction</span>
            </div>
            {/* Real status indicator: AI Confidence */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--success-fg)] font-semibold bg-[var(--success-bg)] px-2.5 py-1 rounded-full border border-[var(--success-fg)]/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              AI Verified (98% Confidence)
            </div>
          </div>

          {/* Clinical Card Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Medication Card 1 */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">Amoxicillin</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">Antibiotic • Oral Capsule</p>
                </div>
                <span className="text-[10px] font-mono bg-[var(--accent-bg)] text-[var(--accent-text)] px-2 py-0.5 rounded border border-[var(--accent)]/20">
                  500 mg
                </span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] space-y-1 bg-[var(--bg-surface)] p-2.5 rounded-xl border border-[var(--border-default)]">
                <p className="text-[11px] text-[var(--text-muted)]">Instructions:</p>
                <p className="font-medium text-[var(--text-primary)]">1 capsule 3x daily with meals</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-mono">
                <Clock className="h-3 w-3 text-[var(--accent)]" />
                <span>08:00 AM • 02:00 PM • 08:00 PM</span>
              </div>
            </div>

            {/* Medication Card 2 */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">Metformin HCl</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">Antidiabetic • Oral Tablet</p>
                </div>
                <span className="text-[10px] font-mono bg-[var(--accent-bg)] text-[var(--accent-text)] px-2 py-0.5 rounded border border-[var(--accent)]/20">
                  850 mg
                </span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] space-y-1 bg-[var(--bg-surface)] p-2.5 rounded-xl border border-[var(--border-default)]">
                <p className="text-[11px] text-[var(--text-muted)]">Instructions:</p>
                <p className="font-medium text-[var(--text-primary)]">1 tablet twice daily after food</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-mono">
                <Clock className="h-3 w-3 text-[var(--accent)]" />
                <span>08:30 AM • 08:30 PM</span>
              </div>
            </div>

            {/* Timetable Schedule Strip */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarCheck className="h-4 w-4 text-[var(--accent)]" />
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">Today&apos;s Compliance</h4>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Automated schedules adjust dynamically around meal times and intervals.
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-[var(--border-default)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Morning Regimen</span>
                  {/* Real status: dose taken */}
                  <span className="text-[var(--success-fg)] bg-[var(--success-bg)] px-2 py-0.5 rounded font-semibold font-mono text-[11px]">Taken ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Afternoon Regimen</span>
                  {/* Real status: upcoming/warning pending */}
                  <span className="text-[var(--warning-fg)] bg-[var(--warning-bg)] px-2 py-0.5 rounded font-semibold font-mono text-[11px]">Upcoming</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety & Trust Pillars */}
        <section id="safety" className="mt-20 pt-8 border-t border-[var(--border-default)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]">
              <Lock className="h-5 w-5 text-[var(--accent)] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)]">Private Storage</p>
                <p className="text-[11px] text-[var(--text-muted)]">UUID Encrypted Files</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]">
              <Database className="h-5 w-5 text-[var(--accent)] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)]">openFDA Catalog</p>
                <p className="text-[11px] text-[var(--text-muted)]">Verified Drug Database</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]">
              <Cpu className="h-5 w-5 text-[var(--accent)] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)]">Deterministic Logic</p>
                <p className="text-[11px] text-[var(--text-muted)]">No Hallucinated Doses</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]">
              <Shield className="h-5 w-5 text-[var(--accent)] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)]">User Isolation</p>
                <p className="text-[11px] text-[var(--text-muted)]">Strict Data Privacy</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section id="features" className="mt-24 text-left">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Engineered for Precision Healthcare
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-2">
              Every prescription undergoes rigorous validation, OCR extraction review, and clinical verification before timetables are generated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--accent)]/40 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
              <div className="h-12 w-12 rounded-2xl bg-[var(--accent-bg)] flex items-center justify-center text-[var(--accent)] mb-5 border border-[var(--accent)]/25 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Secure Prescription Ingestion</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                Verify magic-byte signatures for PDFs, JPGs, and PNGs. Files are isolated outside public web roots with authenticated temporary streaming.
              </p>
              <ul className="text-xs text-[var(--text-muted)] space-y-2 pt-2 border-t border-[var(--border-default)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>10MB upload threshold validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>Zero public URL exposure</span>
                </li>
              </ul>
            </div>

            <div className="group p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--accent)]/40 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
              <div className="h-12 w-12 rounded-2xl bg-[var(--accent-bg)] flex items-center justify-center text-[var(--accent)] mb-5 border border-[var(--accent)]/25 group-hover:scale-110 transition-transform">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">openFDA Intelligence Layer</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                Cross-references normalized medicine names against official US FDA drug labels, retrieving adverse side effects, contraindications, and warnings.
              </p>
              <ul className="text-xs text-[var(--text-muted)] space-y-2 pt-2 border-t border-[var(--border-default)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>30-day smart local database cache</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>Verified pharmacological generic names</span>
                </li>
              </ul>
            </div>

            <div className="group p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--accent)]/40 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
              <div className="h-12 w-12 rounded-2xl bg-[var(--accent-bg)] flex items-center justify-center text-[var(--accent)] mb-5 border border-[var(--accent)]/25 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Deterministic Scheduling</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                Parses complex doctor instructions into accurate daily time slots. Automatically accounts for food associations and hourly interval regimens.
              </p>
              <ul className="text-xs text-[var(--text-muted)] space-y-2 pt-2 border-t border-[var(--border-default)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>Strict zero-guess dosage policy</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>Interactive Taken / Skipped tracker</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border-default)] py-10 bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-[var(--text-muted)] text-xs">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/25">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-[var(--text-secondary)] font-medium">MediVault AI &mdash; Clinical Grade Prescription Management Platform</span>
          </div>
          <div className="flex items-center gap-6 text-[var(--text-muted)]">
            <span>Encrypted In Transit & At Rest</span>
            <span>&bull;</span>
            <p>&copy; {new Date().getFullYear()} MediVault AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
