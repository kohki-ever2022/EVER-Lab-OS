import React, { Suspense } from 'react';
import type { EmojiClickData } from 'emoji-picker-react';

const Picker = React.lazy(() => import('emoji-picker-react'));

interface EmojiPickerProps {
  onEmojiClick: (emojiData: EmojiClickData, event: MouseEvent) => void;
  isOpen: boolean;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiClick, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-14 right-0 z-20">
      <Suspense fallback={<div className="w-72 h-96 bg-gray-100 rounded-lg animate-pulse" />}>
        <Picker 
          onEmojiClick={onEmojiClick}
          autoFocusSearch={false}
          lazyLoadEmojis={true}
          searchPlaceHolder="Search emoji..."
        />
      </Suspense>
    </div>
  );
};