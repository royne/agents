import React, { useState } from 'react';
import CharacterCounter from './CharacterCounter';
import PromptInfoTooltip from './PromptInfoTooltip';

interface SystemPromptFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  minChars?: number;
  recommendedChars?: number;
  maxChars?: number;
}

const SystemPromptField: React.FC<SystemPromptFieldProps> = ({
  value,
  onChange,
  minChars = 150,
  recommendedChars = 800,
  maxChars = 5000
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Función para manejar el cambio y limitar los caracteres
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxChars) {
      onChange(e);
    }
  };

  return (
    <div className="mb-6 relative">
      <div className="flex items-center mb-1">
        <label htmlFor="system_prompt" className="block text-sm font-medium text-theme-primary">
          Instrucciones del Sistema
        </label>
        <PromptInfoTooltip 
          showTooltip={showTooltip} 
          setShowTooltip={setShowTooltip} 
        />
      </div>
      <textarea 
        id="system_prompt" 
        name="system_prompt" 
        value={value}
        onChange={handleChange}
        rows={8}
        placeholder="Instrucciones para definir el comportamiento y conocimientos del asistente..."
        className="w-full p-3 rounded bg-gray-700 text-white border border-primary-color focus:border-primary-color focus:outline-none focus:bg-gray-700" 
      />
      <CharacterCounter 
        currentLength={value.length}
        minChars={minChars}
        recommendedChars={recommendedChars}
        maxChars={maxChars}
      />
    </div>
  );
};

export default SystemPromptField;
