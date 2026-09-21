"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { toast } from "sonner";
import {
  BoldIcon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
} from "lucide-react";

import { Toggle } from "~/components/ui/toggle";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import {
  DESCRIPTION_IMAGE_ACCEPT,
  DESCRIPTION_IMAGE_MAX_BYTES,
  DESCRIPTION_IMAGE_UPLOAD_PATH,
  isAllowedDescriptionImageType,
} from "~/features/routes-admin/description-image";

type RichTextEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  "aria-invalid"?: boolean;
};

function clipboardOrDropHasImageFile(data: DataTransfer | null | undefined) {
  if (!data) {
    return false;
  }

  return Array.from(data.files).some((file) => file.type.startsWith("image/"));
}

export function RichTextEditor({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  "aria-invalid": ariaInvalid,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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
      Image.configure({
        inline: false,
        allowBase64: false,
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
          "[&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md",
          "[&_p.is-editor-empty:first-child::before]:text-muted-foreground",
          "[&_p.is-editor-empty:first-child::before]:pointer-events-none",
          "[&_p.is-editor-empty:first-child::before]:float-left",
          "[&_p.is-editor-empty:first-child::before]:h-0",
          "[&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        ),
      },
      handlePaste: (_view, event) => {
        if (clipboardOrDropHasImageFile(event.clipboardData)) {
          event.preventDefault();
          return true;
        }

        return false;
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved) {
          return false;
        }

        if (clipboardOrDropHasImageFile(event.dataTransfer)) {
          event.preventDefault();
          return true;
        }

        return false;
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

  const insertImage = async (file: File) => {
    if (!editor) {
      return;
    }

    if (!isAllowedDescriptionImageType(file.type)) {
      toast.error("Use a JPEG, PNG, or WebP image");
      return;
    }

    if (file.size > DESCRIPTION_IMAGE_MAX_BYTES) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(DESCRIPTION_IMAGE_UPLOAD_PATH, {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Image upload failed");
      }

      editor.chain().focus().setImage({ src: payload.url }).run();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Image upload failed";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const onImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    void insertImage(file);
  };

  const toolbarDisabled = !editor || disabled === true;
  const imageControlDisabled = toolbarDisabled || uploading;

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
          disabled={toolbarDisabled}
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
          disabled={toolbarDisabled}
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
          disabled={toolbarDisabled}
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
          disabled={toolbarDisabled}
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
          disabled={toolbarDisabled}
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
          disabled={toolbarDisabled}
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
          disabled={toolbarDisabled}
          aria-label="Link"
          className="cursor-pointer"
          onPressedChange={setLink}
        >
          <LinkIcon />
        </Toggle>
        <Toggle
          size="sm"
          variant="outline"
          pressed={false}
          disabled={imageControlDisabled}
          aria-label="Insert image"
          className="cursor-pointer"
          onPressedChange={() => fileInputRef.current?.click()}
        >
          <ImageIcon />
        </Toggle>
        <input
          ref={fileInputRef}
          type="file"
          accept={DESCRIPTION_IMAGE_ACCEPT}
          className="hidden"
          tabIndex={-1}
          disabled={imageControlDisabled}
          onChange={onImageFileChange}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
