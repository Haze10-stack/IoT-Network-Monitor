import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IoT NetMonitor - Real-time IoT Network Monitoring",
  description: "Monitor ESP32 packet captures in real-time. Detect anomalies, identify devices, and understand your network traffic with deep visibility.",
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