import React from "react";
import { dipizBrandAssets } from "@/lib/brandAssets";

type BrandLogoProps = {
  variant?: "home" | "home-compact" | "shop" | "hero" | "admin" | "admin-auth";
};

const suppliedDipizLogo = dipizBrandAssets.logo;

/** The supplied customer artwork is preserved with only its original background made transparent. */
export function BrandLogo({ variant = "home" }: BrandLogoProps) {
  return (
    <img
      className={`dipiz-brand-logo dipiz-brand-logo--${variant}`}
      src={suppliedDipizLogo}
      alt="DIPIZ CREATION — Art and Design"
    />
  );
}
