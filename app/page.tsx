"use client";

import dynamic from "next/dynamic";

const OceanStage = dynamic(
  () =>
    import("@/components/Ocean/OceanStage").then((module) => ({
      default: module.OceanStage,
    })),
  { ssr: false },
);

export default function Home() {
  return (
    <main>
      <OceanStage />
    </main>
  );
}
