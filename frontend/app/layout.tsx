import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "HR System — Quản lý Nhân sự",
  description: "Hệ thống quản lý Nhân sự, Lương & Đổi ca — tách độc lập",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={publicSans.variable}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
