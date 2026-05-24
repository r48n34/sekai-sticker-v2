import "./i18n";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/dropzone/styles.css";
import "react-lazy-load-image-component/src/effects/blur.css";

import { Suspense, lazy } from "react";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LoadingPage from "./components/common/LoadingPage";
import Layout from "./components/common/Layout";

const MainPage = lazy(() => import("./pages/MainPage"));

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <MainPage />,
            },
        ],
    },
]);

function App() {
    return (
        <MantineProvider>
            <Suspense fallback={<LoadingPage />}>
                <ModalsProvider>
                    <Notifications />
                    <RouterProvider router={router} />
                </ModalsProvider>
            </Suspense>
        </MantineProvider>
    );
}

export default App;
