import { useId } from "react";
import {
  Controller,
  ControllerRenderProps,
  ControllerFieldState,
  Control,
  FieldValues,
  FieldPath,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormFieldMessage } from "@/components/auth/form-field-message";
import { getFieldErrorId } from "@/lib/utils";
import { cn } from "@/lib/utils";

type InputProps = React.ComponentPropsWithoutRef<"input">;

export type RenderFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
};

type FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  id: string;
  name: TName;
  label: string;
  className?: string;
  control: Control<TFieldValues>;
  renderField?: (
    props: RenderFieldProps<TFieldValues, TName>
  ) => React.ReactNode;
} & Omit<InputProps, "id" | "name">;

export function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  id: propId,
  name,
  label,
  className,
  control,
  renderField,
  ...props
}: FormFieldProps<TFieldValues, TName>) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const fieldErrorId = getFieldErrorId(field.name, id);
          const error = fieldState.error;

          return (
            <>
              {typeof renderField === "function" ? (
                renderField({ field, fieldState })
              ) : (
                <Input
                  {...field}
                  {...props}
                  id={propId}
                  name={name}
                  className={cn("mt-2 border-neutral-300", className)}
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? fieldErrorId : undefined}
                />
              )}
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
