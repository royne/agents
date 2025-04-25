import React from 'react';

interface SearchTypeToggleProps {
  searchType: 'city' | 'state';
  setSearchType: (type: 'city' | 'state') => void;
}

const SearchTypeToggle: React.FC<SearchTypeToggleProps> = ({ searchType, setSearchType }) => {
  return (
    <div className="flex items-center justify-center mb-4 bg-gray-800 p-3 rounded-lg">
      <span className={`mr-3 font-medium ${searchType === 'city' ? 'text-blue-400' : 'text-gray-300'}`}>
        Ciudad
      </span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only"
          checked={searchType === 'state'}
          onChange={() => setSearchType(searchType === 'city' ? 'state' : 'city')}
        />
        <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
          searchType === 'state' ? 'bg-purple-500' : 'bg-blue-500'
        }`}>
          <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ease-in-out ${
            searchType === 'state' ? 'translate-x-5' : ''
          }`}></div>
        </div>
      </label>
      <span className={`ml-3 font-medium ${searchType === 'state' ? 'text-purple-400' : 'text-gray-300'}`}>
        Departamento
      </span>
    </div>
  );
};

export default SearchTypeToggle;
