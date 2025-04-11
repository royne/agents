import React, { useState } from 'react';

const ScriptLoader = () => {
  const [scripts, setScripts] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scripts.trim()) {
      alert('Por favor, ingresa al menos un script');
      return;
    }
    
    // Dividir por líneas vacías para separar scripts
    const scriptList = scripts
      .split(/\n\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/scripts/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': localStorage.getItem('groq-api-key') || '',
        },
        body: JSON.stringify({ scripts: scriptList }),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Error al cargar scripts');
      
      alert(`${data.success} scripts cargados correctamente`);
      
      setScripts('');
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: '1rem', boxShadow: '0 0 5px rgba(0,0,0,0.2)', borderRadius: '5px' }}>
        <h2>Cargar Scripts de Entrenamiento</h2>
        <p>Ingresa cada script separado por una línea en blanco</p>
        <textarea
          value={scripts}
          onChange={(e) => setScripts(e.target.value)}
          placeholder="Ingresa tus scripts aquí..."
          style={{ width: '100%', minHeight: '300px' }}
        />
        <button
          disabled={loading}
          style={{ backgroundColor: loading ? '#ccc' : '#4CAF50', color: 'white', padding: '1rem', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {loading ? 'Cargando...' : 'Cargar Scripts'}
        </button>
      </div>
    </form>
  );
};

export default ScriptLoader;