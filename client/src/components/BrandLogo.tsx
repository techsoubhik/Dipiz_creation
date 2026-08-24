import React from "react";

type BrandLogoProps = {
  variant?: "home" | "home-compact" | "shop" | "admin" | "admin-auth";
};

const suppliedDipizLogo = "/manus-storage/dipiz-creation-logo-transparent_0ece0553.png";

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
