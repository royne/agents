import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaLock, FaEye, FaDatabase, FaServer } from 'react-icons/fa';

const PrivacyLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050608] text-white selection:bg-primary-color/30 overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[30%] right-[-5%] w-[30%] h-[50%] bg-emerald-600/5 blur-[120px] rounded-full"></div>
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
              Política de <span className="text-emerald-400 not-italic">Privacidad</span>
            </h1>
            <p className="text-gray-500 font-medium">Última actualización: 14 de enero de 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-12">
            <section>
              <h2 className="text-2xl font-black flex items-center gap-3 text-white uppercase tracking-wider">
                <FaLock className="text-emerald-400" /> 1. Introducción
              </h2>
              <div className="mt-4 text-gray-400 leading-relaxed space-y-4">
                <p>En DROPAPP, valoramos su privacidad y estamos comprometidos a proteger sus datos personales. Esta política de privacidad explica cómo recopilamos, utilizamos y salvaguardamos su información cuando utiliza nuestra plataforma de inteligencia artificial aplicada al E-commerce.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black flex items-center gap-3 text-white uppercase tracking-wider">
                <FaEye className="text-emerald-400" /> 2. Información que Recopilamos
              </h2>
              <div className="mt-4 text-gray-400 leading-relaxed space-y-4">
                <p>Para proporcionar nuestros servicios, recopilamos la siguiente información:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Información de Registro:</strong> Nombre, dirección de correo electrónico y contraseña (encriptada).</li>
                  <li><strong>Datos de Uso:</strong> Información sobre cómo utiliza nuestras herramientas de IA, créditos consumidos y preferencias de diseño.</li>
                  <li><strong>Información de Pago:</strong> DROPAPP no almacena directamente sus datos de tarjeta. Utilizamos procesadores de pago seguros que cumplen con los estándares PCI-DSS.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black flex items-center gap-3 text-white uppercase tracking-wider">
                <FaDatabase className="text-emerald-400" /> 3. Uso de la Información
              </h2>
              <div className="mt-4 text-gray-400 leading-relaxed space-y-4">
                <p>Utilizamos sus datos para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Gestionar su cuenta y proporcionar acceso a las herramientas.</li>
                  <li>Personalizar su experiencia y mejorar nuestros modelos de IA.</li>
                  <li>Enviar notificaciones importantes sobre su cuenta y actualizaciones del servicio.</li>
                  <li>Analizar el rendimiento de la plataforma y detectar posibles fraudes.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black flex items-center gap-3 text-white uppercase tracking-wider">
                <FaServer className="text-emerald-400" /> 4. Proveedores de Servicios
              </h2>
              <div className="mt-4 text-gray-400 leading-relaxed space-y-4">
                <p>Compartimos información con proveedores externos que nos ayudan a operar el servicio:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Supabase:</strong> Para el almacenamiento seguro de bases de datos y autenticación.</li>
                  <li><strong>Google Cloud / OpenAI:</strong> Procesamiento de solicitudes de inteligencia artificial.</li>
                  <li><strong>Bold / Vercel:</strong> Infraestructura de pagos y hosting de la aplicación.</li>
                </ul>
              </div>
            </section>

            <section className="pt-12 border-t border-white/10">
              <p className="text-center text-gray-500 text-sm">
                Para cualquier solicitud relacionada con sus datos personales, escribanos a <a href="mailto:dropapp.lat@gmail.com" className="text-emerald-400 hover:underline">dropapp.lat@gmail.com</a>
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

export default PrivacyLanding;
