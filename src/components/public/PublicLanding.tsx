import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaRocket, FaMagic, FaFilm, FaComments, FaArrowRight, FaCheckCircle, FaChartLine, FaRobot } from 'react-icons/fa';

const PublicLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050608] text-white selection:bg-primary-color/30 overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[50%] h-[30%] bg-emerald-600/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center shadow-lg">
              <Image src="/droplab.png" alt="DROPAPP" width={24} height={24} className="object-cover" />
            </div>
            <span className="text-xl font-black tracking-tighter">DROPAPP</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link href="/auth/login" className="btn-premium py-2 px-6 text-xs font-black uppercase tracking-wider bg-primary-color text-white rounded-xl shadow-lg shadow-primary-color/20 hover:scale-105 transition-all">
              Pruébalo Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-color/10 border border-primary-color/20 text-primary-color text-[10px] font-black uppercase tracking-widest mb-8 animate-fade-in">
            <FaRobot className="animate-pulse" /> IA Generativa para E-commerce
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-8 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent italic">
            Tu Negocio en <br />
            <span className="text-primary-color not-italic">Piloto Automático</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            Crea Landings de alta conversión, creatividades publicitarias y videos virales en segundos con el poder de la Inteligencia Artificial más avanzada.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/auth/login" className="w-full md:w-auto px-8 py-4 bg-primary-color text-white rounded-2xl font-black text-sm tracking-wide shadow-2xl shadow-primary-color/30 hover:scale-105 transition-all flex items-center justify-center gap-3 border border-white/10">
              INICIAR AHORA <FaArrowRight />
            </Link>
            <Link href="#features" className="w-full md:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-sm tracking-wide transition-all border border-white/5 flex items-center justify-center gap-3 backdrop-blur-sm">
              VER FUNCIONES
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full"></div>
        </div>
      </section>

      {/* Features Preview */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 italic">Herramientas de <span className="text-emerald-400 not-italic">Élite</span></h2>
            <p className="text-gray-500 font-medium italic">Diseñado para vender más con menos esfuerzo.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Landing PRO */}
            <div className="premium-card p-8 group hover:border-emerald-500/30 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaRocket className="text-2xl text-emerald-400" />
              </div>
              <h3 className="text-xl font-black mb-3">Landing PRO</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">Genera páginas de aterrizaje optimizadas psicológicamente para la conversión inmediata.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-emerald-500" /> Copywriting Persuasivo</li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-emerald-500" /> Diseño Responsive IA</li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-emerald-500" /> Carga Ultra Rápida</li>
              </ul>
            </div>

            {/* Agente PRO */}
            <div className="premium-card p-8 group hover:border-blue-500/30 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaMagic className="text-2xl text-blue-400" />
              </div>
              <h3 className="text-xl font-black mb-3">Agente PRO</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">Banners, catálogos y creatividades publicitarias que detienen el scroll.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-blue-500" /> Calidad Studio 2K</li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-blue-500" /> Remoción de Fondo IA</li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-blue-500" /> Variantes para Ads</li>
              </ul>
            </div>

            {/* Video PRO */}
            <div className="premium-card p-8 group hover:border-purple-500/30 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaFilm className="text-2xl text-purple-400" />
              </div>
              <h3 className="text-xl font-black mb-3">Video PRO</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">Videos cortos para redes sociales con ganchos virales generados automáticamente.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-purple-500" /> Ganchos de Atención</li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-purple-500" /> Formato Social Vertical</li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-purple-500" /> Edición con un Click</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Efficiency Section */}
      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl font-black tracking-tighter mb-6 italic">Control Total y <br /> <span className="text-primary-color not-italic">Rentabilidad Real</span></h2>
            <p className="text-gray-400 font-medium mb-8 leading-relaxed">
              No solo creamos contenido, te ayudamos a tomar decisiones. Analiza tu rentabilidad, calcula tus márgenes y optimiza tus flujos de trabajo con agentes inteligentes que saben de negocios.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-bold text-white">90%</span>
                <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Más Rápido</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-bold text-white">5x</span>
                <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Más Conversión</span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="relative z-10 p-4 bg-[#0A0C10] border border-white/10 rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500 overflow-hidden group">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">DROPAPP_DASHBOARD</span>
              </div>
              <div className="space-y-3">
                <div className="h-20 w-full bg-white/5 rounded-xl flex items-center px-4 gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-color/20 border border-primary-color/30 flex items-center justify-center">
                    <FaComments className="text-primary-color" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 w-24 bg-white/20 rounded"></div>
                    <div className="h-1.5 w-full bg-white/10 rounded"></div>
                  </div>
                </div>
                <div className="h-20 w-full bg-white/5 rounded-xl flex items-center px-4 gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <FaChartLine className="text-emerald-500" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 w-32 bg-white/20 rounded"></div>
                    <div className="h-1.5 w-full bg-white/10 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Fake Shadow Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-color/20 blur-[80px] rounded-full pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 italic">Elige tu <span className="text-primary-color not-italic">Plan de Vuelo</span></h2>
            <p className="text-gray-500 font-medium italic">Escala desde cero hasta la dominación total del mercado.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            {/* Free Plan */}
            <div className="premium-card p-6 group hover:border-white/20 transition-all flex flex-col h-fit">
              <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Personal / Tester</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$0</span>
                  <span className="text-gray-500 font-bold text-xs">/mes</span>
                </div>
              </div>

              <ul className="space-y-2 mb-8 flex-1">
                <li className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                  <FaCheckCircle className="text-emerald-500 shrink-0" /> Agentes de Chat
                </li>
                <li className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                  <FaCheckCircle className="text-emerald-500 shrink-0" /> Calculadora
                </li>
                <li className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                  <FaCheckCircle className="text-emerald-500 shrink-0" /> Configuración Básica
                </li>
              </ul>

              <Link href="/auth/login" className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-[9px] tracking-widest uppercase transition-all text-center border border-white/5">
                Empezar Gratis
              </Link>
            </div>

            {/* Starter Plan */}
            <div className="premium-card p-6 group hover:border-white/20 transition-all flex flex-col h-fit">
              <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Pyme / Starter</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$19</span>
                  <span className="text-gray-500 font-bold text-xs">/mes</span>
                </div>
              </div>

              <ul className="space-y-2 mb-8 flex-1">
                <li className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                  <FaCheckCircle className="text-emerald-500 shrink-0" /> Todo lo de FREE
                </li>
                <li className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                  <FaCheckCircle className="text-emerald-500 shrink-0" /> Módulo de Logística
                </li>
                <li className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                  <FaCheckCircle className="text-emerald-500 shrink-0" /> Análisis de Datos
                </li>
              </ul>

              <Link href="/auth/login" className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-[9px] tracking-widest uppercase transition-all text-center border border-white/5">
                Seleccionar Plan
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="premium-card p-6 border-primary-color/30 bg-primary-color/5 group hover:border-primary-color/50 transition-all flex flex-col h-fit relative scale-105 shadow-2xl shadow-primary-color/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-color text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                MÁS POPULAR
              </div>

              <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-color mb-2 block">Escalación / PRO</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$39</span>
                  <span className="text-gray-500 font-bold text-xs">/mes</span>
                </div>
              </div>

              <ul className="space-y-2 mb-8 flex-1">
                <li className="flex items-center gap-2 text-[11px] font-bold text-gray-200">
                  <FaCheckCircle className="text-primary-color shrink-0" /> Todo lo de Starter
                </li>
                <li className="flex items-center gap-2 text-[11px] font-bold text-gray-200">
                  <FaCheckCircle className="text-primary-color shrink-0" /> Landings PRO Ilimitadas
                </li>
                <li className="flex items-center gap-2 text-[11px] font-bold text-gray-200">
                  <FaCheckCircle className="text-primary-color shrink-0" /> Agente PRO (Imágenes 2K)
                </li>
                <li className="flex items-center gap-2 text-[11px] font-bold text-gray-200">
                  <FaCheckCircle className="text-primary-color shrink-0" /> Master Chat con RAG
                </li>
              </ul>

              <Link href="/auth/login" className="w-full py-3 bg-primary-color text-white rounded-xl font-black text-[9px] tracking-widest uppercase shadow-xl shadow-primary-color/20 hover:scale-105 transition-all text-center">
                Elegir PRO
              </Link>
            </div>

            {/* Business Plan */}
            <div className="premium-card p-6 group hover:border-purple-500/20 transition-all flex flex-col h-fit">
              <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2 block">Dominación / Business</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$79</span>
                  <span className="text-gray-500 font-bold text-xs">/mes</span>
                </div>
              </div>

              <ul className="space-y-2 mb-8 flex-1">
                <li className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                  <FaCheckCircle className="text-purple-500 shrink-0" /> Todo lo de PRO
                </li>
                <li className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                  <FaCheckCircle className="text-purple-500 shrink-0" /> Video PRO Generativo
                </li>
                <li className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                  <FaCheckCircle className="text-purple-500 shrink-0" /> Soporte Prioritario
                </li>
              </ul>

              <Link href="/auth/login" className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-[9px] tracking-widest uppercase transition-all text-center border border-white/5">
                Seleccionar Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / CTA Section */}
      <footer className="py-32 px-6 relative overflow-hidden text-center">
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter italic">¿Listo para <span className="text-primary-color not-italic">Escalar?</span></h2>
          <p className="text-gray-400 font-medium mb-12">Unete a cientos de emprendedores que ya están usando DROPAPP para dominar sus mercados.</p>

          <Link href="/auth/login" className="inline-flex px-10 py-5 bg-gradient-to-r from-primary-color to-blue-600 text-white rounded-2xl font-black text-lg tracking-wide shadow-2xl shadow-primary-color/40 hover:scale-110 transition-all border border-white/20 items-center gap-3">
            EMPEZAR GRATIS <FaArrowRight />
          </Link>

          <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 p-1.5 flex items-center justify-center">
                <Image src="/droplab.png" alt="DROPAPP" width={16} height={16} className="object-cover" />
              </div>
              <span className="text-sm font-black tracking-tighter">DROPAPP &copy; 2025</span>
            </div>
            <div className="flex gap-8">
              <Link href="#" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Términos</Link>
              <Link href="#" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Privacidad</Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn 1s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .btn-premium {
                    position: relative;
                    overflow: hidden;
                }
                .btn-premium::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                    transform: rotate(45deg);
                    animation: shine 3s infinite;
                }
                @keyframes shine {
                    0% { left: -150%; }
                    100% { left: 150%; }
                }
            `}</style>
    </div>
  );
};

export default PublicLanding;
