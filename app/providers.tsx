"use client";

import { Web3ModalProvider } from "@/lib/auth/Web3ModalProvider";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { useState, useEffect } from "react";

export function Providers({
  children,
  cookies,
}: {
  children: React.ReactNode;
  cookies?: string | null;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Web3ModalProvider cookies={cookies}>
      <AuthProvider>{mounted && children}</AuthProvider>
    </Web3ModalProvider>
  );
}
