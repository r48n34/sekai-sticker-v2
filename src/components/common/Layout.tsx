import { Outlet } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import FooterComp from "./FooterComp";

function Layout() {
    return (
        <>
            <ErrorBoundary>
                <Outlet />
            </ErrorBoundary>
            <FooterComp />
        </>
    );
}

export default Layout;
