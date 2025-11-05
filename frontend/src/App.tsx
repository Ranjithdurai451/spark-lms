import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "@/features/auth/AuthLayout";
import DefaultBanner from "@/features/root/DefaultBanner";
import { LoginCard } from "@/features/auth/login/Login";
import { RegisterCard } from "@/features/auth/register-admin/Register";
import Dashboard from "./components/ui/Dashboard";
import { useAppDispatch } from "./lib/hook";
import { useEffect } from "react";
import PublicRoute from "./features/root/PublicRoute";
import RootLayout from "./features/root/RootLayout";

function App() {
  const dispatch = useAppDispatch();

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: (
            <PublicRoute>
              <DefaultBanner />
            </PublicRoute>
          ),
        },
        {
          path: "login",
          element: (
            <PublicRoute>
              <LoginCard />
            </PublicRoute>
          ),
        },
        {
          path: "register-admin",
          element: (
            <PublicRoute>
              <RegisterCard />
            </PublicRoute>
          ),
        },
      ],
    },
    {
      path: "in",
      element: <RootLayout />,
    },
  ]);
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) dispatch.auth.setUser(JSON.parse(user));
  }, []);
  return <RouterProvider router={router} />;
}

export default App;
