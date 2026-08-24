import type { Metadata } from "next";
import "./globals.css";
import AppSplash from "@/components/layout/AppSplash";

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
        <AppSplash>{children}</AppSplash>
      </body>
    </html>
  );
}
