import React, { useState, useEffect } from 'react';
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';

// Array de frases inspiradoras de mentores
const mentorQuotes = [
  {
    quote: "Realmente, aquí existen oportunidades; la clave para nosotros está en saber aprovecharlas y mejorar lo que otros ya están haciendo.",
    author: "Juan Naicipa"
  },
  {
    quote: "Al final del día, estos son procesos de prueba y error; lo importante es observar qué nos funciona y qué no, por ejemplo, si ciertos límites son efectivos.",
    author: "Juan Naicipa"
  },
  {
    quote: "Como tal, la metrica mas importante es la tasa del CPA.",
    author: "Juan Naicipa"
  },
  {
    quote: "Dele prioridad a lo que le genere plata, lo que no le genere plata para la m****.",
    author: "Jose Naicipa"
  },
  {
    quote: "Vea, no hay manera que usted salga adelante sin terquedad. ¿Por qué está en este negocio? Y aquí mucha gente que le dice, 'No, es que el dropshipping no funciona, el dropshipping no sé qué... Adivine qué, usted está aquí por terquedad y esa terquedad es la que tienen los emprendedores y empresarios.",
    author: "Jose Naicipa"
  },
  {
    quote: "Si usted quiere volverse un crack en este negocio, aprenda las métricas. En general, si usted quiere interpretar algo en la vida, los números le dicen todo",
    author: "Jose Naicipa"
  },
  {
    quote: "El angulo de venta es el rey.",
    author: "Martin Saldarriaga"
  },
  {
    quote: "Evidentemente si ustedes intentan e intentan intentan va a llegar el día en el que algo les va a pegar.",
    author: "Martin Saldarriaga"
  },
  {
    quote: "No es que no hayan productos ganadores, es que hay ángulos de venta ganadores",
    author: "Martin Saldarriaga"
  }
];

const MentorQuote: React.FC = () => {
  const [quote, setQuote] = useState<{ quote: string; author: string }>(mentorQuotes[0]);

  // Seleccionar una frase aleatoria al montar el componente
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * mentorQuotes.length);
    setQuote(mentorQuotes[randomIndex]);
  }, []);

  return (
    <div className="relative w-full py-2 group">
      <FaQuoteLeft className="text-6xl text-primary-color/5 absolute -top-4 -left-4 group-hover:text-primary-color/10 transition-colors duration-500" />
      <div className="relative z-10 text-center px-4">
        <p className="text-xl md:text-2xl text-white font-light italic leading-relaxed tracking-wide opacity-90 group-hover:opacity-100 transition-opacity">
          "{quote.quote}"
        </p>
        <footer className="mt-6 flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-primary-color/30"></div>
          <cite className="text-primary-color font-bold not-italic text-sm tracking-[0.2em] uppercase">
            {quote.author}
          </cite>
          <div className="h-px w-8 bg-primary-color/30"></div>
        </footer>
      </div>
      <FaQuoteRight className="text-6xl text-primary-color/5 absolute -bottom-4 -right-4 group-hover:text-primary-color/10 transition-colors duration-500" />
    </div>
  );
};

export default MentorQuote;
