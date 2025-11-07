import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useResetPassword } from "../useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get("token");
  if (!token) {
    navigate("/");
  }
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    server: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: resetPassword, isPending } = useResetPassword();

  /* ---------- Validation ---------- */
  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8)
      return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      return "Password must include uppercase, lowercase, and a number";
    return "";
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ) => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  /* ---------- Handlers ---------- */
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "", server: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );

    if (passwordError || confirmPasswordError) {
      setErrors({
        password: passwordError,
        confirmPassword: confirmPasswordError,
        server: "",
      });
      return;
    }
    if (token)
      resetPassword(
        { token, newPassword: formData.password },
        {
          onSuccess: () => {
            setIsSuccess(true);
          },
          onError: (error) => {
            const msg =
              error.response?.data?.message ||
              "Something went wrong. Please try again.";
            setErrors({
              password: "",
              confirmPassword: "",
              server: msg,
            });
          },
        }
      );
  };

  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="flex items-center mt-1 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 mr-1" />
      {message}
    </div>
  );

  /* ---------- Invalid Token ---------- */
  if (!token) {
    return (
      <div className="w-full max-w-md border border-border/50 bg-card/95 backdrop-blur-sm rounded-lg shadow-xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Invalid Reset Link
        </h2>
        <p className="text-sm text-muted-foreground">
          This reset link is invalid or expired. Please request a new one.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/forgot-password")}
            className="w-full"
          >
            Request New Reset Link
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- Success State ---------- */
  if (isSuccess) {
    return (
      <div className="w-full max-w-md border border-border/50 bg-card/95 backdrop-blur-sm rounded-lg shadow-xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Password Reset Successful
        </h2>
        <p className="text-sm text-muted-foreground">
          You can now log in with your new password.
        </p>
        <Button onClick={() => navigate("/login")} className="w-full">
          Sign In Now
        </Button>
      </div>
    );
  }

  /* ---------- Main Form ---------- */
  return (
    <div className="w-[85%] sm:w-[420px] border border-border/50 bg-card/95 backdrop-blur-sm rounded-lg shadow-xl p-8 space-y-6">
      <div className="flex justify-center">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Password */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-foreground"
          >
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="pl-9 bg-background/50"
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
          {errors.password && <ErrorMessage message={errors.password} />}
          <p className="text-xs text-muted-foreground">
            Must include uppercase, lowercase, and a number (min 8 chars)
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-semibold text-foreground"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              className="pl-9 bg-background/50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <ErrorMessage message={errors.confirmPassword} />
          )}
        </div>

        {/* Server Error */}
        {errors.server && (
          <p className="text-sm text-destructive font-medium text-center">
            {errors.server}
          </p>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="w-full font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resetting
              Password...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground pt-2">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center justify-center text-primary hover:underline font-semibold mx-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
