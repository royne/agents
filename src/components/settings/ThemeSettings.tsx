import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { FaPalette, FaMoon, FaSun, FaCheck } from 'react-icons/fa';

const ThemeSettings: React.FC = () => {
  const { themeConfig, updateTheme, authData } = useAppContext();
  const [color, setColor] = useState(themeConfig.primaryColor);
  
  // Colores predefinidos para elegir
  const predefinedColors = [
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Rojo', value: '#EF4444' },
    { name: 'Morado', value: '#8B5CF6' },
    { name: 'Naranja', value: '#F97316' },
    { name: 'Rosa', value: '#EC4899' },
  ];

  // Actualizar el color cuando cambie en el contexto
  useEffect(() => {
    setColor(themeConfig.primaryColor);
  }, [themeConfig.primaryColor]);

  // Manejar el cambio de color
  const updateCustomTheme = (color: string) => {
    document.documentElement.style.setProperty('--primary-color', color);
    
    // Calcular colores derivados
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Color hover (un poco más claro)
    const hoverColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
    document.documentElement.style.setProperty('--primary-color-hover', hoverColor);
    
    // Color activo (un poco más oscuro)
    const activeColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
    document.documentElement.style.setProperty('--primary-color-active', activeColor);
    
    // Color para la burbuja del asistente (versión muy transparente del color primario)
    const assistantBubbleColorDark = `rgba(${r}, ${g}, ${b}, 0.3)`;
    const assistantBubbleColorLight = `rgba(${r}, ${g}, ${b}, 0.15)`;
    document.documentElement.style.setProperty('--assistant-bubble', 
      document.documentElement.classList.contains('dark-theme') 
        ? assistantBubbleColorDark 
        : assistantBubbleColorLight
    );
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    updateTheme({ primaryColor: newColor });
    updateCustomTheme(newColor);
    
    // Aplicar el color a todos los elementos con la clase active-item
    document.querySelectorAll('.active-item').forEach(el => {
      (el as HTMLElement).style.color = newColor;
    });
    
    // Aplicar el color a todos los botones con la clase btn-primary
    document.querySelectorAll('.btn-primary').forEach(el => {
      (el as HTMLElement).style.backgroundColor = newColor;
    });
  };

  // Manejar el cambio de modo (oscuro/personalizado)
  const handleModeToggle = () => {
    const newMode = !themeConfig.useDarkMode;
    updateTheme({ useDarkMode: newMode });
    
    // Actualizar el color de la burbuja del asistente según el modo
    const currentColor = themeConfig.primaryColor;
    const r = parseInt(currentColor.slice(1, 3), 16);
    const g = parseInt(currentColor.slice(3, 5), 16);
    const b = parseInt(currentColor.slice(5, 7), 16);
    
    // Aplicar el color adecuado según el nuevo modo
    const assistantBubbleColor = newMode
      ? `rgba(${r}, ${g}, ${b}, 0.3)` // Modo oscuro
      : `rgba(${r}, ${g}, ${b}, 0.15)`; // Modo claro
    document.documentElement.style.setProperty('--assistant-bubble', assistantBubbleColor);
    
    // Forzar la actualización de todos los componentes con clases de tema
    setTimeout(() => {
      // Aplicar estilos específicos para el tema claro
      if (!newMode) {
        document.querySelectorAll('.bg-gray-800, .bg-gray-700, .bg-gray-900').forEach(el => {
          (el as HTMLElement).classList.add('bg-theme-component');
        });
        
        document.querySelectorAll('.text-white').forEach(el => {
          (el as HTMLElement).classList.add('text-theme-primary');
        });
      }
    }, 100);
  };

  // Obtener el nombre de la compañía del usuario
  const companyName = authData?.company_id || 'Tu empresa';

  return (
    <div className="bg-theme-component rounded-lg shadow-lg p-6 hover:bg-theme-component-hover transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-theme-primary">Personalización de tema</h2>
        <FaPalette className="text-primary-color" />
      </div>
      
      <p className="text-sm text-theme-tertiary mb-4">
        Personaliza los colores de la aplicación para {companyName}
      </p>
      
      {/* Switch para alternar entre tema oscuro y personalizado */}
      <div className="flex items-center justify-between mb-6 p-3 bg-theme-component-hover rounded-lg">
        <div className="flex items-center">
          <FaMoon className={`mr-2 ${themeConfig.useDarkMode ? 'text-blue-400' : 'text-gray-500'}`} />
          <span className="mr-3">Oscuro</span>
          
          {/* Switch toggle */}
          <button 
            onClick={handleModeToggle}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
            style={{ backgroundColor: themeConfig.useDarkMode ? '#374151' : color }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                themeConfig.useDarkMode ? 'translate-x-1' : 'translate-x-6'
              }`}
            />
          </button>
          
          <span className="ml-3">Personalizado</span>
          <FaSun className={`ml-2 ${!themeConfig.useDarkMode ? 'text-yellow-400' : 'text-gray-500'}`} />
        </div>
      </div>
      
      {/* Selector de color primario */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Color primario
        </label>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {predefinedColors.map((predefinedColor) => (
            <button
              key={predefinedColor.value}
              onClick={() => handleColorChange(predefinedColor.value)}
              className={`w-8 h-8 rounded-full border-2 ${
                color === predefinedColor.value ? 'border-white' : 'border-transparent'
              } relative`}
              style={{ backgroundColor: predefinedColor.value }}
              title={predefinedColor.name}
            >
              {color === predefinedColor.value && (
                <FaCheck className="absolute inset-0 m-auto text-white text-xs" />
              )}
            </button>
          ))}
        </div>
        
        {/* Input de color personalizado */}
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-theme-color"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex-1 p-2 rounded bg-theme-component-hover text-theme-primary border border-theme-color focus:border-primary-color focus:outline-none"
            placeholder="#RRGGBB"
          />
        </div>
      </div>
      
      {/* Vista previa */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Vista previa
        </label>
        <div 
          className="p-4 rounded-lg border border-theme-color"
          style={{ 
            backgroundColor: themeConfig.useDarkMode ? '#1a1a1a' : '#ffffff',
            color: themeConfig.useDarkMode ? '#ffffff' : '#111827'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 
              style={{ color: themeConfig.useDarkMode ? '#ffffff' : '#111827' }}
              className="font-medium"
            >
              Ejemplo de título
            </h3>
            <div 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: color, color: '#ffffff' }}
            >
              Etiqueta
            </div>
          </div>
          <p 
            className="text-sm"
            style={{ color: themeConfig.useDarkMode ? '#d1d5db' : '#374151' }}
          >
            Este es un ejemplo de cómo se verá el contenido con el tema seleccionado.
          </p>
          <button
            className="mt-3 px-4 py-2 rounded-md text-white font-medium"
            style={{ backgroundColor: color }}
          >
            Botón de ejemplo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
