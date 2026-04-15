import { useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import styles from './TiptapEditor.module.css';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  category?: string;
}

export default function TiptapEditor({ content, onChange, placeholder, category = 'event-detail' }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image', 'bulletList', 'orderedList', 'listItem'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: styles.editorImage,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: styles.editorLink,
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Type your content here...',
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const uploadImage = useCallback(async (file: File) => {
    if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) {
      alert('GIF 이미지 파일은 업로드할 수 없습니다.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      // Assume the API returns the file URL or path in a structure like { success: true, data: { fileUrl: '...', filePath: '...' } }
      // This is based on standard VenueOn response structures.
      let imageUrl = '';
      if (data.data?.fileUrl) {
         imageUrl = data.data.fileUrl;
      } else if (data.data?.filePath) {
         imageUrl = `/upload/${data.data.filePath}`;
      } else if (typeof data.data === 'string') {
         imageUrl = `/upload/${data.data}`;
      } else if (data.url) {
         imageUrl = data.url;
      }

      if (imageUrl && editor) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      } else {
        throw new Error('Image URL not returned from server');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  }, [editor]);

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadImage]);

  // Set link prompt
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={styles.editorContainer}>
      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`${styles.toolbarButton} ${editor.isActive('bold') ? styles.isActive : ''}`}
          title="Bold (Ctrl+B)"
        >
          <b>B</b>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`${styles.toolbarButton} ${editor.isActive('italic') ? styles.isActive : ''}`}
          title="Italic (Ctrl+I)"
        >
          <i>I</i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`${styles.toolbarButton} ${editor.isActive('strike') ? styles.isActive : ''}`}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        
        <div className={styles.divider} />
        
        <input
          type="color"
          onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
          className={styles.colorPicker}
          title="Text Color"
        />
        
        <div className={styles.divider} />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'left' }) ? styles.isActive : ''}`}
          title="Align Left"
        >
          ⫷
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'center' }) ? styles.isActive : ''}`}
          title="Align Center"
        >
          ≡
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'right' }) ? styles.isActive : ''}`}
          title="Align Right"
        >
          ⫸
        </button>
        
        <div className={styles.divider} />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${styles.toolbarButton} ${editor.isActive('heading', { level: 2 }) ? styles.isActive : ''}`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`${styles.toolbarButton} ${editor.isActive('heading', { level: 3 }) ? styles.isActive : ''}`}
          title="Heading 3"
        >
          H3
        </button>
        
        <div className={styles.divider} />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${styles.toolbarButton} ${editor.isActive('bulletList') ? styles.isActive : ''}`}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${styles.toolbarButton} ${editor.isActive('orderedList') ? styles.isActive : ''}`}
          title="Ordered List"
        >
          1.
        </button>
        
        <div className={styles.divider} />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${styles.toolbarButton} ${editor.isActive('blockquote') ? styles.isActive : ''}`}
          title="Blockquote"
        >
          "
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`${styles.toolbarButton} ${editor.isActive('codeBlock') ? styles.isActive : ''}`}
          title="Code Block"
        >
          &lt;/&gt;
        </button>
        
        <div className={styles.divider} />
        
        <button
          type="button"
          onClick={setLink}
          className={`${styles.toolbarButton} ${editor.isActive('link') ? styles.isActive : ''}`}
          title="Insert Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={handleImageClick}
          className={styles.toolbarButton}
          title="Insert Image"
        >
          📷
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className={styles.fileInput}
        />
        
        <div className={styles.divider} />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className={styles.toolbarButton}
          title="Undo"
        >
          ↩
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className={styles.toolbarButton}
          title="Redo"
        >
          ↪
        </button>
      </div>
      
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}
