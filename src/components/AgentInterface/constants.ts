import process from 'process';

// Agentes sin RAG para la vista de agentes
export const NON_RAG_AGENTS = [
  {
    id: 'research',
    name: 'Asistente investigador de marketing',
    description: 'Asistente para consultas y analisis de tendencias y productos',
    model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'llama-3.3-70b-versatile'
  },
  {
    id: 'marketing',
    name: 'Especialista en marketing digital',
    description: 'Especialista generador de angulos de venta e investigacion',
    model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'llama-3.3-70b-versatile'
  },
];
