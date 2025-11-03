import { useState } from "react";
import { StepsIndicator } from "./components/StepsIndicator";
import { CreateAccount } from "./components/CreateAccount";
import { CreateOrganization } from "./components/CreateOrganization";
import { AddMembers } from "./components/AddMembers";

type Direction = "next" | "prev";

type FormData = {
  email: string;
  emailVerified: boolean;
  username: string;
  password: string;
  organizationName: string;
  organizationCode: string;
  organizationDescription: string;
  invitedEmails: Array<{ email: string; role: "HR" | "Employee" }>;
};

const steps = [
  { Component: CreateAccount },
  { Component: CreateOrganization },
  { Component: AddMembers },
];

export const RegisterCard = () => {
  const [stepState, setStepState] = useState({
    current: 0,
    direction: "next" as Direction,
  });
  const [formData, setFormData] = useState<FormData>({
    email: "",
    emailVerified: false,
    username: "",
    password: "",
    organizationName: "",
    organizationCode: "",
    organizationDescription: "",
    invitedEmails: [],
  });

  const { current, direction } = stepState;
  const StepComponent = steps[current].Component;

  const handleNextStep = (newData?: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    setStepState((prev) => ({
      current: prev.current + 1,
      direction: "next",
    }));
  };

  const handlePreviousStep = () =>
    setStepState((prev) => ({
      current: prev.current - 1,
      direction: "prev",
    }));

  const handleUpdateData = (newData: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...newData }));

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <StepsIndicator currentStep={current + 1} totalSteps={steps.length} />

        <div className="relative overflow-hidden bg-card border border-border/50 shadow-xl backdrop-blur-sm rounded-xl p-4 transition-all duration-300">
          <div
            key={current}
            className={`transition-all duration-500 ease-in-out transform ${
              direction === "next"
                ? "animate-slide-in-right"
                : "animate-slide-in-left"
            }`}
          >
            <StepComponent
              data={formData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
              onUpdate={handleUpdateData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
