import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "../useAuth";

/* ---------- Schema ---------- */
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/* ---------- Component ---------- */
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const { mutate: forgotPassword, isPending, error } = useForgotPassword();

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data, {
      onSuccess: () => {
        setSubmittedEmail(data.email);
        setIsEmailSent(true);
      },
    });
  };

  /* ---------- Success State ---------- */
  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 border border-border/50 shadow-xl bg-card/95 backdrop-blur-sm rounded-lg space-y-6 text-center">
          <div className="flex justify-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground">
            Check Your Email
          </h2>
          <p className="text-sm text-muted-foreground">
            We’ve sent a password reset link to:
          </p>
          <p className="text-primary font-semibold">{submittedEmail}</p>
          <p className="text-xs text-muted-foreground">
            If you don’t see it in your inbox, please check your spam folder.
            The reset link will expire in 15 minutes.
          </p>

          <div className="space-y-3 pt-2">
            <Button
              onClick={() => {
                setIsEmailSent(false);
                setSubmittedEmail("");
              }}
              className="w-full font-semibold"
            >
              Send Another Email
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="w-full font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Form State ---------- */
  return (
    <div className="w-[85%] sm:w-[420px] p-8 border border-border/50 shadow-xl bg-card/95 backdrop-blur-sm rounded-lg space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Forgot Password?</h1>
        <p className="text-sm text-muted-foreground">
          No worries! Enter your email and we’ll send you a link to reset your
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-foreground"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="pl-9 bg-background/50"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Server Error */}
        {error && (
          <p className="text-sm text-destructive font-medium text-center">
            {error.response?.data?.message ||
              "Something went wrong. Please try again."}
          </p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={!isValid || isPending}
          size="lg"
          className="w-full font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Reset
              Link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      {/* Back to login link */}
      <div className="text-center text-sm text-muted-foreground pt-2">
        Remember your password?{" "}
        <Link
          to="/login"
          className="text-primary font-semibold hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
