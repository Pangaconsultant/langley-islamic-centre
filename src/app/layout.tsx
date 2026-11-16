import type { Metadata } from "next";
import "./globals.css";
import { PortalShell } from "@/components/PortalShell";

export const metadata: Metadata = {
  title: "Langley Islamic Centre (LIC) | Spitfire Close, Langley (SL3)",
  description:
    "Official Unified Community, Sustainable Travel Plan & Operations Portal for Langley Islamic Centre (Charity Reg: 1180443), Spitfire Close, Langley SL3.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-[#009FE3] selection:text-white">
        <PortalShell>{children}</PortalShell>
      </body>
    </html>
  );
}
