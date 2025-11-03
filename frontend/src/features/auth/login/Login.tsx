import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Eye, EyeOff, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { loginSchema } from "../schemas";

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginCard = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      console.log("Login attempt:", data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-fill flex items-center  justify-center ">
      <div className="w-full max-w-md flex flex-col gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium  transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="border border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
          <div className="p-8 space-y-3">
            <div className="flex justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Welcome Back
              </h1>
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
                    to="#"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Forgot?
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
                disabled={!isValid || isLoading}
                size="lg"
                className="w-full  font-semibold"
              >
                {isLoading ? "Signing in..." : "Sign In"}
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
          </div>
        </div>
      </div>
    </div>
  );
};
