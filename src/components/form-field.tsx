import { useId } from "react";
import { Controller, ControllerProps } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormFieldMessage } from "@/components/auth/form-field-message";
import { getFieldErrorId } from "@/lib/utils";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  id: string;
  name: string;
  label: string;
  className: string;
  control: ControllerProps["control"];
};

export function FormField({
  id,
  name,
  label,
  className,
  control,
  ...props
}: FormFieldProps) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const fieldErrorId = getFieldErrorId(field.name, id);
          return (
            <>
              <Input
                {...field}
                {...props}
                id={id}
                name={name}
                className={cn("mt-2 border-neutral-300", className)}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? fieldErrorId : undefined}
              />
              <FormFieldMessage
                errorMessage={error?.message}
                errorId={fieldErrorId}
              />
            </>
          );
        }}
      />
    </div>
  );
}
