import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Procurement Management System",
  description: "Centralized procurement management for institutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
