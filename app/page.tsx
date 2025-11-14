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
  const [loadingComplete, setLoadingComplete] = useState(false);

  const handleLoadingComplete = () => {
    setLoadingComplete(true);
  };

  return (
    <main>
      {!loadingComplete && <LoadingScreen onComplete={handleLoadingComplete} />}
      {loadingComplete && (
        <>
          <Header />
          <OceanStage />
        </>
      )}
    </main>
  );
}
