import { KeyboardEvent } from 'react';
import { PaperAirplaneIcon, PhotoIcon } from '@heroicons/react/24/outline';
import InputArea from './InputArea';

interface ChatFormProps {
  inputText: string;
  isLoading: boolean;
  selectedImage: File | null;
  onInputChange: (text: string) => void;
  onImageSelect: (file: File) => void;
  onSubmit: (e?: React.FormEvent) => void;
}

export const ChatForm = ({
  inputText,
  isLoading,
  selectedImage,
  onInputChange,
  onImageSelect,
  onSubmit
}: ChatFormProps) => {
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-4 bg-gray-700 rounded-b-xl border-t border-gray-600">
      <div className="flex gap-2">
        <label className="cursor-pointer text-gray-300 hover:text-blue-400 transition-colors">
          <PhotoIcon className="h-7 w-7" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onImageSelect(e.target.files[0])}
          />
        </label>
        <InputArea
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="bg-gray-600 border-gray-500 text-white placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`p-3 ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
            } text-white rounded-lg transition-colors shadow-lg`}
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <PaperAirplaneIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      {selectedImage && (
        <div className="mt-2 text-sm text-blue-300">
          {selectedImage.name}
        </div>
      )}
    </form>
  );
};
