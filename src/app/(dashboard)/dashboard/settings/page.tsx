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
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure security credentials, notification triggers, and system features.
        </p>
      </div>

      <div className="max-w-2xl divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-6">
        <div className="flex items-start gap-4 pb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/15">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-200">Security & Privacy</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your prescription data and medication histories are encrypted in transit and at rest.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-teal-400">
              <span>Database Encryption:</span>
              <strong className="text-slate-300">Active (AES-256)</strong>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/15">
            <Bell className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-200">Notification Channels</h3>
            <p className="text-xs text-slate-400 mt-1">
              Set preferences for system notifications, email summaries, and daily dose alerts.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 text-[10px]">
                Email Alerts: Enabled
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/15">
            <Eye className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-200">AI Processing Settings</h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure parameters used by the AI model during OCR translation of prescription images.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-400">
              <span>Default Route:</span>
              <strong className="text-slate-300">Oral (Tablet/Capsule)</strong>
            </div>
          </div>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="flex items-start gap-4 pt-6 border-t border-red-500/20 bg-red-500/5 -mx-6 -mb-6 p-6 rounded-b-2xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/15">
            <Trash2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-red-400">Danger Zone: Delete Account</h3>
            <p className="text-xs text-slate-400 mt-1">
              Permanently delete your profile, prescriptions, files, and daily timetables. This action is irreversible.
            </p>
            <form action={deleteAccount} className="mt-4">
              <button
                type="submit"
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
              >
                Permanently Delete My Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
