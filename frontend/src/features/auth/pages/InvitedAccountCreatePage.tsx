import { useForm } from "react-hook-form";
import { InviteAccountSchema } from "../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { EyeOff, Eye, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router";
import { useAcceptInvite } from "../useAuth";
import { useAppDispatch } from "@/lib/hooks";
import { queryClient } from "@/features/root/Providers";
type InviteAccount = z.infer<typeof InviteAccountSchema>;
export const InvitedAccountCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams, _] = useSearchParams();
  const token = searchParams.get("token");
  if (!token) {
    navigate("/");
  }
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: acceptInvite, isPending: isSubmitting } = useAcceptInvite();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<InviteAccount>({
    resolver: zodResolver(InviteAccountSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const dispatch = useAppDispatch();
  const onSubmit = (formData: InviteAccount) => {
    queryClient.clear();
    setErrorMsg(null);
    if (token) {
      const payload = {
        ...formData,
        token,
      };
      acceptInvite(payload, {
        onSuccess: (res) => {
          if (res.data?.user) {
            dispatch.auth.setUser(res.data?.user);
            navigate("/in");
          } else {
            setErrorMsg("Something went wrong. Please try again.");
          }
        },
        onError: (error: any) => {
          const msg =
            error.response?.data?.message ||
            "Something went wrong. Please try again.";
          setErrorMsg(msg);
        },
      });
    }
  };
  return (
    <div className="w-[85%] sm:w-[420px] p-6 flex flex-col   gap-6 border border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Setup Account</h2>
        <p className="text-sm text-muted-foreground">
          Add your credentials to continue
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* ---------- USERNAME + PASSWORD ---------- */}
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-sm font-semibold">
            Username
          </label>
          <Input
            id="username"
            type="text"
            placeholder="johndoe"
            {...register("username")}
            className="bg-muted/50"
          />
          {errors.username && (
            <p className="text-xs text-destructive font-medium">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-semibold">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className="bg-muted/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Must be 8+ chars, include upper, lower & a number.
          </p>
          {errors.password && (
            <p className="text-xs text-destructive font-medium">
              {errors.password.message}
            </p>
          )}
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Creating
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </div>
        {errorMsg && (
          <p className="text-xs text-destructive font-medium text-center mt-1">
            {errorMsg}
          </p>
        )}
      </form>
    </div>
  );
};
