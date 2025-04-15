// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa"; // Import
import path from "path"; // Import path

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Add PWA plugin configuration
      registerType: "autoUpdate", // Auto update SW
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"], // Cache static assets
      manifest: {
        // You can define manifest here or use public/manifest.json
        name: "Flowly - Cash & Product Tracker",
        short_name: "Flowly",
        description: "Track cash and product flow simply.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon-192.png", // Path relative to public folder
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png", // Path relative to public folder
            sizes: "512x512",
            type: "image/png",
          },
          {
            // Add a maskable icon if possible
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Cache JS, CSS, and assets
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      devOptions: {
        enabled: true, // Enable PWA features in dev for testing
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
