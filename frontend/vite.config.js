import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import mkcert from "vite-plugin-mkcert";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    mkcert(), // HTTPS certificate
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],

      manifest: {
        name: "EduPort",
        short_name: "EduPort",
        description: "Smart Education Management System",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,png,svg}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit for mobile app
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    https: true,          // We keep HTTPS for geolocation permissions
    host: "0.0.0.0",      // Allow LAN/mobile access
    port: 5173,

    // WebSocket configuration for HTTPS
    hmr: {
      protocol: "wss",     // Use secure websocket for HTTPS
      host: "localhost",   // Use localhost for development
      port: 5173,
    },

    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

