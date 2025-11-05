import {
  init,
  type Models,
  type RematchDispatch,
  type RematchRootState,
} from "@rematch/core";
import { auth } from "@/features/auth/authStore";

// --- Root Model ---
interface RootModel extends Models<RootModel> {
  auth: typeof auth;
}

const models: RootModel = { auth };

// --- Store Initialization ---
export const store = init({
  models,
});

// --- Typed Hooks ---
export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;
