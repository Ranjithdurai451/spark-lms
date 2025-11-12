import { X, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
interface ErrorPageProps {
  message: string;
  refetch: () => void;
}
const ErrorPage = ({ message, refetch }: ErrorPageProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
        <X className="w-8 h-8 text-destructive" />
      </div>
      <p className="text-destructive font-semibold text-lg">{message}</p>
      <Button onClick={() => refetch()} variant="outline" className="gap-2">
        <RefreshCcw className="w-4 h-4" /> Retry
      </Button>
    </div>
  );
};

export default ErrorPage;
