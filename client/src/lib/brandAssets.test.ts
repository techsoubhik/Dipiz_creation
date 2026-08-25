import { describe, expect, it } from "vitest";
import { dipizBrandAssets } from "./brandAssets";

describe("DIPIZ public brand assets", () => {
  it("uses repository-hosted artwork that external deployments can request", () => {
    expect(dipizBrandAssets.headerLogo).toBe("https://raw.githubusercontent.com/techsoubhik/Dipiz_creation/main/public/brand/dipiz-creation-logo-header-transparent.png");
    expect(dipizBrandAssets.heroLogo).toBe("https://raw.githubusercontent.com/techsoubhik/Dipiz_creation/main/public/brand/dipiz-creation-logo-hero-transparent.png");
    expect(dipizBrandAssets.hero).toBe("https://raw.githubusercontent.com/techsoubhik/Dipiz_creation/main/public/brand/dipiz-hero-art.jpg");
  });
});
