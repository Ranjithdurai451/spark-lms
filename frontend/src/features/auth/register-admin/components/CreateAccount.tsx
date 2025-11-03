"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader, CheckCircle2, Mail } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const stepOneSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

type StepOneFormData = z.infer<typeof stepOneSchema>;

interface AdminStepOneProps {
  data: any;
  onNext: (data: Partial<any>) => void;
  onUpdate: (data: Partial<any>) => void;
}

export const CreateAccount = ({
  data,
  onNext,
  onUpdate,
}: AdminStepOneProps) => {
  const [showPassword, setShowPassword] = useState(false);
  //   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailVerified, setEmailVerified] = useState(
    data.emailVerified || false
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<StepOneFormData>({
    resolver: zodResolver(stepOneSchema),
    mode: "onChange",
    defaultValues: {
      email: data.email || "",
      username: data.username || "",
      password: data.password || "",
    },
  });

  const email = watch("email");
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOtp = async () => {
    if (!isEmailValid) return;
    setIsSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setOtpSent(true);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (otp.length === 6) {
        setEmailVerified(true);
        onUpdate({ email, emailVerified: true });
        setOtp("");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = async (formData: StepOneFormData) => {
    if (!emailVerified) {
      alert("Please verify your email first");
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
    <div className="p-4 flex flex-col gap-6 ">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">
          Create Admin Account
        </h2>
        <p className="text-sm text-muted-foreground">
          Set up your account to get started with SparkLMS
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Email with OTP Verification */}
        <div className="flex gap-3 flex-col">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-foreground flex items-center gap-2"
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
              disabled={emailVerified}
              {...register("email")}
              className=" bg-muted/50 transition-colors"
            />
            {!emailVerified && isEmailValid && (
              <Button
                type="button"
                onClick={handleSendOtp}
                disabled={otpSent || isSending}
                size="lg"
                className=" px-6 font-semibold whitespace-nowrap"
              >
                {isSending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : otpSent ? (
                  "Sent"
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

        {/* OTP Input */}
        {otpSent && !emailVerified && (
          <div className="flex gap-3 flex-col p-4 bg-secondary rounded-lg border border-border animate-in fade-in slide-in-from-top-2 duration-300">
            <label
              htmlFor="otp"
              className="text-sm font-semibold text-foreground"
            >
              Enter 6-Digit Code
            </label>
            <p className="text-xs text-muted-foreground">
              We sent a verification code to {email}
            </p>
            <div className="flex gap-2 justify-center py-2">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value: string) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || isVerifying}
              size="lg"
              className="w-full  font-semibold"
            >
              {isVerifying ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </div>
        )}
        {emailVerified && (
          <>
            {/* Username */}
            <div className="flex gap-3 flex-col">
              <label
                htmlFor="username"
                className="text-sm font-semibold text-foreground"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                {...register("username")}
                className=" bg-muted/50 transition-colors"
              />
              {errors.username && (
                <p className="text-xs text-destructive font-medium">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex gap-3 flex-col">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="  bg-muted/50 transition-colors"
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
              <p className="text-xs text-muted-foreground">
                At least 8 characters, 1 uppercase, 1 lowercase, 1 number
              </p>
              {errors.password && (
                <p className="text-xs text-destructive font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isValid || !emailVerified}
              size="lg"
              className="w-full  font-semibold"
            >
              Continue to Organization Setup
            </Button>
          </>
        )}
      </form>
    </div>
  );
};
