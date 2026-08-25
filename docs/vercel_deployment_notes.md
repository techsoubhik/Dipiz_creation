# Vercel Deployment Notes

The Vercel configuration builds the Vite client and publishes `dist/public`, allowing the DIPIZ CREATION storefront routes to resolve as a visible single-page website.

The supplied transparent logo and landing-page hero are served from the repository's `public/brand` directory through durable GitHub raw URLs. This prevents external static deployments from requesting Manus-only `/manus-storage` asset paths.

The project’s database, Manus sign-in, upload proxy, owner notifications, and authenticated Shopify administration flow are served by the existing Node application. Those server-backed features require their original runtime services and credentials; they are not automatically transferred by publishing static storefront assets on Vercel. The private administration workflow remains available through the project’s managed hosting environment.
