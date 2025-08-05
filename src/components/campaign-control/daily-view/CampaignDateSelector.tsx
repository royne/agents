import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import { formatDate } from '../utils/formatters';

interface CampaignDateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  label?: string;
}

const CampaignDateSelector: React.FC<CampaignDateSelectorProps> = ({ 
  selectedDate, 
  onDateChange, 
  label = 'Fecha:' 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm text-gray-400">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaCalendarAlt className="text-gray-400" />
        </div>
        <input
          type="date"
          className="bg-gray-700 border border-gray-600 rounded pl-9 pr-3 py-2 text-sm focus:ring-primary-color focus:border-primary-color"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          aria-label="Seleccionar fecha"
        />
      </div>
    </div>
  );
};

export default CampaignDateSelector;
