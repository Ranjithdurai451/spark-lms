import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "@/features/auth/AuthLayout";
import DefaultBanner from "@/features/root/DefaultBanner";
import { RegisterPage } from "@/features/auth/register-admin/RegisterPage";
import { useAppDispatch } from "./lib/hooks";
import { useEffect } from "react";
import PublicRoute from "./features/root/PublicRoute";
import RootLayout from "./features/root/RootLayout";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { InvitedAccountCreatePage } from "./features/auth/pages/InvitedAccountCreatePage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetpasswordPage";
import { useCheckAuth } from "./features/auth/useAuth";
import DashboardPage from "./features/dashboard/DashboardPage";
import { OrganizationPage } from "./features/organization/OrganizationPage";

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
              <LoginPage />
            </PublicRoute>
          ),
        },
        {
          path: "register-admin",
          element: (
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          ),
        },
        {
          path: "invite",
          element: (
            <PublicRoute>
              <InvitedAccountCreatePage />
            </PublicRoute>
          ),
        },
        {
          path: "forgot-password",
          element: (
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          ),
        },
        {
          path: "reset-password",
          element: (
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          ),
        },
      ],
    },
    {
      path: "in",
      element: <RootLayout />,
      children: [
        {
          index: true,
          element: <DashboardPage />,
        },
        {
          path: "organization",
          element: <OrganizationPage />,
        },
      ],
    },
  ]);
  const { data, error } = useCheckAuth();
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) dispatch.auth.setUser(JSON.parse(user));
  }, []);
  useEffect(() => {
    if (data) {
      dispatch.auth.setUser(data.user);
    } else {
      dispatch.auth.clearUser();
    }
  }, [data, error]);

  return <RouterProvider router={router} />;
}

export default App;
