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
        <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Cryptographic security controls, notification preferences, and account management.
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Security & Cryptography Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Security & Privacy Protocol</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                End-to-end data segregation and encrypted storage architecture
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                At-Rest Encryption
              </span>
              <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-400" />
                AES-256 GCM Storage
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Database records and file uploads are encrypted with zero-shared keys.
              </p>
            </div>

            <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Network Protocol
              </span>
              <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                TLS 1.3 Strict HTTPS
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                All communications are secured with strict transport security.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications & System Preferences */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Notification Triggers</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated reminders dispatched for prescription dose milestones
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-950/60 border border-slate-800/60 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-200">Daily Dosage Reminders</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synchronizes alerts based on active timetable times
                </p>
              </div>
              <span className="rounded-full bg-teal-500/10 border border-teal-500/25 px-2.5 py-1 text-xs font-semibold text-teal-400">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-950/60 border border-slate-800/60 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-200">Missed Dose Alerts</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Prompts follow-up if a dose is not logged within 2 hours of scheduled time
                </p>
              </div>
              <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-400">
                Enabled
              </span>
            </div>
          </div>
        </div>

        {/* AI Processing Settings */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">AI OCR Translation Engine</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Clinical-grade computer vision configuration with strict zero-guesswork guardrails
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Model Pipeline
              </span>
              <p className="text-sm font-semibold text-slate-200 mt-1">Gemini 2.5 Flash Vision</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Optimized for medical handwritten scrips, dosage abbreviations, and SIG nomenclature.
              </p>
            </div>

            <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Confidence Threshold
              </span>
              <p className="text-sm font-semibold text-purple-400 mt-1">Strict Clinical Verification</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Low confidence detections require mandatory human confirmation before activating.
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-500/5 to-slate-950/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-rose-500/20 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-400">Danger Zone: Account Purge</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Permanently eliminate all your data from MediVault AI
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Executing this action will permanently delete your patient profile, uploaded prescriptions, OCR translations, medicines catalog, and adherence history. This operation is cryptographic and completely irreversible.
          </p>

          <form action={deleteAccount} className="pt-2">
            <button
              type="submit"
              className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 text-xs font-bold transition shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30"
            >
              Permanently Delete My Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
