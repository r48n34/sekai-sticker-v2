import { defineConfig } from "vite";
// import { codeInspectorPlugin } from "code-inspector-plugin";
// import { reactClickToComponent } from "vite-plugin-react-click-to-component";
import { tabToComponents } from "tab-to-components";

import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import Sitemap from "vite-plugin-sitemap";

const dynamicRoutes = ["/batch", "/packs"];

export default defineConfig(({ command, mode }) => {
    const isTest = mode === "test" || process.env.VITEST === "true";
    const isDevelopmentServer = command === "serve" && !isTest;
    const isProductionBuild = command === "build" && !isTest;

    // if (!process.env.VITE_LAUNCH_EDITOR) {
    //     process.env.LAUNCH_EDITOR = "code";
    // } else {
    //     process.env.LAUNCH_EDITOR = process.env.VITE_LAUNCH_EDITOR;
    // }

    return {
        plugins: [
            ...(isDevelopmentServer
                ? [
                    // reactClickToComponent(),
                    tabToComponents({
                        editor: process.env.LAUNCH_EDITOR || "code",
                    }),
                    //   codeInspectorPlugin({
                    //       bundler: "vite",
                    //   }),
                ]
                : []),
            react(),
            ...(isProductionBuild
                ? [
                    Sitemap({
                        hostname: "https://sekai-sticker.vercel.app/",
                        dynamicRoutes,
                    }),
                ]
                : []),
            VitePWA({
                disable: isTest,
                registerType: "prompt",
                includeAssets: [
                    "logo.ico",
                    "apple-touch-icon.png",
                    "pwa-192x192.png",
                    "pwa-512x512.png",
                    "maskable-icon-512x512.png",
                ],
                manifest: {
                    id: "/",
                    name: "Sekai Sticker V2",
                    short_name: "Sekai Sticker",
                    description: "Better Project Sekai sticker maker",
                    start_url: "/",
                    scope: "/",
                    display: "standalone",
                    background_color: "#ffffff",
                    theme_color: "#ffffff",
                    categories: ["graphics", "utilities"],
                    icons: [
                        {
                            src: "/pwa-192x192.png",
                            sizes: "192x192",
                            type: "image/png",
                            purpose: "any",
                        },
                        {
                            src: "/pwa-512x512.png",
                            sizes: "512x512",
                            type: "image/png",
                            purpose: "any",
                        },
                        {
                            src: "/maskable-icon-512x512.png",
                            sizes: "512x512",
                            type: "image/png",
                            purpose: "maskable",
                        },
                    ],
                },
                workbox: {
                    globPatterns: ["**/*.{js,css,html}"],
                    cleanupOutdatedCaches: true,
                    navigateFallback: "index.html",
                    runtimeCaching: [
                        {
                            urlPattern: ({ sameOrigin, url }) =>
                                sameOrigin && url.pathname.startsWith("/img/"),
                            handler: "StaleWhileRevalidate",
                            options: {
                                cacheName: "sticker-images",
                                expiration: {
                                    maxEntries: 400,
                                    maxAgeSeconds: 60 * 60 * 24 * 30,
                                },
                                cacheableResponse: {
                                    statuses: [0, 200],
                                },
                            },
                        },
                        {
                            urlPattern: ({ sameOrigin, url }) =>
                                sameOrigin && /^\/assets\/.*\.woff2?$/.test(url.pathname),
                            handler: "CacheFirst",
                            options: {
                                cacheName: "sticker-fonts",
                                expiration: {
                                    maxEntries: 6,
                                    maxAgeSeconds: 60 * 60 * 24 * 365,
                                },
                                cacheableResponse: {
                                    statuses: [0, 200],
                                },
                            },
                        },
                    ],
                },
            }),
        ],
        build: {
            target: "es2022",
        },
        test: {
            environment: "jsdom",
            globals: true,
            include: ["src/**/*.test.ts"],
            coverage: {
                provider: "v8",
                reporter: ["text", "html"],
                include: ["src/utils/**/*.ts"],
            },
        },
    };
});
