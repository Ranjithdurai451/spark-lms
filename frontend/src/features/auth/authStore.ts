import type { RootModel } from "@/lib/storeModels";
import type { User } from "@/lib/types";
import { createModel } from "@rematch/core";

// --- Auth model state ---
export interface AuthState {
  user: User | null;
}

export const auth = createModel<RootModel>()({
  state: {
    user: null,
  } as AuthState,

  reducers: {
    setUser(_, payload: User) {
      localStorage.setItem("user", JSON.stringify(payload));
      return { user: payload };
    },
    clearUser() {
      return { user: null };
    },
  },
});
