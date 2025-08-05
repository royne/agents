import React, { useState } from 'react';
import { FaStickyNote, FaSave, FaBold, FaItalic, FaListUl } from 'react-icons/fa';

interface CampaignNotesProps {
  initialNotes?: string;
  onSave: (notes: string) => void;
}

const CampaignNotes: React.FC<CampaignNotesProps> = ({ initialNotes = '', onSave }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(notes);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <FaStickyNote className="mr-2 text-yellow-500" />
          Notas de la Campaña
        </div>
        {isEditing ? (
          <button
            onClick={handleSave}
            className="bg-primary-color hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm flex items-center"
          >
            <FaSave className="mr-1" />
            Guardar
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm"
          >
            Editar
          </button>
        )}
      </h2>

      {isEditing ? (
        <div className="space-y-2">
          <div className="bg-gray-700 p-2 rounded-lg flex space-x-2 mb-2">
            <button className="p-1 hover:bg-gray-600 rounded" title="Negrita">
              <FaBold />
            </button>
            <button className="p-1 hover:bg-gray-600 rounded" title="Cursiva">
              <FaItalic />
            </button>
            <button className="p-1 hover:bg-gray-600 rounded" title="Lista">
              <FaListUl />
            </button>
          </div>
          <textarea
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 min-h-[100px] max-h-[150px] focus:ring-primary-color focus:border-primary-color"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escribe notas importantes sobre esta campaña..."
          />
        </div>
      ) : (
        <div className="bg-gray-750 rounded-lg p-4 min-h-[150px] whitespace-pre-wrap">
          {notes ? notes : <span className="text-gray-500 italic">No hay notas registradas para esta campaña.</span>}
        </div>
      )}
    </div>
  );
};

export default CampaignNotes;
