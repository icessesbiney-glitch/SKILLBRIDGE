import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skillbridge | Build momentum together",
  description: "A focused workspace for learning, sharing, and growing skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
