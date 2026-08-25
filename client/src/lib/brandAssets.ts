/**
 * Public brand artwork used by both Manus preview and external static hosting.
 * The assets are stored in the project repository so Vercel does not depend on
 * Manus storage-proxy routes at runtime.
 */
export const dipizBrandAssets = {
  headerLogo: "https://raw.githubusercontent.com/techsoubhik/Dipiz_creation/main/public/brand/dipiz-creation-logo-header-crop.jpg",
  heroLogo: "https://raw.githubusercontent.com/techsoubhik/Dipiz_creation/main/public/brand/dipiz-creation-logo-hero-crop.jpg",
  hero: "https://raw.githubusercontent.com/techsoubhik/Dipiz_creation/main/public/brand/dipiz-hero-art.jpg",
} as const;
