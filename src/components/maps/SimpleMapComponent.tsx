import { useState } from 'react';

interface SimpleMapComponentProps {
  className?: string;
}

const SimpleMapComponent = ({ className = '' }: SimpleMapComponentProps) => {
  const [address, setAddress] = useState<string>('');
  const [mapUrl, setMapUrl] = useState<string>('https://maps.google.com/maps?q=colombia&t=&z=5&ie=UTF8&iwloc=&output=embed');

  const handleSearch = () => {
    if (address.trim()) {
      // Codificar la dirección para la URL
      const encodedAddress = encodeURIComponent(address);
      setMapUrl(`https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex mb-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Buscar dirección..."
          className="flex-grow p-2 rounded-l-lg bg-gray-700 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={!address.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r-lg disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
      
      <div className="w-full h-[400px] rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapUrl}
          title="Google Maps"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default SimpleMapComponent;
