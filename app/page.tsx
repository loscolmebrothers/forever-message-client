"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Introduction from "@/components/Introduction";

const OceanStage = dynamic(
  () =>
    import("@/components/Ocean/Stage").then((module) => ({
      default: module.OceanStage,
    })),
  { ssr: false }
);

export default function Home() {
  const [showIntroductionOverlay, setShowIntroductionOverlay] = useState(true);

  return (
    <main>
      <Header />
      <OceanStage />

      {showIntroductionOverlay && (
        <Introduction onComplete={() => setShowIntroductionOverlay(false)} />
      )}
    </main>
  );
}
