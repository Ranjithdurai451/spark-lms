import { auth } from "@/features/auth/authStore";
import { type Models } from "@rematch/core";

export interface RootModel extends Models<RootModel> {
  auth: typeof auth;
}

export const models: RootModel = { auth };
