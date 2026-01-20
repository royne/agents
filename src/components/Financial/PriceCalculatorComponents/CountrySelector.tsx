import React from 'react';
import { Country, COUNTRIES } from '../../../constants/countries';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface CountrySelectorProps {
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ selectedCountry, onCountryChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative mb-6">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        País de Operación
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{selectedCountry.flag}</span>
          <div className="text-left">
            <div className="font-semibold text-white">{selectedCountry.name}</div>
            <div className="text-xs text-gray-500">{selectedCountry.currency} - {selectedCountry.symbol}</div>
          </div>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 py-2 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                onClick={() => {
                  onCountryChange(country);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${selectedCountry.code === country.code ? 'bg-blue-500/10 text-blue-400' : 'text-gray-300'
                  }`}
              >
                <span className="text-2xl">{country.flag}</span>
                <div>
                  <div className="font-medium">{country.name}</div>
                  <div className="text-xs text-gray-500">{country.currency}</div>
                </div>
                {selectedCountry.code === country.code && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 rounded-full bg-blue-500Shadow" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CountrySelector;
