import React from 'react';

interface CharacterCounterProps {
  currentLength: number;
  minChars: number;
  recommendedChars: number;
  maxChars: number;
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({
  currentLength,
  minChars,
  recommendedChars,
  maxChars
}) => {
  // Función para determinar el color del contador según la cantidad de caracteres
  const getCounterColor = (length: number) => {
    if (length < minChars) return 'text-red-500'; // Muy poco texto
    if (length <= recommendedChars) return 'text-green-500'; // Cantidad ideal
    if (length <= maxChars * 0.8) return 'text-yellow-500'; // Acercándose al límite
    return 'text-red-500'; // Cerca del límite máximo
  };

  return (
    <div className="flex justify-between mt-1 text-sm">
      <div>
        <span className={`font-medium ${getCounterColor(currentLength)}`}>
          {currentLength}
        </span>
        <span className="text-gray-400"> / {maxChars} caracteres</span>
      </div>
      <div>
        {currentLength < minChars && (
          <span className="text-red-500">Mínimo recomendado: {minChars} caracteres</span>
        )}
        {currentLength > recommendedChars && currentLength <= maxChars * 0.8 && (
          <span className="text-yellow-500">Recomendado: {recommendedChars} caracteres</span>
        )}
        {currentLength > maxChars * 0.8 && (
          <span className="text-red-500">Acercándose al límite máximo</span>
        )}
      </div>
    </div>
  );
};

export default CharacterCounter;
