import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "@/features/root/Layout";
import DefaultBanner from "./features/root/DefaultBanner";
import { LoginCard } from "./features/auth/login/Login";
import { RegisterCard } from "./features/auth/register-admin/Register";

function App() {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <DefaultBanner />,
        },
        {
          path: "login",
          element: <LoginCard />,
        },
        {
          path: "register-admin",
          element: <RegisterCard />,
        },
      ],
    },
  ]);
  return <RouterProvider router={routes}></RouterProvider>;
}

export default App;
