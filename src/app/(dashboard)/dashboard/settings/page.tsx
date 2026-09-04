import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { Shield, Bell, Eye, Trash2 } from "lucide-react";
import { deleteAccount } from "@/app/actions/user";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">System Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Cryptographic security controls, notification preferences, and account management.
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Security & Cryptography Card */}
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-[var(--border-default)] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-surface-alt)] text-[var(--accent)] border border-[var(--border-default)]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Security & Privacy Protocol</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                End-to-end data segregation and encrypted storage architecture
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)] p-4 space-y-1">
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[var(--text-muted)]">
                At-Rest Encryption
              </span>
              <p className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                AES-256 GCM Storage
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Database records and file uploads are encrypted with zero-shared keys.
              </p>
            </div>

            <div className="rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)] p-4 space-y-1">
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Network Protocol
              </span>
              <p className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--success-fg)]" />
                TLS 1.3 Strict HTTPS
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                All communications are secured with strict transport security.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications & System Preferences */}
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-[var(--border-default)] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-surface-alt)] text-[var(--accent)] border border-[var(--border-default)]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Notification Triggers</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Automated reminders dispatched for prescription dose milestones
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)] p-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Daily Dosage Reminders</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Synchronizes alerts based on active timetable times
                </p>
              </div>
              <span className="rounded-full bg-[var(--success-bg)] border border-[var(--success-fg)]/25 px-2.5 py-1 text-xs font-mono font-medium text-[var(--success-fg)]">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)] p-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Missed Dose Alerts</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Prompts follow-up if a dose is not logged within 2 hours of scheduled time
                </p>
              </div>
              <span className="rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] px-2.5 py-1 text-xs font-mono font-medium text-[var(--text-secondary)]">
                Enabled
              </span>
            </div>
          </div>
        </div>

        {/* AI Processing Settings */}
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-[var(--border-default)] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-surface-alt)] text-[var(--accent)] border border-[var(--border-default)]">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">AI OCR Translation Engine</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Clinical-grade computer vision configuration with strict zero-guesswork guardrails
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)] p-4">
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Model Pipeline
              </span>
              <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">Gemini 2.5 Flash Vision</p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Optimized for medical handwritten scrips, dosage abbreviations, and SIG nomenclature.
              </p>
            </div>

            <div className="rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)] p-4">
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Confidence Threshold
              </span>
              <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">Strict Clinical Verification</p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Low confidence detections require mandatory human confirmation before activating.
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="rounded-2xl border border-[var(--danger-fg)]/25 bg-[var(--danger-bg)] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-[var(--danger-fg)]/20 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-surface)] text-[var(--danger-fg)] border border-[var(--danger-fg)]/25">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--danger-fg)]">Danger Zone: Account Purge</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Permanently eliminate all your data from MediVault AI
              </p>
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Executing this action will permanently delete your patient profile, uploaded prescriptions, OCR translations, medicines catalog, and adherence history. This operation is cryptographic and completely irreversible.
          </p>

          <form action={deleteAccount} className="pt-2">
            <button
              type="submit"
              className="rounded-xl bg-[var(--danger-fg)] hover:opacity-90 text-[var(--ink-0)] px-5 py-2.5 text-xs font-semibold transition shadow-sm"
            >
              Permanently Delete My Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
