// src/components/rich-text-editor.tsx

import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
} from "lucide-react";
import { ControllerRenderProps, FieldValues, FieldPath } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Toolbar Component ---
// We create a small, dedicated component for the toolbar buttons.
const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 border-b border-border p-2">
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

// --- Main RichTextEditor Component ---
type RichTextEditorProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  disabled?: boolean;
};

export function RichTextEditor<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ field, disabled = false }: RichTextEditorProps<TFieldValues, TName>) {
  const editor = useEditor({
    immediatelyRender: false,
    // 1. EXTENSIONS: We configure the features we want.
    extensions: [
      StarterKit.configure({
        // Only enable the extensions we need, and configure them.
        heading: {
          levels: [3], // Only allow H3
        },
        // You can disable extensions from the StarterKit if you don't need them.
        // For example, to disable blockquotes:
        // blockquote: false,
      }),
    ],
    // 2. CONTENT: This is the initial value of the editor.
    // We get it from React Hook Form's `field.value`.
    content: (field.value as string) || "",

    // 3. ON UPDATE: This is the key to connecting Tiptap to React Hook Form.
    // Whenever the editor content changes, we update the form's state.
    onUpdate({ editor }) {
      // If the content is empty, we store an empty string.
      const html = editor.isEmpty ? "" : editor.getHTML();
      field.onChange(html);
    },

    // 4. ON BLUR: We call RHF's onBlur to trigger validation.
    onBlur() {
      field.onBlur();
    },

    editorProps: {
      attributes: {
        class: cn(
          "prose prose-neutral prose-sm",
          "min-h-[120px] max-h-96 overflow-y-auto w-full px-3 py-2 text-sm placeholder:text-muted-foreground",
          "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        ),
      },
    },

    // 6. EDITABLE: We can disable the editor based on the form's state.
    editable: !disabled,
  });

  return (
    <div className="mt-2 rounded-md border border-neutral-300 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
