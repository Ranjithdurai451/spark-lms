import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import type { RootState, Dispatch } from "@/lib/globalStore";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/features/auth/authService";

export function useApiMutation<TFn extends (...args: any[]) => Promise<any>>(
  mutationFn: TFn,
  options?: UseMutationOptions<
    Awaited<ReturnType<TFn>>, // Response type
    AxiosError<ApiResponse>, // Error type
    Parameters<TFn>[0] // Variables type
  >
) {
  return useMutation<
    Awaited<ReturnType<TFn>>,
    AxiosError<ApiResponse>,
    Parameters<TFn>[0]
  >({
    mutationFn,
    ...options,
  });
}

export const useAppDispatch = () => useDispatch<Dispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
