import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { useChat } from '../../hooks/useChat';
import { useFileUpload } from '../../hooks/useFileUpload';
import { ChatMessage } from './ChatMessage';
import { EmojiPicker } from './EmojiPicker'; // Import the new component
import { useToast } from '../../contexts/ToastContext';

interface ChatRoomProps {
  roomId: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  const { messages, loading, sendMessage } = useChat(roomId);
  const { progress, error: uploadError, isUploading, uploadFile } = useFileUpload();
  const { addToast } = useToast();
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for the textarea

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (uploadError) {
      addToast({ type: 'error', title: 'Upload Failed', message: uploadError.message });
      handleRemoveFile();
    }
  }, [uploadError, addToast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        addToast({ type: 'error', title: 'File too large', message: 'Please select a file smaller than 10MB.' });
        return;
      }
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if (!input.trim() && !file) return;

    let filePayload = null;
    if (file) {
      try {
        const { url, name, size } = await uploadFile(roomId, file);
        filePayload = { url, name, size };
      } catch (e) {
        return;
      }
    }
    
    await sendMessage({ content: input, file: filePayload });
    setInput('');
    handleRemoveFile();
    setIsEmojiPickerOpen(false);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = input.substring(0, start) + emojiData.emoji + input.substring(end);
      setInput(newText);
      // Move cursor to after the inserted emoji
      textarea.selectionStart = textarea.selectionEnd = start + emojiData.emoji.length;
      textarea.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Toggle emoji picker with Ctrl/Cmd + E
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      setIsEmojiPickerOpen(!isEmojiPickerOpen);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 relative"> {/* Add relative positioning for the picker */}
        {/* File Preview & Progress Bar */}
        {(file || isUploading) && (
          <div className="mb-2 p-2 border rounded-lg bg-gray-50 relative">
            {isUploading && (
              <div className="absolute top-0 left-0 h-full bg-blue-100 transition-all duration-300" style={{ width: `${progress}%` }} />
            )}
            <div className="relative z-10 flex items-center space-x-3">
              {filePreview && <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file?.name}</p>
                <p className="text-xs text-gray-500">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Uploading...'}</p>
              </div>
              {!isUploading && (
                <button onClick={handleRemoveFile} className="p-1 text-gray-500 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-end space-x-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-gray-700 transition-colors" title="Attach File" aria-label="Attach File">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} placeholder="Message..." className="flex-1 resize-none border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32" rows={1} />
          
          <button onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)} className="p-2 text-gray-500 hover:text-gray-700 transition-colors" title="Emoji (Ctrl+E)">
            <Smile className="w-5 h-5" />
          </button>
          
          <button onClick={handleSend} disabled={(!input.trim() && !file) || isUploading} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </div>

        <EmojiPicker isOpen={isEmojiPickerOpen} onEmojiClick={onEmojiClick} />
      </div>
    </div>
  );
};