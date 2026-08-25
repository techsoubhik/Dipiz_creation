/**
 * Public brand artwork used by both Manus preview and external static hosting.
 * The assets are stored in the project repository so Vercel does not depend on
 * Manus storage-proxy routes at runtime.
 */
export const dipizBrandAssets = {
  logo: "https://raw.githubusercontent.com/techsoubhik/Dipiz_creation/main/public/brand/dipiz-creation-logo-hd.png",
  hero: "https://raw.githubusercontent.com/techsoubhik/Dipiz_creation/main/public/brand/dipiz-hero-art.jpg",
} as const;
