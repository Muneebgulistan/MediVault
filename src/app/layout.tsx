import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/auth/session-provider";

export const metadata: Metadata = {
  title: "MediVault AI - Your prescriptions, organized intelligently",
  description:
    "Securely store doctor prescriptions, extract prescription info using AI/OCR, organize medicines, and generate medication timetables.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-[var(--bg-page)] text-[var(--text-primary)] antialiased min-h-screen">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
