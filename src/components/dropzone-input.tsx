// src/components/dropzone-input.tsx

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ControllerRenderProps } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";
import { UploadCloud, File as FileIcon, X } from "lucide-react";

type DropzoneInputProps = {
  field: ControllerRenderProps<any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  disabled?: boolean;
};

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export function DropzoneInput({ field, disabled }: DropzoneInputProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // We only take the first file, since maxFiles is 1
      if (acceptedFiles.length > 0) {
        field.onChange(acceptedFiles[0]);
      }
    },
    [field]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    multiple: false,
    disabled,
    // Disable click to open file dialog, we'll trigger it with our button
    noClick: true,
  });

  const selectedFile: File | null = field.value;

  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent the dropzone from opening
    field.onChange(null);
  };

  return (
    <div className="mt-2 grid gap-2">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center transition-colors",
          {
            "border-blue-500 bg-blue-50": isDragActive,
            "hover:border-neutral-400": !disabled,
            "cursor-not-allowed opacity-50": disabled,
          }
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mb-2 h-10 w-10 text-neutral-400" />
        <p className="mb-2 text-sm text-neutral-600">
          Drag 'n' drop file here or
        </p>
        <Button
          type="button"
          onClick={open}
          disabled={disabled}
          variant="outline"
        >
          Select File
        </Button>
        <p className="mt-4 text-xs text-neutral-500">
          JPG & PNG image files only
          <br />
          Max. file size: 1MB
        </p>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 p-2">
          <div className="flex items-center gap-2">
            <FileIcon className="h-5 w-5 text-neutral-500" />
            <div className="flex flex-col text-sm">
              <span className="font-medium text-neutral-800">
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
            className="h-7 w-7"
            onClick={handleRemoveFile}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
