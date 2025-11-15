"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { LoadingScreen } from "@/components/LoadingScreen";

const OceanStage = dynamic(
  () =>
    import("@/components/Ocean/OceanStage").then((module) => ({
      default: module.OceanStage,
    })),
  { ssr: false }
);

export default function Home() {
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);

  const handleLoadingComplete = () => {
    setShowLoadingOverlay(false);
  };

  return (
    <main>
      {/* Ocean loads in background */}
      <Header />
      <OceanStage />

      {/* Loading overlay on top */}
      {showLoadingOverlay && (
        <LoadingScreen onComplete={handleLoadingComplete} />
      )}
    </main>
  );
}
