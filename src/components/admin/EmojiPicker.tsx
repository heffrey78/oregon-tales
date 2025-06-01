import React, { FC, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  className?: string;
}

export const EmojiPicker: FC<EmojiPickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [showPicker, setShowPicker] = useState(false);
  
  // Handle emoji selection
  const handleEmojiSelect = (selection: any) => {
    onChange(selection.native);
    setShowPicker(false);
  };
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className={`flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
      >
        <span className="text-xl mr-2">{value || '😀'}</span>
        <span className="text-gray-500 text-sm">
          {value ? 'Change emoji' : 'Select emoji'}
        </span>
      </button>
      
      {showPicker && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowPicker(false)}
          />
          <div className="absolute z-20 mt-1">
            <Picker 
              data={data} 
              onEmojiSelect={handleEmojiSelect}
              previewPosition="none"
              skinTonePosition="none"
              theme="light"
              autoFocus
            />
          </div>
        </>
      )}
    </div>
  );
};

// A simpler version that just renders the emoji with proper styling
export const EmojiDisplay: FC<{ emoji: string | undefined, className?: string }> = ({ 
  emoji, 
  className = '' 
}) => {
  return (
    <span className={`text-2xl ${className}`}>
      {emoji || '❓'}
    </span>
  );
};
