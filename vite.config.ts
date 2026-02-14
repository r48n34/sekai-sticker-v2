import { defineConfig } from "vite";
import { codeInspectorPlugin } from 'code-inspector-plugin';

import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import Sitemap from "vite-plugin-sitemap";

const dynamicRoutes = [
    "/",
];

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
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
});
