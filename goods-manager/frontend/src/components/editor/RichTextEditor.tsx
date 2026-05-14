'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import {
  Bold, Italic, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon,
  Heading2, Heading3, Undo, Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadService } from '@/services/upload.service';
import toast from 'react-hot-toast';

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  limit?: number;
  error?: string;
  label?: string;
  required?: boolean;
}

const LIMIT = 5000;

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Nhập mô tả chi tiết sản phẩm...',
  limit = LIMIT,
  error,
  label,
  required,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, linkOnPaste: true }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit }),
    ],
    content: value ?? '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  const count = editor?.storage?.characterCount?.characters?.() ?? 0;

  const addLink = () => {
    const url = window.prompt('Nhập URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const url = await uploadService.uploadImage(file);
        editor?.chain().focus().setImage({ src: url }).run();
      } catch {
        toast.error('Upload ảnh thất bại');
      }
    };
    input.click();
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div
        className={cn(
          'tiptap-editor border rounded-xl bg-white overflow-hidden',
          error ? 'border-danger' : 'border-neutral-200',
          'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent',
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-neutral-100 flex-wrap">
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="In đậm"
          >
            <Bold className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="In nghiêng"
          >
            <Italic className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <div className="w-px h-4 bg-neutral-200 mx-1" />
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Tiêu đề H2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Tiêu đề H3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <div className="w-px h-4 bg-neutral-200 mx-1" />
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Danh sách"
          >
            <List className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Danh sách số"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Trích dẫn"
          >
            <Quote className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <div className="w-px h-4 bg-neutral-200 mx-1" />
          <ToolbarBtn onClick={addLink} active={editor.isActive('link')} title="Thêm link">
            <LinkIcon className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={addImage} title="Thêm ảnh">
            <ImageIcon className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <div className="w-px h-4 bg-neutral-200 mx-1" />
          <ToolbarBtn
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Hoàn tác"
          >
            <Undo className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Làm lại"
          >
            <Redo className="w-3.5 h-3.5" />
          </ToolbarBtn>
        </div>

        {/* Editor */}
        <EditorContent editor={editor} />

        {/* Footer */}
        <div className="flex justify-end px-3 py-1.5 border-t border-neutral-50">
          <span className={cn('text-xs', count > limit * 0.9 ? 'text-warning' : 'text-neutral-400')}>
            {count}/{limit}
          </span>
        </div>
      </div>
      {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  active,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'w-7 h-7 flex items-center justify-center rounded-md transition-colors',
        active ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-100',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  );
}
