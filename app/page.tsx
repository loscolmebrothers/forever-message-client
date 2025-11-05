"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/Header";

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
      <Header />
      <OceanStage />
    </main>
  );
}
