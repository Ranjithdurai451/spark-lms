interface StepsIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepsIndicator = ({
  currentStep,
  totalSteps,
}: StepsIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-500 ease-out ${
            i < currentStep ? "bg-primary" : "bg-muted"
          }`}
        />
      ))}
    </div>
  );
};
