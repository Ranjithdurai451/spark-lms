import { Outlet } from "react-router";
import ThemeToggle from "../root/ThemeToggle";

const Layout = () => {
  return (
    <div className="w-dvw h-dvh flex justify-center items-center relative flex-col">
      {/* <div className="w-full absolute top-0 p-5 flex justify-end ">
        <ThemeToggle />
      </div> */}
      <Outlet></Outlet>

      {/*  Diagonal Cross Top Left Fade Grid Background */}
      <div
        className="absolute text-primary inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 49%, var(--muted) 49%, var(--muted) 51%, transparent 51%),
            linear-gradient(-45deg, transparent 49%, var(--muted) 49%, var(--muted) 51%, transparent 51%)
          `,
          backgroundSize: "40px 40px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)",
          opacity: 0.4,
        }}
      />
    </div>
  );
};

export default Layout;
