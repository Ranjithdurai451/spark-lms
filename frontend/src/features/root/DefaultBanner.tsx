import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router";

const DefaultBanner = () => {
  return (
    <div className="w-full h-full   flex items-center justify-center ">
      <div className="text-center space-y-6">
        <div className="flex items-center gap-2 flex-col justify-center">
          {/* <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg"> */}
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">SparkLMS</h1>
          <p className="text-lg text-muted-foreground">
            Modern Leave Management Made Simple
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 w-full ">
          <Link to="/login" className="w-full">
            <Button size="lg" className="w-full  text-base font-medium">
              Sign In
            </Button>
          </Link>
          <Link to="/register-admin" className="w-full">
            <Button
              size="lg"
              className="w-full  text-base font-medium bg-transparent"
              variant="outline"
            >
              Create Organization
            </Button>
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-sm text-muted-foreground pt-2">
          New to SparkLMS?{" "}
          <Link
            to="/register-admin"
            className="text-primary hover:underline font-semibold"
          >
            Set up your organization
          </Link>
        </p>
      </div>
    </div>
  );
};

export default DefaultBanner;
