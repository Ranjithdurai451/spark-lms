import { useState } from "react";
import Header from "./Header";
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router";

const RootLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex  h-dvh w-dvw bg-background text-foreground">
      {/* Header */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Body */}
      <div className="flex flex-col flex-1 ">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto  bg-background scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
