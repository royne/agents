import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaShieldAlt, FaCoins, FaUserShield, FaCreditCard } from 'react-icons/fa';

const TermsLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050608] text-white selection:bg-primary-color/30 overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 p-1.5 flex items-center justify-center shadow-lg">
              <Image src="/droplab.png" alt="DROPAPP" width={16} height={16} className="object-cover" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase">DROPAPP</span>
          </Link>
          <Link href="/" className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <FaArrowLeft /> VOLVER AL HOME
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 italic">
              Términos y <span className="text-primary-color not-italic">Condiciones</span>
            </h1>
            <p className="text-gray-500 font-medium">Última actualización: 14 de enero de 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-12">
            <section>
              <h2 className="text-2xl font-black flex items-center gap-3 text-white uppercase tracking-wider">
                <FaShieldAlt className="text-primary-color" /> 1. Aceptación de los Términos
              </h2>
              <div className="mt-4 text-gray-400 leading-relaxed space-y-4">
                <p>Al acceder y utilizar DROPAPP, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestra plataforma ni sus servicios asociados.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black flex items-center gap-3 text-white uppercase tracking-wider">
                <FaCoins className="text-primary-color" /> 2. Sistema de Créditos y Uso de IA
              </h2>
              <div className="mt-4 text-gray-400 leading-relaxed space-y-4">
                <p>DROPAPP utiliza un sistema de créditos para el uso de sus herramientas de Inteligencia Artificial. Los créditos son la moneda interna de la plataforma para acceder a las siguientes capacidades:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Landing PRO:</strong> Cada generación de landing page o sección optimizada consume una cantidad específica de créditos.</li>
                  <li><strong>Imagen PRO:</strong> La generación de creatividades, banners y catálogos consume créditos por imagen generada.</li>
                  <li><strong>Video PRO:</strong> La creación de videos cortos para Ads sociales consume una cantidad mayor de créditos debido al procesamiento intensivo.</li>
                  <li><strong>Agentes Especializados:</strong> Las interacciones y el entrenamiento de agentes personalizados consumen créditos por consulta o proceso.</li>
                </ul>
                <p className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="text-primary-color font-bold">Importante:</span> Los créditos no son reembolsables y tienen una validez ligada a la duración de su suscripción activa.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black flex items-center gap-3 text-white uppercase tracking-wider">
                <FaCreditCard className="text-primary-color" /> 3. Planes de Suscripción
              </h2>
              <div className="mt-4 text-gray-400 leading-relaxed space-y-4">
                <p>Ofrecemos diferentes planes para adaptarnos a la escala de su negocio:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-white font-black uppercase text-sm mb-2">Plan Tester / Free</h3>
                    <p className="text-xs text-gray-500">Para probar las capacidades básicas. Limitado en créditos y acceso a módulos premium.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-white font-black uppercase text-sm mb-2">Plan Starter</h3>
                    <p className="text-xs text-gray-500">Diseñado para emprendedores que inician su camino en el E-commerce.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-white font-black uppercase text-sm mb-2">Plan Pro</h3>
                    <p className="text-xs text-gray-500">Nuestra suscripción más popular, con acceso completo a auditorías de rentabilidad y mayores créditos.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-white font-black uppercase text-sm mb-2">Plan Business</h3>
                    <p className="text-xs text-gray-500">Para operaciones a gran escala con soporte prioritario y máxima asignación de créditos.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black flex items-center gap-3 text-white uppercase tracking-wider">
                <FaUserShield className="text-primary-color" /> 4. Responsabilidad del Usuario
              </h2>
              <div className="mt-4 text-gray-400 leading-relaxed space-y-4">
                <p>Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. DROPAPP no se hace responsable por el uso indebido de las creatividades generadas ni por las decisiones de negocio tomadas basadas en los análisis de rentabilidad.</p>
                <p>El uso de la herramienta debe ser ético y legal, respetando los derechos de propiedad intelectual de terceros al subir contenido a la plataforma.</p>
              </div>
            </section>

            <section className="pt-12 border-t border-white/10">
              <p className="text-center text-gray-500 text-sm">
                Si tiene dudas sobre estos términos, contáctenos en <a href="mailto:dropapp.lat@gmail.com" className="text-primary-color hover:underline">dropapp.lat@gmail.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
            DROPAPP &copy; 2026 - Control Inteligente para E-commerce
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TermsLanding;
