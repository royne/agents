import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ 
  checked, 
  onChange, 
  label, 
  disabled = false 
}) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      {label && <span className="mr-3 text-sm font-medium text-theme-secondary">{label}</span>}
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <div
          className={`w-11 h-6 rounded-full peer ${
            disabled 
              ? 'bg-gray-200 cursor-not-allowed' 
              : 'bg-gray-200 peer-checked:bg-primary-color'
          } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-color/50 transition-colors duration-200`}
        ></div>
        <div
          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-200 transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
        ></div>
      </div>
    </label>
  );
};
