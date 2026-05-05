import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GridPulse BLR — BESCOM EV Intelligence",
  description: "Federated Demand-Shaping and Siting Engine for BESCOM's EV Transition",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex bg-[#0f1117] text-[#e2e8f0]">
        <Sidebar />
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <TopBar />
          <main className="flex-1 pt-11 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
