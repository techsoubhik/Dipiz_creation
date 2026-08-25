import React from "react";
import { dipizBrandAssets } from "@/lib/brandAssets";

type BrandLogoProps = {
  variant?: "home" | "home-compact" | "shop" | "hero" | "admin" | "admin-auth";
};

/** The navigation and hero both use the complete circular DIPIZ mark for a consistent, unclipped brand treatment. */
export function BrandLogo({ variant = "home" }: BrandLogoProps) {
  const suppliedDipizLogo = dipizBrandAssets.heroLogo;

  return (
    <img
      className={`dipiz-brand-logo dipiz-brand-logo--${variant}`}
      src={suppliedDipizLogo}
      alt="DIPIZ CREATION — Art and Design"
    />
  );
}
