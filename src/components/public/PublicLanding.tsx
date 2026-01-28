import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaRocket, FaMagic, FaFilm, FaComments, FaArrowRight, FaCheckCircle, FaChartLine, FaRobot, FaPlayCircle, FaFileExcel, FaFacebook, FaInstagram, FaYoutube, FaDiscord, FaEnvelope } from 'react-icons/fa';
import PlanPricing from '../profile/PlanPricing';
import AdsCarousel from '../v2/Dashboard/AdsCarousel';
import PhoneMockup from '../v2/Canvas/PhoneMockup';
import { LandingGenerationState } from '../../types/image-pro';
import { SHOWCASE_ADS, SHOWCASE_LANDING_SECTIONS } from '../../config/v2-showcase';

const PublicLanding: React.FC = () => {
  const [adReferences] = React.useState<any[]>(SHOWCASE_ADS);
  const [landingState] = React.useState<LandingGenerationState>(() => {
    const gens: Record<string, any> = {};
    const sections: any[] = [];

    [...SHOWCASE_LANDING_SECTIONS]
      .sort(() => Math.random() - 0.5)
      .forEach(s => {
        sections.push({
          sectionId: s.sectionId,
          title: s.title,
          reasoning: "Diseño optimizado para conversión."
        });
        gens[s.sectionId] = {
          status: 'completed',
          imageUrl: s.imageUrl,
          copy: { headline: s.headline, body: s.body }
        };
      });

    return {
      phase: 'landing',
      proposedStructure: { sections },
      selectedSectionId: null,
      selectedReferenceUrl: null,
      generations: gens,
      adGenerations: {},
      adConcepts: []
    };
  });

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
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center shadow-lg">
              <Image src="/droplab.png" alt="DROPAPP" width={24} height={24} className="object-cover" />
            </div>
            <span className="text-xl font-black tracking-tighter hidden sm:block">DROPAPP</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/auth/login" className="text-xs sm:text-sm font-bold text-gray-400 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link href="/auth/register" className="btn-premium py-2 px-3 sm:px-6 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-primary-color text-white rounded-xl shadow-lg shadow-primary-color/20 hover:scale-105 transition-all">
              Pruébalo Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-10 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-color/10 border border-primary-color/20 text-primary-color text-[10px] font-black uppercase tracking-widest mb-8 animate-fade-in">
            <FaRobot className="animate-pulse" /> IA Generativa & Control de Negocios
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-8 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent italic text-center">
            Crea como un genio. <br />
            <span className="text-primary-color not-italic">Controla como un experto.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 font-medium max-w-3xl mx-auto mb-12 leading-relaxed text-center">
            Domina el E-commerce con la suite más potente de IA. Desde creatividades virales hasta auditorías de rentabilidad en segundos.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/auth/register" className="w-full md:w-auto px-10 py-5 bg-primary-color text-white rounded-2xl font-black text-sm tracking-wide shadow-[0_0_40px_rgba(18,216,250,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-3 border border-white/10">
              INICIAR AHORA <FaArrowRight />
            </Link>
            <Link href="#features" className="w-full md:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-sm tracking-wide transition-all border border-white/5 flex items-center justify-center gap-3 backdrop-blur-sm">
              VER CAPACIDADES
            </Link>
          </div>

          {/* Dynamic Ads Showcase Preview */}
          <div className="w-full max-w-7xl mx-auto relative group">
            <div className="relative z-10 p-0 md:p-0 bg-transparent rounded-[2.5rem] overflow-hidden transition-all duration-700">
              <AdsCarousel customAds={adReferences} minimal={true} />
            </div>

            {/* Ambient Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-color/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-primary-color/10 transition-all"></div>
          </div>
        </div>
      </section>

      {/* New Section 1: Landing Showcase (Zig-Zag) */}
      <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-16 lg:gap-24">
          <div className="order-2 lg:order-1 lg:pr-12">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent italic">
              Landings que <br />
              <span className="text-primary-color not-italic">venden solas.</span>
            </h2>
            <p className="text-lg text-gray-400 font-medium mb-10 leading-relaxed max-w-xl">
              Nuestra IA no solo diseña, aplica psicología de ventas y estructuras de alta conversión para que tu único problema sea gestionar los pedidos.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-primary-color/10 flex items-center justify-center text-primary-color font-black italic">H</div>
                <span className="text-sm font-bold text-gray-300">Héroes impactantes que disparan el CTR.</span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-primary-color/10 flex items-center justify-center text-primary-color font-black italic">P</div>
                <span className="text-sm font-bold text-gray-300">Prueba social y beneficios ubicados estratégicamente.</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center relative group">
            <div className="relative z-10 transition-transform duration-700 -rotate-3 group-hover:rotate-0 group-hover:scale-105">
              <PhoneMockup landingState={landingState} />
            </div>
            {/* Decorative Background for Mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary-color/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-primary-color/15"></div>
          </div>
        </div>
      </section>

      {/* New Section 2: Video Showcase (Zig-Zag Reversed) */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-16 lg:gap-24">
          <div className="flex justify-center relative group">
            <div className="relative z-10 transition-transform duration-700 rotate-3 group-hover:rotate-0 group-hover:scale-105">
              {/* Video mockup con YouTube Reel real */}
              <div className="w-[300px] h-[600px] bg-black rounded-[50px] p-2 border-[6px] border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-30 border-x border-b border-white/5"></div>
                <div className="w-full h-full bg-[#0a0a0a] rounded-[36px] overflow-hidden relative">
                  <iframe
                    src="https://www.youtube.com/embed/qe7MetYHIPk?autoplay=1&mute=1&loop=1&playlist=qe7MetYHIPk&controls=0&modestbranding=1"
                    title="YouTube video player"
                    className="w-full h-full border-0 scale-[1.05]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  {/* Overlay sutil para integrarlo mejor */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-purple-600/20"></div>
          </div>

          <div className="lg:pl-12">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent italic">
              Videos que <br />
              <span className="text-purple-500 not-italic">detienen el scroll.</span>
            </h2>
            <p className="text-lg text-gray-400 font-medium mb-10 leading-relaxed max-w-xl">
              Olvídate de editar por horas. Nuestra IA genera ganchos visuales y narrativos diseñados para retener la atención en TikTok, Reels e Instagram.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all text-center">
                <span className="text-3xl font-black text-purple-400 mb-2 block tracking-tighter">80%</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mayor Retención</span>
              </div>
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all text-center">
                <span className="text-3xl font-black text-purple-400 mb-2 block tracking-tighter">10x</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Más Rápido</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 italic">Herramientas de <span className="text-emerald-400 not-italic">Élite</span></h2>
            <p className="text-gray-500 font-medium italic">Diseñado para vender más con menos esfuerzo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Landing PRO */}
            <div className="premium-card p-8 group hover:border-emerald-500/30 transition-all duration-500 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05]">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <FaRocket className="text-2xl text-emerald-400" />
              </div>
              <h3 className="text-xl font-black mb-3">Landing PRO</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">Genera páginas de aterrizaje optimizadas psicológicamente para la conversión inmediata.</p>

              {/* Preview Container Real Integration */}
              <div className="h-48 w-full bg-white/5 rounded-xl mb-6 relative overflow-hidden group-hover:border-emerald-500/20 border border-transparent transition-all shadow-inner">
                <Image
                  src="/landing-preview.png"
                  alt="Landing PRO Preview"
                  layout="fill"
                  objectFit="cover"
                  className="opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-emerald-500" /> Copywriting Persuasivo</li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-emerald-500" /> Diseño Responsive IA</li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-emerald-500" /> Carga Ultra Rápida</li>
              </ul>

              <Link href="/auth/register" className="inline-flex items-center gap-2 text-sm font-black text-emerald-400 group/link">
                CREAR LANDING <FaArrowRight className="text-xs group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Imagen PRO */}
            <div className="premium-card p-8 group hover:border-blue-500/30 transition-all duration-500 bg-blue-500/[0.02] hover:bg-blue-500/[0.05]">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                <FaMagic className="text-2xl text-blue-400" />
              </div>
              <h3 className="text-xl font-black mb-3">Imagen PRO</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">Banners, catálogos y creatividades publicitarias que detienen el scroll.</p>

              {/* Preview Container Real Integration (Yerba Magic Result) */}
              <div className="h-48 w-full bg-white/5 rounded-xl mb-6 relative overflow-hidden group-hover:border-blue-500/20 border border-transparent transition-all shadow-inner">
                <Image
                  src="/imagen-pro-result.png"
                  alt="Imagen PRO Real Result"
                  layout="fill"
                  objectFit="cover"
                  className="opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-blue-500" /> Calidad Studio 2K</li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-blue-500" /> Remoción de Fondo IA</li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-blue-500" /> Variantes para Ads</li>
              </ul>

              <Link href="/auth/register" className="inline-flex items-center gap-2 text-sm font-black text-blue-400 group/link">
                CREAR IMÁGENES <FaArrowRight className="text-xs group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Video PRO */}
            <div className="premium-card p-8 group hover:border-purple-500/30 transition-all duration-500 bg-purple-500/[0.02] hover:bg-purple-500/[0.05]">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                <FaFilm className="text-2xl text-purple-400" />
              </div>
              <h3 className="text-xl font-black mb-3">Video PRO</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">Videos cortos para redes sociales con ganchos virales generados automáticamente.</p>

              {/* Preview Container Real Integration (Video Panel) */}
              <div className="h-48 w-full bg-white/5 rounded-xl mb-6 relative overflow-hidden group-hover:border-purple-500/20 border border-transparent transition-all shadow-inner">
                <Image
                  src="/video-pro-panel.png"
                  alt="Video PRO Panel"
                  layout="fill"
                  objectFit="cover"
                  className="opacity-60 group-hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaPlayCircle className="text-3xl text-white/40 group-hover:text-purple-500/60 transition-colors bg-black/20 rounded-full p-2 backdrop-blur-sm" />
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-purple-500" /> Ganchos de Atención</li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-purple-500" /> Formato Social Vertical</li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><FaCheckCircle className="text-purple-500" /> Edición con un Click</li>
              </ul>

              <Link href="/auth/register" className="inline-flex items-center gap-2 text-sm font-black text-purple-400 group/link">
                CREAR VIDEO AD <FaArrowRight className="text-xs group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Agentes Especializados */}
            <div className="premium-card p-8 group hover:border-blue-400/30 transition-all duration-500 bg-blue-400/[0.02] hover:bg-blue-400/[0.05]">
              <div className="w-14 h-14 rounded-2xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                <FaComments className="text-2xl text-blue-300" />
              </div>
              <h3 className="text-xl font-black mb-3">Agentes Especializados</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">Chatea con IAs expertas en ventas o crea tus propios agentes personalizados para tu nicho.</p>

              {/* Preview Container Real Integration (Agents Chat) */}
              <div className="h-48 w-full bg-white/5 rounded-xl mb-6 relative overflow-hidden group-hover:border-blue-400/20 border border-transparent transition-all shadow-inner">
                <Image
                  src="/agents-pro.png"
                  alt="Agentes PRO Chat"
                  layout="fill"
                  objectFit="cover"
                  className="opacity-60 group-hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300">
                  <FaCheckCircle className="text-blue-400" /> Chat con IA de Ventas
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300">
                  <FaCheckCircle className="text-blue-400" /> Creación de Agentes Propios
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-300">
                  <FaCheckCircle className="text-blue-400" /> Entrenamiento con tus Datos
                </li>
              </ul>

              <Link href="/auth/register" className="inline-flex items-center gap-2 text-sm font-black text-blue-400 group/link">
                CONFIGURAR AGENTE <FaArrowRight className="text-xs group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Efficiency Section */}
      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 italic">Control Total y <br /> <span className="text-primary-color not-italic">Rentabilidad Real</span></h2>
            <p className="text-gray-400 font-medium mb-8 leading-relaxed">
              No solo creamos contenido, auditamos tu éxito. Sube tu Excel y deja que la IA te diga exactamente dónde estás perdiendo dinero por fletes y devoluciones.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm font-bold text-white/80">
                <FaCheckCircle className="text-primary-color" /> Auditoría de fletes automática
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-white/80">
                <FaCheckCircle className="text-primary-color" /> Cálculo de Punto de Equilibrio real
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-white/80">
                <FaCheckCircle className="text-primary-color" /> Detección de fugas de dinero
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-bold text-white">10s</span>
                <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Análisis Total</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-bold text-white">ROI</span>
                <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Optimizado</span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative w-full">
            <div className="relative z-10 p-2 bg-white/[0.02] border border-white/10 rounded-3xl shadow-2xl md:rotate-3 hover:rotate-0 transition-all duration-500 overflow-hidden group">
              <div className="relative h-[250px] md:h-[400px] w-full rounded-2xl overflow-hidden">
                <Image
                  src="/profitability-audit.png"
                  alt="Control Total Preview"
                  layout="fill"
                  objectFit="cover"
                  className="opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
            {/* Fake Shadow Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-color/20 blur-[80px] rounded-full pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Hero Profitability CTA */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto rounded-[3rem] bg-gradient-to-r from-primary-color/10 to-blue-600/10 border border-white/10 p-12 text-center relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 italic">"Deja de trabajar para las <span className="text-primary-color not-italic">transportadoras."</span></h2>
          <p className="text-gray-400 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
            Sube tu reporte de ventas y descubre en 10 segundos si tu producto ganador realmente te deja ganancias o si las devoluciones se están llevando tu utilidad.
          </p>
          <Link href="/auth/register" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
            PROBAR AUDITORÍA GRATIS <FaFileExcel />
          </Link>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative overflow-visible">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 italic">Elige tu <span className="text-primary-color not-italic">Plan de Vuelo</span></h2>
            <p className="text-gray-500 font-medium italic">Escala desde cero hasta la dominación total del mercado.</p>
          </div>

          <PlanPricing isPublic={true} />
        </div>
      </section>

      {/* Footer / CTA Section */}
      <footer className="py-32 px-6 relative overflow-hidden text-center">
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter italic">¿Listo para <span className="text-primary-color not-italic">Escalar?</span></h2>
          <p className="text-gray-400 font-medium mb-12">Unete a cientos de emprendedores que ya están usando DROPAPP para dominar sus mercados.</p>

          <Link href="/auth/register" className="inline-flex px-10 py-5 bg-gradient-to-r from-primary-color to-blue-600 text-white rounded-2xl font-black text-lg tracking-wide shadow-2xl shadow-primary-color/40 hover:scale-110 transition-all border border-white/20 items-center gap-3">
            EMPEZAR GRATIS <FaArrowRight />
          </Link>

          <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 p-1.5 flex items-center justify-center">
                  <Image src="/droplab.png" alt="DROPAPP" width={16} height={16} className="object-cover" />
                </div>
                <span className="text-sm font-black tracking-tighter">DROPAPP &copy; 2026</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <a href="https://facebook.com/profile.php?id=61585562057390" target="_blank" rel="noopener noreferrer" className="text-xl text-gray-500 hover:text-white transition-all transform hover:scale-110">
                <FaFacebook />
              </a>
              <a href="https://instagram.com/dropapp.lat" target="_blank" rel="noopener noreferrer" className="text-xl text-gray-500 hover:text-white transition-all transform hover:scale-110">
                <FaInstagram />
              </a>
              <a href="https://youtube.com/@Dropapp-lat" target="_blank" rel="noopener noreferrer" className="text-xl text-gray-500 hover:text-white transition-all transform hover:scale-110">
                <FaYoutube />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-xl text-gray-500 hover:text-white transition-all transform hover:scale-110">
                <FaDiscord />
              </a>
            </div>

            <div className="flex gap-8">
              <Link href="/terms" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Términos</Link>
              <Link href="/privacy" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Privacidad</Link>
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
