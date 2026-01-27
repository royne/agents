import React, { useState } from 'react';
import { FaPhoneAlt, FaGlobeAmericas, FaCheckCircle, FaRocket, FaExclamationTriangle, FaChevronDown } from 'react-icons/fa';
import { UserService } from '../../services/userService';
import { useAppContext } from '../../contexts/AppContext';

interface OnboardingModalProps {
  isOpen: boolean;
}

const COUNTRIES = [
  { name: 'Colombia', code: '+57', flag: '🇨🇴' },
  { name: 'México', code: '+52', flag: '🇲🇽' },
  { name: 'Chile', code: '+56', flag: '🇨🇱' },
  { name: 'Argentina', code: '+54', flag: '🇦🇷' },
  { name: 'Perú', code: '+51', flag: '🇵🇪' },
  { name: 'Ecuador', code: '+593', flag: '🇪🇨' },
  { name: 'Guatemala', code: '+502', flag: '🇬🇹' },
  { name: 'Panamá', code: '+507', flag: '🇵🇦' },
  { name: 'España', code: '+34', flag: '🇪🇸' }, // Corrected flag for Spain
  { name: 'Estados Unidos', code: '+1', flag: '🇺🇸' },
];

export default function OnboardingModal({ isOpen }: OnboardingModalProps) {
  const { authData, syncUserData } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Form, 2: Success

  const [formData, setFormData] = useState({
    phone: '',
    country: 'Colombia',
    dialCode: '+57',
  });

  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Cargar referido del localStorage al montar
  React.useEffect(() => {
    const savedRef = localStorage.getItem('dropapp_ref');
    if (savedRef) setReferralCode(savedRef);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleCountrySelect = (c: typeof COUNTRIES[0]) => {
    setFormData({ ...formData, country: c.name, dialCode: c.code });
    setShowCountrySelector(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 7) {
      setError('Por favor ingresa un número de celular válido');
      return;
    }

    setLoading(true);
    setError(null);

    const fullPhone = `${formData.dialCode}${phoneDigits}`;

    const result = await UserService.completeOnboarding({
      userId: authData?.userId || '',
      email: authData?.email || '',
      name: authData?.name || 'Usuario',
      phone: fullPhone,
      country: formData.country,
      avatar_url: authData?.avatar_url
    });

    if (result.success) {
      setStep(2);
      setTimeout(async () => {
        await syncUserData();
      }, 2000);
    } else {
      setError('Hubo un error al guardar. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#0a0c10] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden relative group">

        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-color/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-color/5 blur-[100px] rounded-full -ml-32 -mb-32"></div>

        <div className="relative p-10">
          {step === 1 ? (
            <div className="space-y-8">
              <div className="text-center">
                {authData?.avatar_url ? (
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary-color to-blue-500 rounded-[24px] blur-sm opacity-40"></div>
                    <img
                      src={authData.avatar_url}
                      alt="Avatar"
                      className="relative w-24 h-24 rounded-[24px] object-cover border-2 border-white/10 shadow-2xl"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-color/20 to-primary-color/5 border border-primary-color/20 rounded-[24px] flex items-center justify-center text-primary-color mx-auto mb-4 shadow-xl">
                    <span className="text-3xl font-black tracking-tighter">{getInitials(authData?.name)}</span>
                  </div>
                )}

                {referralCode && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-color/10 border border-primary-color/20 rounded-full mb-4 animate-in fade-in slide-in-from-top-2 duration-700">
                    <div className="w-2 h-2 bg-primary-color rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                      Miembro de la comunidad: <span className="text-primary-color">{referralCode}</span>
                    </span>
                  </div>
                )}
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">
                  ¡Casi Listo, <span className="text-primary-color">{authData?.name?.split(' ')[0]}</span>!
                </h2>
                <p className="text-gray-500 text-sm font-medium"> Completa estos datos para personalizar tu experiencia y activar tu cuenta.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selector de País */}
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">País de Residencia</label>
                  <button
                    type="button"
                    onClick={() => setShowCountrySelector(!showCountrySelector)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-4 px-5 flex items-center justify-between text-white text-sm hover:bg-white/[0.05] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {COUNTRIES.find(c => c.name === formData.country)?.flag || '🌎'}
                      </span>
                      <span className="font-bold">{formData.country}</span>
                    </div>
                    <FaChevronDown className={`text-[10px] transition-transform ${showCountrySelector ? 'rotate-180' : ''}`} />
                  </button>

                  {showCountrySelector && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#121418] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 h-48 overflow-y-auto custom-scrollbar">
                      {COUNTRIES.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleCountrySelect(c)}
                          className="w-full px-5 py-3 flex items-center gap-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                          <span className="text-lg">{c.flag}</span>
                          <span className="flex-1 text-left font-medium">{c.name}</span>
                          <span className="text-[10px] font-black text-gray-600">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Campo Teléfono COMBINADO */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Número de Celular</label>
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 w-24 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-center text-white text-sm font-black tracking-tighter">
                      {formData.dialCode}
                    </div>
                    <div className="relative flex-1 group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <FaPhoneAlt className="text-primary-color text-xs opacity-50" />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="312 456..."
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-4 pl-12 pr-6 text-white text-sm placeholder:text-gray-700 focus:outline-none focus:border-primary-color/50 focus:bg-white/[0.05] transition-all font-mono tracking-wider"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold animate-shake">
                    <FaExclamationTriangle />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 rounded-xl bg-primary-color text-black font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(18,216,250,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 mt-4"
                >
                  {loading ? 'Guardando Configuración...' : 'Comenzar Ahora'}
                </button>
              </form>

              <p className="text-[9px] text-center text-gray-600 font-bold uppercase tracking-tighter">
                Tus datos están protegidos y solo se usan para mejorar el servicio.
              </p>
            </div>
          ) : (
            <div className="text-center py-10 space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <FaCheckCircle className="text-5xl" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
                  ¡Todo Listo!
                </h2>
                <p className="text-gray-500 text-sm font-medium">Configuración completada con éxito. <br />Redirigiendo a tu panel...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
