import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UCLA MSBA Interview Scheduler",
  description: "Second-round interview scheduling for the UCLA MSBA program",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
