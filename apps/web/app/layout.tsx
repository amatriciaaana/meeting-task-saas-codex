import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { AuthShell } from "../components/auth-shell";
import { getCurrentUser } from "../lib/auth";

export const metadata: Metadata = {
  title: "Meeting Task SaaS",
  description: "AI meeting summaries and action extraction"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const user = await getCurrentUser();

  return (
    <html lang="ja">
      <body>
        <AuthShell user={user} />
        {children}
      </body>
    </html>
  );
}
