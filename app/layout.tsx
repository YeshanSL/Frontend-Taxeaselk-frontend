import type { Metadata } from "next";
import "./globals.css";
import AppSplash from "@/components/layout/AppSplash";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export const metadata: Metadata = {
  title: "TaxEaseLK",
  description: "Corporate Income Tax filing, made easy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LanguageProvider>
          <AppSplash>{children}</AppSplash>
        </LanguageProvider>
      </body>
    </html>
  );
}
