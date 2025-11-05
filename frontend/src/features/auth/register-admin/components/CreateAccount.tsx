import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, CheckCircle2, Mail, Loader } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { CreateAccountSchema } from "../../schemas";
import { cn } from "@/lib/utils";
import { useSendEmailVerificationOtp, useVerifyEmail } from "../../useAuth";

type CreateAccount = z.infer<typeof CreateAccountSchema>;

interface CreateAccountProps {
  data: any;
  onNext: (data: Partial<any>) => void;
  onUpdate: (data: Partial<any>) => void;
}

export const CreateAccount = ({
  data,
  onNext,
  onUpdate,
}: CreateAccountProps) => {
  const [otpToken, setOtpToken] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(!!data.emailVerified);
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<CreateAccount>({
    resolver: zodResolver(CreateAccountSchema),
    mode: "onChange",
    defaultValues: {
      email: data.email || "",
      username: data.username || "",
      password: data.password || "",
    },
  });

  const email = watch("email");
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const { mutate: sendOtp, isPending: isSendingOtp } =
    useSendEmailVerificationOtp();
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerifyEmail();

  // ⏱ Countdown for resend OTP
  useEffect(() => {
    let timer: number;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = () => {
    if (!isEmailValid) return;
    setErrorMsg(null);

    sendOtp(
      { email },
      {
        onSuccess: (res) => {
          setOtpToken(res.data?.otpToken ?? "");
          setOtpSent(true);
          setResendCooldown(30); // start 30s cooldown
        },
        onError: (error) => {
          const msg =
            error.response?.data?.message ||
            "Failed to send OTP. Please try again.";
          setErrorMsg(msg);
        },
      }
    );
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    handleSendOtp();
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6 || !otpToken) return;
    setErrorMsg(null);

    verifyOtp(
      { otp, token: otpToken },
      {
        onSuccess: () => {
          setEmailVerified(true);
          onUpdate({ email, emailVerified: true });
        },
        onError: (error) => {
          const msg =
            error.response?.data?.message || "Invalid or expired OTP.";
          setErrorMsg(msg);
        },
      }
    );
  };

  const onSubmit = (formData: CreateAccount) => {
    if (!emailVerified) {
      setErrorMsg("Please verify your email first.");
      return;
    }

    onNext({
      email: formData.email,
      username: formData.username,
      password: formData.password,
      emailVerified: true,
    });
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Create Admin Account</h2>
        <p className="text-sm text-muted-foreground">
          Set up your admin credentials to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* ---------- EMAIL + OTP ---------- */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Email Address
            {emailVerified && (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            )}
          </label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={emailVerified || otpSent}
              {...register("email")}
              className={cn(
                "bg-muted/50",
                (emailVerified || otpSent) && "opacity-70"
              )}
            />
            {!emailVerified && (
              <Button
                type="button"
                disabled={
                  !isEmailValid ||
                  isSendingOtp ||
                  (otpSent && resendCooldown > 0)
                }
                onClick={otpSent ? handleResendOtp : handleSendOtp}
                className="px-5 font-medium whitespace-nowrap"
              >
                {isSendingOtp ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" /> Sending...
                  </>
                ) : otpSent ? (
                  resendCooldown > 0 ? (
                    `Resend (${resendCooldown}s)`
                  ) : (
                    "Resend OTP"
                  )
                ) : (
                  "Send OTP"
                )}
              </Button>
            )}
          </div>
          {errors.email && (
            <p className="text-xs text-destructive font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* ---------- OTP FIELD ---------- */}
        {!emailVerified && otpToken && (
          <div className="flex justify-center items-center flex-col gap-3 bg-secondary/40 p-4 rounded-lg border border-border animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-sm font-semibold text-center">
              Enter Verification Code
            </label>
            <p className="text-xs text-muted-foreground text-center">
              Check your inbox for the 6-digit code sent to <b>{email}</b>
            </p>

            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value: string) => setOtp(value)}
            >
              <InputOTPGroup>
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>

            <Button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || isVerifyingOtp}
              className="w-full"
            >
              {isVerifyingOtp ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </div>
        )}

        {/* ---------- USERNAME + PASSWORD ---------- */}
        {emailVerified && (
          <>
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
            </div>

            <Button type="submit" disabled={!isValid} className="w-full mt-2">
              Continue to Organization Setup
            </Button>
          </>
        )}

        {/* ---------- GLOBAL ERROR ---------- */}
        {errorMsg && (
          <p className="text-xs text-destructive font-medium text-center mt-1">
            {errorMsg}
          </p>
        )}
      </form>
    </div>
  );
};
