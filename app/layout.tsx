import type { Metadata } from "next";
import { headers } from "next/headers";
import { NotificationProvider } from "@/lib/notifications/NotificationStore";
import Sidebar from "@/components/Sidebar";
import { TestnetWarning } from "@/components/TestnetWarning";
import { GlobalBottleCounter } from "@/components/Bottle/GlobalBottleCounter";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forever Message",
  description: "Messages in bottles floating in a digital ocean",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");

  return (
    <html lang="en">
      <link rel="icon" type="image/x-icon" href="/assets/favicon/icon.ico" />
      <link
        rel="apple-touch-icon"
        href="/assets/favicon/apple-touch-icon.png"
      />
      <body>
        <Providers cookies={cookies}>
          <TestnetWarning />
          <GlobalBottleCounter />
          <NotificationProvider>
            {children}
            <Sidebar />
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}
