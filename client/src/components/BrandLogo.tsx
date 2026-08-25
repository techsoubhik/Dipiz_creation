import React from "react";
import { dipizBrandAssets } from "@/lib/brandAssets";

type BrandLogoProps = {
  variant?: "home" | "home-compact" | "shop" | "hero" | "admin" | "admin-auth";
};

/** The compact and hero placements each use a focused crop of the supplied original artwork. */
export function BrandLogo({ variant = "home" }: BrandLogoProps) {
  const suppliedDipizLogo = variant === "hero" || variant === "admin-auth"
    ? dipizBrandAssets.heroLogo
    : dipizBrandAssets.headerLogo;

  return (
    <img
      className={`dipiz-brand-logo dipiz-brand-logo--${variant}`}
      src={suppliedDipizLogo}
      alt="DIPIZ CREATION — Art and Design"
    />
  );
}
