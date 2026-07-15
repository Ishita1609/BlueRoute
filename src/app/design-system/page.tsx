import type { Metadata } from "next";

import { DesignSystemShowcase } from "./DesignSystemShowcase";

// Dev-only component gallery — excluded from search indexing.
export const metadata: Metadata = {
  title: "Design System — BlueRoute Logistics (Dev Only)",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return <DesignSystemShowcase />;
}
