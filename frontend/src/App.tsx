import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "@/features/auth/AuthLayout";
import DefaultBanner from "@/features/root/DefaultBanner";
import { RegisterPage } from "@/features/auth/register-admin/RegisterPage";
import PublicRoute from "./features/root/PublicRoute";
import RootLayout from "./features/root/RootLayout";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { InvitedAccountCreatePage } from "./features/auth/pages/InvitedAccountCreatePage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetpasswordPage";
import { OrganizationPage } from "./features/organization/OrganizationPage";
import { HolidaysPage } from "./features/holidays/HolidaysPage";
import { LeavePolicyPage } from "./features/leave-policy/LeavePolicyPage";
import { MyLeavesPage } from "./features/my-leaves/MyLeavesPage";
import { LeaveRequestsPage } from "./features/leave-requests/LeaveRequestsPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import ProtectedRoute from "./features/root/ProctectedRoute";
import { ProfilePage } from "./features/profile/ProfilePage";
import { useEffect } from "react";

function App() {
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
      element: (
        <ProtectedRoute>
          <RootLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <DashboardPage />, // All roles can access dashboard
        },
        {
          path: "organization",
          element: (
            <ProtectedRoute>
              <OrganizationPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "holidays",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "HR"]}>
              <HolidaysPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "leave-policy",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "HR"]}>
              <LeavePolicyPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "my-leaves",
          element: <MyLeavesPage />, // All roles can access
        },
        {
          path: "leave-requests",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "HR", "MANAGER"]}>
              <LeaveRequestsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "profile",
          element: <ProfilePage />,
        },
        {
          path: "profile/:userId",
          element: <ProfilePage />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
