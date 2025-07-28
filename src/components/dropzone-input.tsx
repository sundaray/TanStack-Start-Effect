import { useId, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ControllerRenderProps, ControllerFieldState } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";
import { UploadCloud, FileImage as FileImageIcon, X } from "lucide-react";
import { getFieldErrorId } from "@/lib/utils";

type DropzoneInputProps = {
  field: ControllerRenderProps<any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  fieldState: ControllerFieldState;
  disabled: boolean;
};

const MAX_FILE_SIZE = 50 * 1024; // 1MB

export function DropzoneInput({
  field,
  fieldState,
  disabled,
}: DropzoneInputProps) {
  const id = useId();
  const fieldErrorId = getFieldErrorId(field.name, id);
  const fieldError = fieldState.error;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        field.onChange(acceptedFiles[0]);
      }
    },
    [field]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } =
    useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [],
        "image/png": [],
      },
      maxSize: MAX_FILE_SIZE,
      maxFiles: 1,
      multiple: false,
      disabled,
      noClick: false,
    });

  const selectedFile: File | null = field.value;

  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    field.onChange(null);
  };

  return (
    <div className="mt-2 grid gap-2">
      <div
        {...getRootProps({
          role: "button",
          "aria-invalid": fieldError ? "true" : "false",
          "aria-describedby": fieldError ? fieldErrorId : undefined,
          className: cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-md border-1 border-dashed border-neutral-300 p-8 text-center transition-colors hover:bg-neutral-50",
            isDragActive && "border-green-500 bg-green-50",
            isDragReject && "border-red-500 bg-red-50",
            disabled && "cursor-not-allowed pointer-events-none opacity-50"
          ),
        })}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mb-2 size-8 text-neutral-400" />
        <p className="mb-2 text-sm text-neutral-700">
          Drag 'n' drop file here or click to select file
        </p>
        <p className="mt-4 text-xs text-neutral-500">
          JPG & PNG image files only
          <br />
          Max. file size: 1MB
        </p>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 p-2">
          <div className="flex items-center gap-2">
            <FileImageIcon className="size-5 text-neutral-500" />
            <div className="flex flex-col text-sm">
              <span className="font-medium text-neutral-700">
                {selectedFile.name}
              </span>
              <span className="text-xs text-neutral-500">
                {formatBytes(selectedFile.size)}
              </span>
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-10 rounded-full hover:bg-neutral-100 text-neutral-500"
            onClick={handleRemoveFile}
            disabled={disabled}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
