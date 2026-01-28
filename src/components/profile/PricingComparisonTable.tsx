import React from 'react';
import { FaCheck, FaMinus, FaInfoCircle } from 'react-icons/fa';

interface ComparisonRow {
  name: string;
  detail: string;
  free: string | boolean;
  starter: string | boolean;
  pro: string | boolean;
  business: string | boolean;
  highlight?: boolean;
}

interface ComparisonCategory {
  title: string;
  rows: ComparisonRow[];
}

const COMPARISON_DATA: ComparisonCategory[] = [
  {
    title: 'Automatización',
    rows: [
      {
        name: 'Estratega Pro (Lanzador)',
        detail: 'Flujo completo de análisis y estrategia',
        free: '10 cr + imágenes',
        starter: '10 cr + imágenes',
        pro: '10 cr + imágenes',
        business: '10 cr + imágenes'
      },
      {
        name: 'Lanzamiento Full AI',
        detail: 'Estrategia + Landing + Ads en 1 click',
        free: 'Prueba',
        starter: '5 / mes',
        pro: '12 / mes',
        business: '30 / mes'
      }
    ]
  },
  {
    title: 'Generación AI',
    rows: [
      {
        name: 'Imagen Pro',
        detail: 'Creativos, Remoción de fondo, Variantes',
        free: '10 cr / imagen',
        starter: '10 cr / imagen',
        pro: '10 cr / imagen',
        business: '10 cr / imagen'
      },
      {
        name: 'Landing Pro',
        detail: 'Estructura por secciones y copy IA',
        free: '10 cr / sección',
        starter: '10 cr / sección',
        pro: '10 cr / sección',
        business: '10 cr / sección'
      },
      {
        name: 'Video Pro',
        detail: 'Scripts y Video UGC Generativo',
        free: '80 cr / video (8segundos)',
        starter: '80 cr / video (8segundos)',
        pro: '80 cr / video (8segundos)',
        business: '80 cr / video (8segundos)'
      }
    ]
  },
  {
    title: 'Inteligencia',
    rows: [
      {
        name: 'Análisis de Producto',
        detail: 'Extracción de esencia y ángulos de venta',
        free: true,
        starter: true,
        pro: true,
        business: true
      },
      {
        name: 'Calculadora de Precios',
        detail: 'Rentabilidad por país ilimitada',
        free: true,
        starter: true,
        pro: true,
        business: true
      },
      {
        name: 'Gestión Logística y rentable',
        detail: 'Análisis de informes Dropi automáticos',
        free: true,
        starter: true,
        pro: true,
        business: true
      }
    ]
  },
  {
    title: 'Soporte y Agentes',
    rows: [
      {
        name: 'Agentes IA',
        detail: 'Análisis y atención automatizada',
        free: 'Limitado',
        starter: 'Estándar',
        pro: 'Personalizados',
        business: 'Elite (A medida)'
      },
      {
        name: 'Soporte',
        detail: 'Canal de atención al cliente',
        free: 'Comunidad',
        starter: 'Email',
        pro: 'Prioritario',
        business: 'VIP WhatsApp'
      }
    ]
  }
];

const PricingComparisonTable: React.FC = () => {
  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <div className="flex justify-center">
          <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <FaCheck className="text-emerald-500 text-[10px]" />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <FaMinus className="text-gray-700 text-[10px]" />
        </div>
      );
    }
    return <span className="text-[11px] font-bold text-gray-300">{value}</span>;
  };

  return (
    <div className="w-full mt-20 animate-fade-in">
      <div className="text-center mb-12">
        <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-2 italic">
          No hay truco: <span className="text-primary-color not-italic">Transparencia Total</span>
        </h3>
        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Compara las capacidades técnicas de cada nivel</p>
      </div>

      <div className="relative overflow-x-auto rounded-[2.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-xl">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] w-1/4">Funcionalidad</th>
              <th className="px-6 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] w-1/4">Detalle</th>
              <th className="px-6 py-8 text-center text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Free</th>
              <th className="px-6 py-8 text-center text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Starter</th>
              <th className="px-6 py-8 text-center text-[10px] font-black text-primary-color uppercase tracking-[0.2em] bg-primary-color/5">Pro</th>
              <th className="px-6 py-8 text-center text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Business</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_DATA.map((category, catIdx) => (
              <React.Fragment key={catIdx}>
                <tr className="bg-white/[0.02]">
                  <td colSpan={6} className="px-6 py-4">
                    <span className="text-[9px] font-black text-primary-color uppercase tracking-[0.3em] italic">
                      {category.title}
                    </span>
                  </td>
                </tr>
                {category.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.02] group`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-black text-white mb-0.5 tracking-tight">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <FaInfoCircle className="text-[10px] text-gray-700" />
                        <span className="text-[11px] font-medium text-gray-500">{row.detail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {renderValue(row.free)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {renderValue(row.starter)}
                    </td>
                    <td className="px-6 py-5 text-center bg-primary-color/[0.02] border-x border-primary-color/10">
                      {renderValue(row.pro)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {renderValue(row.business)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-6 rounded-3xl bg-primary-color/5 border border-primary-color/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-gray-400 font-medium italic">
          * Los costos en créditos se descuentan de tu saldo mensual automáticamente al generar el recurso. una imagen generada o editada consume diez créditos.
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500/20 flex items-center justify-center">
              <FaCheck className="text-emerald-500 text-[8px]" />
            </div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Incluido</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-primary-color uppercase tracking-widest italic">Cr = Créditos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingComparisonTable;
