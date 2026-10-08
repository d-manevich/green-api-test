import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Telegram Chat",
  description: "Minimal Telegram chat powered by GREEN-API",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}
