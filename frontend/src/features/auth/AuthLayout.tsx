import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="w-dvw h-dvh flex bg ">
      <div className="flex-1">
        <Outlet></Outlet>
      </div>
      <div className=" md:block  hidden flex-1"></div>
    </div>
  );
};

export default Layout;
