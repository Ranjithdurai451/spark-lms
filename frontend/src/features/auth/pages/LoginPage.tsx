import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { loginSchema } from "../schemas";
import { useLoginUser } from "../useAuth";
import { useAppDispatch } from "@/lib/hooks";

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: loginUser, isPending: isSubmitting } = useLoginUser();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const dispatch = useAppDispatch();
  const onSubmit = async (data: LoginFormData) => {
    loginUser(data, {
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
  };

  return (
    <div className=" w-[85%] sm:w-[420px] border border-border/50 bg-card/95 backdrop-blur-sm rounded-lg shadow-xl flex flex-col gap-4 p-5">
      {/* <Link
        to="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium  transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to home
      </Link> */}

      <div className="flex justify-center">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to SparkLMS to continue
        </p>
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-foreground"
          >
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            className=" bg-background/50"
          />
          {errors.email && (
            <p className="text-sm text-destructive font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-foreground"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className=" pr-10 bg-background/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          size="lg"
          className="w-full  font-semibold"
        >
          {isSubmitting ? "Logging in..." : "Log In"}
        </Button>
      </form>
      {/* Signup Link */}
      <div className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          to="/register-admin"
          className="text-primary hover:underline font-semibold"
        >
          Create organization
        </Link>
      </div>
      {errorMsg && (
        <p className="text-xs text-destructive font-medium text-center mt-1">
          {errorMsg}
        </p>
      )}
    </div>
  );
};
