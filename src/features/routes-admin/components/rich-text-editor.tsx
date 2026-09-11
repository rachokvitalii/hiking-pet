"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  BoldIcon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
} from "lucide-react";

import { Toggle } from "~/components/ui/toggle";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

type RichTextEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  "aria-invalid"?: boolean;
};

export function RichTextEditor({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  "aria-invalid": ariaInvalid,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
        },
      }),
      Placeholder.configure({
        placeholder: "Describe the route...",
      }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: nextEditor }) => {
      onChange(nextEditor.getHTML());
    },
    onBlur: () => {
      onBlur?.();
    },
    editorProps: {
      attributes: {
        id,
        class: cn(
          "min-h-56 px-3 py-2 text-sm outline-none",
          "[&_a]:text-primary [&_a]:underline",
          "[&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold",
          "[&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
          "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_p]:mb-2 last:[&_p]:mb-0",
          "[&_p.is-editor-empty:first-child::before]:text-muted-foreground",
          "[&_p.is-editor-empty:first-child::before]:pointer-events-none",
          "[&_p.is-editor-empty:first-child::before]:float-left",
          "[&_p.is-editor-empty:first-child::before]:h-0",
          "[&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        ),
      },
    },
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  const setLink = () => {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");

    if (url === null) {
      return;
    }

    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div
      className={cn(
        "border-input overflow-hidden rounded-md border bg-transparent shadow-xs",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        ariaInvalid &&
          "border-destructive ring-destructive/20 dark:ring-destructive/40 ring-[3px]",
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b p-1">
        <Toggle
          size="sm"
          variant="outline"
          pressed={editor?.isActive("bold") ?? false}
          disabled={!editor || disabled}
          aria-label="Bold"
          className="cursor-pointer"
          onPressedChange={() => editor?.chain().focus().toggleBold().run()}
        >
          <BoldIcon />
        </Toggle>
        <Toggle
          size="sm"
          variant="outline"
          pressed={editor?.isActive("italic") ?? false}
          disabled={!editor || disabled}
          aria-label="Italic"
          className="cursor-pointer"
          onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon />
        </Toggle>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Toggle
          size="sm"
          variant="outline"
          pressed={editor?.isActive("heading", { level: 2 }) ?? false}
          disabled={!editor || disabled}
          aria-label="Heading 2"
          className="cursor-pointer"
          onPressedChange={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2Icon />
        </Toggle>
        <Toggle
          size="sm"
          variant="outline"
          pressed={editor?.isActive("heading", { level: 3 }) ?? false}
          disabled={!editor || disabled}
          aria-label="Heading 3"
          className="cursor-pointer"
          onPressedChange={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3Icon />
        </Toggle>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Toggle
          size="sm"
          variant="outline"
          pressed={editor?.isActive("bulletList") ?? false}
          disabled={!editor || disabled}
          aria-label="Bullet list"
          className="cursor-pointer"
          onPressedChange={() =>
            editor?.chain().focus().toggleBulletList().run()
          }
        >
          <ListIcon />
        </Toggle>
        <Toggle
          size="sm"
          variant="outline"
          pressed={editor?.isActive("orderedList") ?? false}
          disabled={!editor || disabled}
          aria-label="Numbered list"
          className="cursor-pointer"
          onPressedChange={() =>
            editor?.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrderedIcon />
        </Toggle>
        <Toggle
          size="sm"
          variant="outline"
          pressed={editor?.isActive("link") ?? false}
          disabled={!editor || disabled}
          aria-label="Link"
          className="cursor-pointer"
          onPressedChange={setLink}
        >
          <LinkIcon />
        </Toggle>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
