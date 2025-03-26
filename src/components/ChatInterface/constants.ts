import process from 'process';

export const AGENTS = [
  {
    id: 'research',
    name: 'Asistente investigador de marketing',
    description: 'Asistente para consultas y analisis de tendencias y productos',
    model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'deepseek-r1-distill-llama-70b'
  },
  {
    id: 'marketing',
    name: 'Especialista en marketing digital',
    description: 'Especialista generador de angulos de venta e investigacion',
    model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'deepseek-r1-distill-llama-70b'
  },
  {
    id: 'script',
    name: 'Experto en contenido',
    description: 'Especialista en creacion de contenido UGC',
    model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'deepseek-r1-distill-llama-70b'
  },
];
