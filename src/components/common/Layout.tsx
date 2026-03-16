import { Outlet } from "react-router-dom";
import FooterComp from "./FooterComp";

function Layout() {
  return (
    <>
      <Outlet />
      <FooterComp />
    </>
  );
}

export default Layout;
