import { ChangeEvent, KeyboardEvent } from 'react';

interface InputAreaProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyPress?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  className?: string;
}

export default function InputArea({ value, onChange, onKeyPress, className }: InputAreaProps) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      placeholder="Escribe tu mensaje o sube una imagen..."
      className={`flex-1 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-primary-color resize-none text-theme-primary ${
        className || ''
      }`}
      rows={1}
    />
  );
}
