import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

interface SearchFormProps {
  onSearch: (searchTerm: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar por ciudad..."
        className="flex-grow p-3 bg-gray-700 text-white rounded-l-lg border-r-0 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-lg flex items-center justify-center transition-colors"
      >
        <FaSearch />
      </button>
    </form>
  );
};

export default SearchForm;
