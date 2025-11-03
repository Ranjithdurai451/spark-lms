import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Wand2 } from "lucide-react";

const stepTwoSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  organizationCode: z.string().min(1, "Organization code is required"),
  organizationDescription: z.string().optional(),
});

type StepTwoFormData = z.infer<typeof stepTwoSchema>;

interface AdminStepTwoProps {
  data: any;
  onNext: (data: Partial<any>) => void;
  onBack: () => void;
  onUpdate: (data: Partial<any>) => void;
}

export const CreateOrganization = ({
  data,
  onNext,
  onBack,
}: AdminStepTwoProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<StepTwoFormData>({
    resolver: zodResolver(stepTwoSchema),
    mode: "onChange",
    defaultValues: {
      organizationName: data.organizationName || "",
      organizationCode: data.organizationCode || "",
      organizationDescription: data.organizationDescription || "",
    },
  });

  const onSubmit = async (formData: StepTwoFormData) => {
    onNext({
      organizationName: formData.organizationName,
      organizationCode: formData.organizationCode,
      organizationDescription: formData.organizationDescription,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 ">
      <div className="flex items-start gap-4">
        <div className="space-y-2 flex-1">
          <h2 className="text-xl font-bold text-foreground">
            Create Organization
          </h2>
          <p className="text-sm text-muted-foreground">
            Set up your organization details
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        {/* Organization Name */}
        <div className="flex flex-col gap-3 ">
          <label
            htmlFor="organizationName"
            className="text-sm font-semibold text-foreground"
          >
            Organization Name
          </label>
          <Input
            id="organizationName"
            type="text"
            placeholder="Acme Corporation"
            {...register("organizationName")}
            className=" bg-muted/50 transition-colors"
          />
          {errors.organizationName && (
            <p className="text-xs text-destructive font-medium">
              {errors.organizationName.message}
            </p>
          )}
        </div>

        {/* Organization Code */}
        <div className="flex flex-col gap-3 ">
          <label
            htmlFor="organizationCode"
            className="text-sm font-semibold text-foreground"
          >
            Organization Code
          </label>
          <Input
            id="organizationCode"
            type="text"
            placeholder="ACME"
            {...register("organizationCode")}
            className=" bg-muted/50  transition-colors uppercase"
          />

          {errors.organizationCode && (
            <p className="text-xs text-destructive font-medium">
              {errors.organizationCode.message}
            </p>
          )}
        </div>

        {/* Organization Description */}
        <div className="flex flex-col gap-3 ">
          <label
            htmlFor="organizationDescription"
            className="text-sm font-semibold text-foreground"
          >
            Description (Optional)
          </label>
          <textarea
            id="organizationDescription"
            placeholder="Tell us about your organization..."
            {...register("organizationDescription")}
            className="w-full px-4 py-3 rounded-lg border border-border bg-muted/50 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all resize-none h-24 font-sans text-sm text-foreground"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            size="lg"
            className="flex-1  font-semibold bg-transparent"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={!isValid}
            size="lg"
            className="flex-1  font-semibold"
          >
            Continue to Team
          </Button>
        </div>
      </form>
    </div>
  );
};
