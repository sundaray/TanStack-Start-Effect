import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Heading3 } from "lucide-react";
import {
  ControllerRenderProps,
  ControllerFieldState,
  FieldValues,
  FieldPath,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Toolbar = ({
  editor,
  disabled,
}: {
  editor: Editor | null;
  disabled: boolean;
}) => {
  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-2 border border-neutral-300 border-b-0 rounded-t-md",
        disabled && "opacity-50"
      )}
    >
      {/* Bold Button */}
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("bold") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </Button>

      {/* Italic Button */}
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("italic") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </Button>

      {/* Heading 3 Button */}
      <Button
        type="button"
        size="sm"
        variant={
          editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"
        }
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        <Heading3 className="size-4" />
      </Button>

      {/* Bullet List Button */}
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </Button>

      {/* Ordered List Button */}
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </Button>
    </div>
  );
};

type RichTextEditorProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  disabled: boolean;
  "aria-invalid": "true" | "false";
  "aria-describedby": string | undefined;
};

export function RichTextEditor<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  field,
  fieldState,
  disabled,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
}: RichTextEditorProps<TFieldValues, TName>) {
  const { invalid } = fieldState;

  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [3],
        },
      }),
    ],
    content: (field.value as string) || "",

    onUpdate({ editor }) {
      const html = editor.isEmpty ? "" : editor.getHTML();
      field.onChange(html);
    },

    onBlur() {
      field.onBlur();
    },

    editorProps: {
      attributes: {
        "aria-invalid": ariaInvalid,
        ...(ariaDescribedby && { "aria-describedby": ariaDescribedby }),
        class: cn(
          "prose prose-neutral prose-sm",
          "min-h-[120px] max-h-96 overflow-y-auto w-full px-3 py-2 text-sm placeholder:text-muted-foreground border rounded-b-md border-neutral-300 focus-visible:outline-none focus-visible:border-ring transition focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20",
          disabled && "pointer-events-none cursor-not-allowed opacity-50"
        ),
      },
    },

    editable: !disabled,
  });

  return (
    <div className="mt-2 shadow-xs">
      <Toolbar editor={editor} disabled={!!disabled} />
      <EditorContent editor={editor} />
    </div>
  );
}
