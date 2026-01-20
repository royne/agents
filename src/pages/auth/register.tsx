import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/AppContext';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaArrowRight, FaCheckCircle, FaCrown } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { trackPixelEvent } from '../../utils/pixelEvents';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Colombia');
  const [dialCode, setDialCode] = useState('+57');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAppContext();

  // Capturar código de referido de la URL
  const referralCode = router.query.ref as string || '';

  const countries = [
    { name: 'Colombia', code: '+57', flag: '🇨🇴' },
    { name: 'Argentina', code: '+54', flag: '🇦🇷' },
    { name: 'Chile', code: '+56', flag: '🇨🇱' },
    { name: 'Perú', code: '+51', flag: '🇵🇪' },
    { name: 'Ecuador', code: '+593', flag: '🇪🇨' },
    { name: 'Guatemala', code: '+502', flag: '🇬🇹' },
    { name: 'México', code: '+52', flag: '🇲🇽' },
    { name: 'Panamá', code: '+507', flag: '🇵🇦' },
  ];

  const handleCountryChange = (countryName: string) => {
    const selected = countries.find(c => c.name === countryName);
    if (selected) {
      setCountry(selected.name);
      setDialCode(selected.code);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación flexible de teléfono
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      setError('Por favor ingresa un número de celular válido.');
      return;
    }

    const fullPhone = `${dialCode}${phoneDigits}`;

    // Validación de dominio de correo (solo los más comunes)
    const allowedDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'live.com', 'icloud.com'];
    const emailDomain = email.split('@')[1]?.toLowerCase();

    if (!emailDomain || !allowedDomains.some(domain => emailDomain.includes(domain))) {
      setError('Por favor usa un correo válido (Gmail, Hotmail, Yahoo o Outlook). No se permiten correos corporativos o temporales.');
      return;
    }

    setLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    try {
      const result = await register(email.trim(), password, fullPhone, fullName, country, referralCode);
      if (result.success) {
        setIsSuccess(true);
        // Rastrear evento de registro como "CompleteRegistration" (Registro completado)
        trackPixelEvent('CompleteRegistration', {
          content_name: 'Registro de Usuario',
          status: 'success'
        });
      } else {
        setError(result.error || 'Error al crear la cuenta');
      }
    } catch (err) {
      setError('Error en el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050608] px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-color/10 rounded-full blur-[120px] opacity-50"></div>
        <div className="soft-card p-10 md:p-12 max-w-md w-full relative z-10 border-white/5 shadow-2xl backdrop-blur-xl text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
            <FaCheckCircle className="text-4xl text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">¡Revisa tu correo!</h2>
          <div className="space-y-4 text-gray-400 font-medium mb-8">
            <p>
              Hemos enviado un enlace de confirmación a:
              <br />
              <span className="text-white font-bold text-lg">{email}</span>
            </p>
            <div className="bg-primary-color/10 border border-primary-color/20 p-4 rounded-2xl">
              <p className="text-sm text-primary-color font-bold uppercase tracking-wider mb-2">Paso Importante</p>
              <p className="text-white text-sm">
                Debes hacer clic en el botón del correo para <span className="text-primary-color font-black">ACTIVAR TU CUENTA</span> y recibir tus <span className="text-primary-color font-black">50 CRÉDITOS</span> iniciales.
              </p>
            </div>
            <p className="text-xs italic">
              ¿No lo ves? Revisa tu carpeta de correo no deseado (Spam).
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-gray-500 text-xs mb-4">
              Una vez confirmado, podrás iniciar sesión normalmente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050608] px-4 relative overflow-hidden py-12">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary-color/10 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] opacity-50"></div>

      <div className="soft-card p-8 md:p-10 max-w-md w-full relative z-10 border-white/5 shadow-2xl backdrop-blur-xl">
        {/* Botón Volver al sitio */}
        <div className="absolute top-6 left-6">
          <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary-color transition-colors group">
            <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary-color/30">
              <FaArrowRight className="rotate-180 text-[8px]" />
            </div>
            Volver al sitio
          </Link>
        </div>

        <div className="flex flex-col items-center mb-8">
          {/* Logo DROPAPP */}
          <Link href="/" className="relative group mb-6">
            <div className="absolute -inset-2 bg-primary-color/20 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-700"></div>
            <div className="relative p-1 rounded-[1.2rem] bg-gradient-to-br from-white/20 to-transparent border border-white/10 shadow-xl backdrop-blur-md">
              <div className="bg-[#050608] rounded-[1rem] overflow-hidden p-3">
                <div className="relative w-12 h-12">
                  <Image
                    src="/droplab.png"
                    alt="DROPAPP"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tighter">Crear Cuenta</h1>
          <p className="text-gray-500 font-medium mt-1 text-xs uppercase tracking-widest text-center">Únete a la élite del e-commerce</p>
        </div>

        {referralCode && (
          <div className="mb-6 bg-primary-color/10 border border-primary-color/20 p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="w-10 h-10 bg-primary-color/20 rounded-lg flex items-center justify-center border border-primary-color/30 flex-shrink-0">
              <FaCrown className="text-primary-color" />
            </div>
            <div>
              <p className="text-[10px] text-primary-color font-black uppercase tracking-wider mb-0.5">Invitación Especial</p>
              <p className="text-white text-[13px] font-medium leading-tight">
                Te vas a registrar con el enlace de referido de la comunidad de <span className="text-primary-color font-bold uppercase">{referralCode}</span>
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-color transition-colors">
                  <FaUser className="text-sm" />
                </div>
                <input
                  type="text"
                  className="w-full py-3.5 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color/30 transition-all font-medium text-sm"
                  placeholder="Nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              {/* Apellido */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-color transition-colors">
                  <FaUser className="text-sm" />
                </div>
                <input
                  type="text"
                  className="w-full py-3.5 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color/30 transition-all font-medium text-sm"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-color transition-colors">
                <FaEnvelope className="text-base" />
              </div>
              <input
                type="email"
                className="w-full py-3.5 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color/30 transition-all font-medium text-sm"
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* País */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-color transition-colors">
                <span className="text-base">{countries.find(c => c.name === country)?.flag}</span>
              </div>
              <select
                className="w-full py-3.5 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color/30 transition-all font-medium text-sm appearance-none cursor-pointer"
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                required
              >
                {countries.map((c) => (
                  <option key={c.name} value={c.name} className="bg-[#050608] text-white">
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <FaArrowRight className="rotate-90 text-[10px]" />
              </div>
            </div>

            {/* Celular */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-color transition-colors flex items-center gap-2">
                <FaPhone className="text-base" />
                <span className="text-xs font-bold text-gray-400 border-r border-white/10 pr-2">{dialCode}</span>
              </div>
              <input
                type="tel"
                className="w-full py-3.5 pl-24 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color/30 transition-all font-medium text-sm"
                placeholder="WhatsApp / Celular"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-color transition-colors">
                <FaLock className="text-base" />
              </div>
              <input
                type="password"
                className="w-full py-3.5 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color/30 transition-all font-medium text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-color text-white py-4 rounded-xl font-black text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary-color/20 btn-modern disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
          >
            {loading ? 'CREANDO CUENTA...' : (
              <>
                CREAR CUENTA <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-gray-500 text-sm font-medium">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-primary-color hover:underline font-bold">
              Inicia Sesión
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">
            Digital Engine by <span className="text-primary-color">RAC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
