import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBolt, FaLock, FaMicrochip, FaPalette, FaCube, FaArrowRight, FaGem, FaUserGraduate, FaCoins, FaMoneyBillWave, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

const MentorLanding: React.FC = () => {
  return (
    <div className="mentor-presentation">
      {/* Slide 1: Portada */}
      <section className="slide-container flex flex-col items-center justify-center text-center px-6">
        <div className="header-logo mb-12 flex items-center gap-3">
          <div className="dot"></div> DROP<span>APP</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-8">
          Escala tu Impacto <br />con <span className="text-primary-color italic">Creativos IA</span>
        </h1>
        <p className="text-xl md:text-3xl text-gray-400 font-medium max-w-3xl mx-auto leading-relaxed">
          La infraestructura visual definitiva para mentores de Ecommerce.
        </p>
        <div className="mt-16 animate-bounce text-primary-color opacity-50">
          <FaArrowRight className="text-3xl rotate-90" />
        </div>
      </section>

      {/* Slide 2: El Problema de la Saturación */}
      <section className="slide-container px-6 py-20">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="header-logo mb-20">
            <div className="dot"></div> DROP<span>APP</span>
          </div>
          <h2 className="slide-title text-4xl md:text-6xl font-black tracking-tighter mb-16 italic">
            El fin de las imágenes <span className="text-primary-color not-italic">genéricas</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center flex-1">
            <div className="space-y-12">
              <div className="feature-item flex gap-6 group">
                <div className="feature-icon w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 group-hover:scale-110 transition-transform">
                  <FaBolt className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Fatiga Visual en Ads</h3>
                  <p className="text-lg text-gray-400 font-medium">Las mismas fotos de AliExpress matan la conversión de tus alumnos.</p>
                </div>
              </div>
              <div className="feature-item flex gap-6 group">
                <div className="feature-icon w-16 h-16 rounded-2xl bg-primary-color/10 border border-primary-color/20 flex items-center justify-center text-primary-color shrink-0 group-hover:scale-110 transition-transform">
                  <FaLock className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Evita Bloqueos</h3>
                  <p className="text-lg text-gray-400 font-medium">Contenido 100% original que protege el Business Manager.</p>
                </div>
              </div>
            </div>
            <div className="visual-frame relative h-[300px] md:h-full min-h-[400px] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/mentor_slide_2.png"
                alt="Tecnología IA"
                layout="fill"
                objectFit="cover"
                className="opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 3: Imagen 3 Pro */}
      <section className="slide-container px-6 py-20">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="header-logo mb-20 text-right">
            <div className="dot ml-auto"></div> DROP<span>APP</span>
          </div>
          <h2 className="slide-title text-4xl md:text-6xl font-black tracking-tighter mb-16 italic text-right">
            Imagen 3 Pro: <span className="text-emerald-400 not-italic">Estudio Fotográfico</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center flex-1">
            <div className="visual-frame relative h-[300px] md:h-full min-h-[400px] rounded-[3rem] overflow-hidden border border-emerald-500/20 shadow-2xl md:order-1">
              <Image
                src="/mentor_slide_3.png"
                alt="Producto Premium"
                layout="fill"
                objectFit="cover"
                className="opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>
            <div className="md:order-2">
              <p className="text-2xl text-gray-400 font-medium mb-12">Genera visuales de producto que elevan la percepción de marca al instante.</p>
              <div className="accent-card p-10 bg-emerald-500/5 border-t-2 border-emerald-500 rounded-3xl">
                <ul className="space-y-8">
                  <li className="flex items-center gap-4 text-xl font-black text-white">
                    <FaMicrochip className="text-emerald-400 text-2xl shrink-0" /> Calidad de estudio fotográfico.
                  </li>
                  <li className="flex items-center gap-4 text-xl font-black text-white">
                    <FaPalette className="text-emerald-400 text-2xl shrink-0" /> Adaptación a cualquier nicho.
                  </li>
                  <li className="flex items-center gap-4 text-xl font-black text-white">
                    <FaCube className="text-emerald-400 text-2xl shrink-0" /> Contenido único para testeo masivo.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 4: Veo 3.1 Fast */}
      <section className="slide-container px-6 py-20 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="header-logo mb-20">
            <div className="dot"></div> DROP<span>APP</span>
          </div>
          <h2 className="slide-title text-4xl md:text-6xl font-black tracking-tighter mb-16 italic">
            Veo 3.1 Fast: <span className="text-purple-400 not-italic">Video Ads 8s</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center flex-1">
            <div>
              <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">Agilidad de Escala</h3>
              <p className="text-xl text-gray-400 font-medium mb-10 leading-relaxed">
                Convierte textos en videos publicitarios optimizados para TikTok y Reels de forma instantánea.
              </p>
              <div className="accent-card p-10 bg-purple-500/5 border-l-8 border-purple-500 rounded-3xl">
                <p className="text-xl text-white font-italic leading-relaxed italic">
                  "En Dropshipping, la velocidad para producir nuevos creativos es el único foso competitivo real."
                </p>
              </div>
            </div>
            <div className="visual-frame relative h-[300px] md:h-full min-h-[400px] rounded-[3rem] overflow-hidden border border-purple-500/20 shadow-2xl">
              <Image
                src="/mentor_slide_4.png"
                alt="Ondas Tecnológicas"
                layout="fill"
                objectFit="cover"
                className="opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Slide: Herramientas de Control */}
      <section className="slide-container px-6 py-20">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="header-logo mb-20 text-right">
            <div className="dot ml-auto"></div> DROP<span>APP</span>
          </div>
          <h2 className="slide-title text-4xl md:text-6xl font-black tracking-tighter mb-16 italic text-right">
            Control & <span className="text-primary-color not-italic">Decisión</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center flex-1">
            <div className="visual-frame relative h-[300px] md:h-full min-h-[400px] rounded-[3rem] overflow-hidden border border-primary-color/20 shadow-2xl md:order-1">
              <Image
                src="/mentor_slide_control.png"
                alt="Control Dashboard"
                layout="fill"
                objectFit="cover"
                className="opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>
            <div className="md:order-2 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.05] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary-color/10 flex items-center justify-center text-primary-color mb-4">
                    <FaCoins />
                  </div>
                  <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">Rentabilidad</h4>
                  <p className="text-gray-500 text-xs">Auditoría automática de tus finanzas.</p>
                </div>
                <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.05] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-4">
                    <FaBolt />
                  </div>
                  <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">Logística</h4>
                  <p className="text-gray-500 text-xs">Trackeo inteligente de envíos.</p>
                </div>
                <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.05] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                    <FaInfoCircle />
                  </div>
                  <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">Calculadora</h4>
                  <p className="text-gray-500 text-xs">Márgenes precisos en un clic.</p>
                </div>
                <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.05] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                    <FaMicrochip />
                  </div>
                  <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">Agentes AI</h4>
                  <p className="text-gray-500 text-xs">Expertos 24/7 a tu mando.</p>
                </div>
              </div>
              <p className="text-xl text-gray-400 font-medium leading-relaxed">
                Mucho más que una IA creativa. Entregamos las herramientas de gestión que tus alumnos necesitan para sobrevivir y prosperar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 5: Planes DropApp */}
      <section className="slide-container px-6 py-20">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="header-logo mb-20 justify-center text-center mx-auto">
            <div className="dot mx-auto"></div> DROP<span>APP</span>
          </div>
          <h2 className="slide-title text-4xl md:text-6xl font-black tracking-tighter mb-16 italic text-center">
            Planes para tu <span className="text-primary-color not-italic">Comunidad</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
            <div className="plan-box p-12 bg-white/[0.03] border border-white/10 rounded-[3rem] text-center flex flex-col justify-between hover:scale-105 transition-transform">
              <div>
                <h3 className="text-2xl font-black text-gray-400 mb-6 tracking-widest uppercase">Starter</h3>
                <div className="text-5xl font-black text-white mb-4">$19<span className="text-xl text-gray-500">/mes</span></div>
                <p className="text-xl font-black text-primary-color mb-8 uppercase tracking-widest">500 Créditos</p>
                <p className="text-gray-400 font-medium">Ideal para validar sus primeros productos.</p>
              </div>
            </div>
            <div className="plan-box p-12 bg-primary-color/[0.05] border-2 border-primary-color rounded-[3rem] text-center flex flex-col justify-between relative transform scale-110 z-10 shadow-2xl shadow-primary-color/10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-primary-color text-black text-[10px] font-black uppercase tracking-widest rounded-full">Más Elegido</div>
              <div>
                <h3 className="text-2xl font-black text-primary-color mb-6 tracking-widest uppercase">Pro</h3>
                <div className="text-5xl font-black text-white mb-4">$39<span className="text-xl text-gray-500">/mes</span></div>
                <p className="text-xl font-black text-primary-color mb-8 uppercase tracking-widest">1,200 Créditos</p>
                <p className="text-gray-400 font-medium">Para escalamiento real en pauta activa.</p>
              </div>
            </div>
            <div className="plan-box p-12 bg-white/[0.03] border border-white/10 rounded-[3rem] text-center flex flex-col justify-between hover:scale-105 transition-transform">
              <div>
                <h3 className="text-2xl font-black text-gray-400 mb-6 tracking-widest uppercase">Business</h3>
                <div className="text-5xl font-black text-white mb-4">$79<span className="text-xl text-gray-500">/mes</span></div>
                <p className="text-xl font-black text-primary-color mb-8 uppercase tracking-widest">3,000 Créditos</p>
                <p className="text-gray-400 font-medium">Para agencias y Dropshippers pro.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 6: Modelo de Referidos */}
      <section className="slide-container px-6 py-20">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="header-logo mb-20">
            <div className="dot"></div> DROP<span>APP</span>
          </div>
          <h2 className="slide-title text-4xl md:text-6xl font-black tracking-tighter mb-16 italic">
            Estructura para <span className="text-primary-color not-italic">Mentores</span>
          </h2>
          <div className="mt-12 overflow-x-auto rounded-[2rem] border border-white/5 shadow-2xl custom-scrollbar">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-8 py-8 text-sm font-black text-gray-500 uppercase tracking-widest">Nivel</th>
                  <th className="px-8 py-8 text-sm font-black text-gray-500 uppercase tracking-widest">Alumnos Activos</th>
                  <th className="px-8 py-8 text-sm font-black text-gray-500 uppercase tracking-widest">Comisión</th>
                  <th className="px-8 py-8 text-sm font-black text-gray-500 uppercase tracking-widest">Incentivos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-black/40">
                <tr className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-10">
                    <span className="px-4 py-2 rounded-xl bg-slate-400/10 border border-slate-400/20 text-slate-400 font-black text-sm tracking-widest uppercase flex items-center gap-2 w-fit">
                      <FaUserGraduate className="text-lg" /> SILVER
                    </span>
                  </td>
                  <td className="px-8 py-10 font-black text-3xl text-white tracking-tighter tabular-nums">1 - 20</td>
                  <td className="px-8 py-10">
                    <span className="text-4xl font-black text-primary-color tracking-tighter">15%</span>
                  </td>
                  <td className="px-8 py-10 font-bold text-gray-300">Suscripción Pro Gratis</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-10">
                    <span className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black text-sm tracking-widest uppercase flex items-center gap-2 w-fit">
                      <FaGem className="text-lg" /> GOLD
                    </span>
                  </td>
                  <td className="px-8 py-10 font-black text-3xl text-white tracking-tighter tabular-nums">21+</td>
                  <td className="px-8 py-10">
                    <span className="text-4xl font-black text-primary-color tracking-tighter">20%</span>
                  </td>
                  <td className="px-8 py-10 font-bold text-gray-300">Suscripción Business + VIP</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Slide 7: Ingreso Estimado */}
      <section className="slide-container px-6 py-20">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="header-logo mb-20 text-center mx-auto">
            <div className="dot mx-auto"></div> DROP<span>APP</span>
          </div>
          <h2 className="slide-title text-4xl md:text-6xl font-black tracking-tighter mb-16 italic text-center">
            Tu Potencial de <span className="text-primary-color not-italic">Ingreso</span>
          </h2>
          <div className="max-w-4xl mx-auto w-full space-y-8 mt-12 bg-white/[0.02] p-12 rounded-[3rem] border border-white/5">
            <div className="revenue-row">
              <div className="flex justify-between font-black uppercase tracking-widest mb-4">
                <span className="text-gray-500">10 Alumnos (Silver)</span>
                <span className="text-white">$230,000 COP/mes</span>
              </div>
              <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary-color/30 w-[25%] flex items-center px-4 text-[8px] font-black uppercase text-primary-color">Base</div>
              </div>
            </div>
            <div className="revenue-row">
              <div className="flex justify-between font-black uppercase tracking-widest mb-4">
                <span className="text-gray-500">50 Alumnos (Gold)</span>
                <span className="text-white">$1,500,000 COP/mes</span>
              </div>
              <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary-color/60 w-[60%] flex items-center px-4 text-[8px] font-black uppercase text-white">Escala</div>
              </div>
            </div>
            <div className="revenue-row">
              <div className="flex justify-between font-black uppercase tracking-widest mb-4">
                <span className="text-gray-500">100 Alumnos (Gold)</span>
                <span className="text-white">$3,100,000 COP/mes</span>
              </div>
              <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary-color w-full flex items-center px-4 text-[8px] font-black uppercase text-black">Libertad Financiera</div>
              </div>
            </div>
            <p className="text-center text-xs font-bold text-gray-500 mt-12 uppercase tracking-widest italic">
              *Calculado sobre Plan Pro ($39 USD). Comisiones recurrentes.
            </p>
          </div>
        </div>
      </section>

      {/* Slide 8: Cierre */}
      <section className="slide-container flex flex-col items-center justify-center text-center px-6">
        <div className="header-logo mb-16 flex items-center gap-3">
          <div className="dot"></div> DROP<span>APP</span>
        </div>
        <h2 className="text-6xl md:text-9xl font-black tracking-tighter italic leading-none mb-12">
          ¿Hacemos <br /><span className="text-primary-color not-italic underline decoration-white/10 underline-offset-8">Alianza?</span>
        </h2>
        <p className="text-xl md:text-3xl text-gray-400 font-medium mb-16 max-w-2xl mx-auto">
          Impulsa el éxito de tus alumnos con la mejor IA del mercado.
        </p>
        <Link href="/auth/register" className="group relative px-12 py-6 bg-primary-color text-black rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-[0_0_60px_rgba(18,216,250,0.3)] hover:scale-110 transition-all">
          EMPEZAR AHORA
          <div className="absolute inset-0 rounded-[2rem] border-2 border-white/20 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all"></div>
        </Link>
      </section>

      <style jsx>{`
                .mentor-presentation {
                    background-color: #050608;
                    color: white;
                    scroll-snap-type: y mandatory;
                    height: 100vh;
                    overflow-y: auto;
                    scroll-behavior: smooth;
                }
                .slide-container {
                    min-height: 100vh;
                    scroll-snap-align: start;
                    position: relative;
                    overflow: hidden;
                }
                .header-logo {
                    font-size: 28px;
                    font-weight: 900;
                    letter-spacing: -2px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .header-logo .dot {
                    width: 14px;
                    height: 14px;
                    background-color: var(--primary-color);
                    border-radius: 50%;
                    box-shadow: 0 0 15px var(--primary-color);
                }
                .header-logo span {
                    color: var(--primary-color);
                }
                .slide-title span {
                    color: var(--primary-color);
                }
                /* Hide scrollbar for Chrome, Safari and Opera */
                .mentor-presentation::-webkit-scrollbar {
                    display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                .mentor-presentation {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
    </div>
  );
};

export default MentorLanding;
