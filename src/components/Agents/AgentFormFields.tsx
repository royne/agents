import React from 'react';
import SystemPromptField from './SystemPromptField';

interface AgentFormFieldsProps {
  formData: {
    name: string;
    description: string;
    model: string;
    system_prompt: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const AgentFormFields: React.FC<AgentFormFieldsProps> = ({
  formData,
  handleChange
}) => {
  return (
    <>
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-theme-primary">Nombre del Asistente</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-gray-700 text-white border border-primary-color focus:border-primary-color focus:outline-none focus:bg-gray-700"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-theme-primary">Descripción</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full p-3 rounded bg-gray-700 text-white border border-primary-color focus:border-primary-color focus:outline-none focus:bg-gray-700"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="model" className="block text-sm font-medium text-theme-primary">Modelo</label>
        <select
          id="model"
          name="model"
          value={formData.model}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-700 text-white border border-primary-color focus:border-primary-color focus:outline-none focus:bg-gray-700"
        >
          <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Versátil)</option>
          <option value="groq-llama3-70b-8192">Llama 3 70B</option>
          <option value="groq-llama3-8b-8192">Llama 3 8B</option>
          <option value="groq-mixtral-8x7b-32768">Mixtral 8x7B</option>
        </select>
      </div>

      <SystemPromptField
        value={formData.system_prompt}
        onChange={handleChange}
      />
    </>
  );
};

export default AgentFormFields;
