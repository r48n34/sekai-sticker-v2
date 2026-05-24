import { defineConfig } from "vite";
import { codeInspectorPlugin } from "code-inspector-plugin";
import { reactClickToComponent } from "vite-plugin-react-click-to-component";

import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import Sitemap from "vite-plugin-sitemap";

const dynamicRoutes = ["/"];

export default defineConfig(({ mode }) => {
    const isTest = mode === "test" || process.env.VITEST === "true";

    if (!process.env.VITE_LAUNCH_EDITOR) {
        process.env.LAUNCH_EDITOR = "code";
    } else {
        process.env.LAUNCH_EDITOR = process.env.VITE_LAUNCH_EDITOR;
    }

    return {
        plugins: isTest ? [react()] : [
            reactClickToComponent(),
            Sitemap({
                hostname: "https://sekai-sticker.vercel.app/",
                dynamicRoutes,
            }),
            codeInspectorPlugin({
                bundler: "vite",
            }),
            react(),
            VitePWA({
                registerType: "autoUpdate",
                includeAssets: ["logo.ico"],
                manifest: {
                    name: "Sekai Sticker V2",
                    short_name: "Sekai Sticker",
                    description: "Better Project Sekai sticker maker",
                    theme_color: "#ffffff",
                    icons: [
                        {
                            src: "logo.ico",
                            sizes: "192x192",
                            type: "image/x-icon",
                        },
                    ],
                },
            }),
        ],
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
