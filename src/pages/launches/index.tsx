import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/layout/DashboardLayout';
import HeaderCredits from '../../components/dashboard/HeaderCredits';
import LaunchCard from '../../components/v2/Launches/LaunchCard';
import { Launch } from '../../services/launches/types';
import { FaRocket, FaPlus, FaSearch } from 'react-icons/fa';
import { useAppContext } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';

export default function LaunchesIndex() {
  const { authData } = useAppContext();
  const router = useRouter();
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch('/api/v2/launches', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        const result = await response.json();
        if (result.success) {
          setLaunches(result.data);
        }
      } catch (error) {
        console.error('Error fetching launches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (authData?.isAuthenticated) {
      fetchLaunches();
    }
  }, [authData]);

  const filteredLaunches = launches.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Head>
        <title>Mis Productos - DROPAPP</title>
      </Head>

      <div className="v2-layout-container flex flex-col gap-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <HeaderCredits className="flex-1" />
          <div className="pt-2">
            <button
              onClick={() => router.push('/v2')}
              className="px-6 py-3 bg-primary-color text-black font-black rounded-xl text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_10px_30px_rgba(18,216,250,0.2)] flex items-center gap-2"
            >
              <FaPlus /> Nuevo Producto
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Mis Productos</h1>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-1">Gestiona y escala tus activos comerciales de IA</p>
            </div>

            <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-color transition-colors" />
              <input
                type="text"
                placeholder="BUSCAR PROYECTO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-xs text-white uppercase font-black tracking-widest focus:border-primary-color/40 focus:bg-white/[0.05] outline-none transition-all w-full md:w-[300px]"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-[4/5] bg-white/[0.03] border border-white/5 rounded-[24px] animate-pulse"></div>
              ))}
            </div>
          ) : filteredLaunches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {filteredLaunches.map(launch => (
                <LaunchCard key={launch.id} launch={launch} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-10 bg-white/[0.02] border border-white/5 border-dashed rounded-[40px] text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary-color/5 flex items-center justify-center border border-primary-color/10">
                <FaRocket className="text-3xl text-primary-color/40" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">No hay productos activos</h3>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-2">Empieza analizando un producto para crear tu primer activo estratégico.</p>
              </div>
              <button
                onClick={() => router.push('/v2')}
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white tracking-widest hover:border-primary-color/40 transition-all"
              >
                Ir al Descubridor
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
