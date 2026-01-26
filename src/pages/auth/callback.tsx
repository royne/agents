import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import BrandLoader from '../../components/common/BrandLoader';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Iniciando...');
  const [logs, setLogs] = useState<string[]>([]);
  const processedRef = useRef(false);

  const addLog = (msg: string) => {
    console.log(`[Diagnostic] ${msg}`);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    addLog('Componente montado. Esperando 1 seg para estabilidad...');

    const handleCallback = async () => {
      try {
        addLog('Consultando sesión en Supabase...');
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          addLog(`ERROR sesión: ${sessionError.message}`);
          setError(sessionError.message);
          return;
        }

        if (data.session && data.session.user) {
          const user = data.session.user;
          addLog(`Usuario detectado: ${user.email}`);
          setStatus(`Identificado como ${user.email}`);

          const createdAt = new Date(user.created_at).getTime();
          const now = new Date().getTime();
          const diffInSeconds = (now - createdAt) / 1000;
          const isNewUser = Math.abs(diffInSeconds) < 120; // 2 minutos

          addLog(`Tiempo desde creación: ${diffInSeconds.toFixed(1)} segundos.`);
          addLog(`¿Es usuario nuevo?: ${isNewUser ? 'SÍ' : 'NO'}`);

          if (isNewUser) {
            addLog('Disparando notificación a API...');
            setStatus('Enviando notificación...');
            try {
              const res = await fetch('/api/notifications/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'new_user',
                  email: user.email,
                  name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]
                })
              });

              if (res.ok) {
                addLog('Respuesta API: OK (Notificación enviada)');
              } else {
                const errText = await res.text();
                addLog(`Respuesta API ERROR ${res.status}: ${errText.substring(0, 50)}`);
              }
            } catch (fetchErr) {
              addLog(`Fallo al conectar con API: ${fetchErr instanceof Error ? fetchErr.message : 'Error desconocido'}`);
            }
          }

          addLog('Proceso completado. Esperando 3 segundos para que veas los logs...');
          setStatus('Todo listo. Redirigiendo...');

          // En producción, si es nuevo, esperamos para que vea el resultado
          setTimeout(() => {
            router.push('/');
          }, 3000);

        } else {
          addLog('No se encontró sesión activa.');
          const hash = window.location.hash;
          if (hash) {
            addLog(`Hash detectado: ${hash.substring(0, 30)}...`);
            setStatus('Procesando respuesta segura...');
            setTimeout(() => router.push('/'), 2000);
          } else {
            addLog('Sin sesión ni hash. Volviendo al login.');
            router.push('/auth/login');
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        addLog(`ERROR CRÍTICO: ${msg}`);
        setError(msg);
      }
    };

    // Pequeño delay para asegurar que el AuthProvider haya procesado si hubo redirect veloz
    setTimeout(handleCallback, 1000);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050608] text-white p-6">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center mb-8">
          <BrandLoader />
          <h1 className="text-xl font-bold mt-6 tracking-tighter uppercase">{status}</h1>
        </div>

        <div className="bg-black/50 border border-white/10 rounded-2xl p-6 font-mono text-[10px] space-y-2 max-h-[400px] overflow-y-auto">
          <p className="text-emerald-400 mb-4 border-b border-white/5 pb-2 tracking-widest uppercase">Consola de Diagnóstico (Producción)</p>
          {logs.map((log, i) => (
            <p key={i} className="text-gray-400 break-all">
              <span className="text-emerald-500/50 mr-2">ᐳ</span>
              {log}
            </p>
          ))}
          {logs.length === 0 && <p className="animate-pulse">Iniciando sistema de logs...</p>}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center">
            <strong>Error detectado:</strong> {error}
          </div>
        )}

        <p className="text-center text-gray-600 text-[10px] mt-8 uppercase tracking-[.2em]">
          DROPAPP V2 - Auth Pipeline Diagnostic
        </p>
      </div>
    </div>
  );
}
