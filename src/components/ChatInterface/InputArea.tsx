import { ChangeEvent } from 'react';

interface InputAreaProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}

export default function InputArea({ value, onChange, className }: InputAreaProps) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder="Escribe tu mensaje o sube una imagen..."
      className={`flex-1 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
        className || ''
      }`}
      rows={1}
    />
  );
}
