import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";
import { NotificationProvider } from "@/lib/notifications/NotificationStore";
import { NotificationSidebar } from "@/components/NotificationSidebar";
import { CenterToast } from "@/components/CenterToast";

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
          <NotificationProvider>
            {children}
            <NotificationSidebar />
            <CenterToast />
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}
