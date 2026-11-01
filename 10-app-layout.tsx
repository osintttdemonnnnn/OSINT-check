import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Discord Breach Intelligence",
  description: "Indexed breach and leak record lookup for Discord identifiers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
