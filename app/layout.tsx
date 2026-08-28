import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Underwriting",
  description: "Lean underwriting workspace prototype",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} h-full antialiased`}>
      <body className={`${figtree.className} h-full min-h-full`}>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
