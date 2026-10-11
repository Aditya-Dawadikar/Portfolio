import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { WorldMapGallery } from "@/world-map/components/gallery/WorldMapGallery";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-wm-display",
});

export const metadata: Metadata = {
  title: "World Map Gallery",
  robots: { index: false, follow: false },
};

// Development gallery for the procedural world map (src/world-map).
export default function Page() {
  return (
    <div className={display.variable}>
      <WorldMapGallery />
    </div>
  );
}
