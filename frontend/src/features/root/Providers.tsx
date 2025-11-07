import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "@/lib/globalStore";
import type { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";

export const queryClient = new QueryClient();

function App({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>{children}</Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
