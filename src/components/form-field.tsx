import { useId } from "react";
import { Controller, Control, FieldValues, FieldPath } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormFieldMessage } from "@/components/auth/form-field-message";
import { getFieldErrorId } from "@/lib/utils";
import { cn } from "@/lib/utils";

type InputProps = React.ComponentPropsWithoutRef<"input">;

type FormFieldProps<TFieldValues extends FieldValues> = {
  id: string;
  name: FieldPath<TFieldValues>;
  label: string;
  className?: string;
  control: Control<TFieldValues>;
} & Omit<InputProps, "id" | "name">;

export function FormField<TFieldValues extends FieldValues>({
  id: propId,
  name,
  label,
  className,
  control,
  ...props
}: FormFieldProps<TFieldValues>) {
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
                id={propId}
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
