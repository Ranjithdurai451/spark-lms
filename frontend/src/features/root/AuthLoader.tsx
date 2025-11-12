import React from "react";
import { useAuth } from "../auth/useAuth";
import { Sparkles } from "lucide-react";

export default function AuthLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6">
          {/* Logo + Title */}
          <div className="flex items-center gap-6">
            <Sparkles className="w-8 h-8 text-primary animate-pulse mt-4" />
            <h1 className="text-3xl font-semibold bg-gradient-to-r mt-4 from-primary to-primary/70 bg-clip-text text-transparent tracking-tight">
              SparkLMS
            </h1>
            <div className="relative w-14 h-14">
              {/* Shadow */}
              <div className="absolute top-[65px] left-0 w-14 h-[6px] bg-primary/25 rounded-full animate-shadow"></div>
              {/* Cube */}
              <div className="absolute top-0 left-0 w-full h-full bg-primary rounded-md animate-jump"></div>
            </div>
          </div>

          {/* Cube Loader */}
        </div>

        {/* Animations */}
        <style>{`
          @keyframes jump {
            15% { border-bottom-right-radius: 3px; }
            25% { transform: translateY(7px) rotate(22.5deg); }
            50% {
              transform: translateY(14px) scale(1, 0.9) rotate(45deg);
              border-bottom-right-radius: 10px;
            }
            75% { transform: translateY(7px) rotate(67.5deg); }
            100% { transform: translateY(0) rotate(90deg); }
          }

          @keyframes shadow {
            0%, 100% { transform: scale(1, 1); opacity: 0.8; }
            50% { transform: scale(1.2, 1); opacity: 0.5; }
          }

          .animate-jump {
            animation: jump 0.6s ease-in-out infinite;
          }

          .animate-shadow {
            animation: shadow 0.6s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
