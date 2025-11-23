import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { NotificationProvider } from "@/lib/notifications/NotificationStore";
import { NotificationSidebar } from "@/components/NotificationSidebar";
import { LoadingToastManager } from "@/components/LoadingToastManager";

export const metadata: Metadata = {
  title: "Forever Message",
  description: "Messages in bottles floating in a digital ocean",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NotificationProvider>
            {children}
            <NotificationSidebar />
            <LoadingToastManager />
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}
