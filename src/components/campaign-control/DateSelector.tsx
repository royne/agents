import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import { formatDate } from '../../components/campaign-control/utils/formatters';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <FaCalendarAlt className="text-lg text-primary-color" />
        <h2 className="text-xl font-bold">Fecha: {formatDate(selectedDate)}</h2>
      </div>
      <div className="flex items-center space-x-2">
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
        />
      </div>
    </div>
  );
};

export default DateSelector;
