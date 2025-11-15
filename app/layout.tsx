import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";
import { ToastInfo } from "@/components/ToastInfo";

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
          {children}
          <Toaster
            position="bottom-center"
            expand={true}
            richColors
            duration={10000}
            visibleToasts={5}
            offset="80px"
          />
          <ToastInfo />
        </Providers>
      </body>
    </html>
  );
}
