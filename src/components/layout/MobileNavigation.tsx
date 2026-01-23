import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaSignOutAlt, FaChevronRight, FaCrown } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

interface MobileNavigationProps {
  menuSections: any[];
  canAccessModule: (key: any) => boolean;
  isAdmin: () => boolean;
  authData: any;
  logout: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  menuSections,
  canAccessModule,
  isAdmin,
  authData,
  logout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] md:hidden"
            />

            {/* Side Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-[#0A0C10] border-r border-white/5 z-[70] md:hidden overflow-y-auto custom-scrollbar flex flex-col pt-6 pb-24"
            >
              <div className="px-6 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 relative rounded-lg bg-white/5 border border-white/10 p-1.5 shadow-inner">
                    <Image src="/droplab.png" alt="DROPAPP" fill className="object-cover p-1" />
                  </div>
                  <span className="text-white font-black text-lg tracking-tighter">DROPAPP</span>
                </div>
                <button onClick={toggleMenu} className="p-2 text-white/40 hover:text-white">
                  <FaTimes />
                </button>
              </div>

              <div className="flex-1 px-4 space-y-8">
                {menuSections.map((section) => {
                  const visibleItems = section.items.filter((item: any) => {
                    if (item.adminOnly && !isAdmin() && !item.showForAllAdmins) return false;
                    if (!canAccessModule(item.moduleKey)) return false;
                    if (item.path === '/referrals' && !authData?.is_mentor) return false;
                    return true;
                  });

                  if (visibleItems.length === 0) return null;

                  return (
                    <div key={section.title} className="space-y-3">
                      <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                        {section.title}
                      </h3>
                      <div className="space-y-1">
                        {visibleItems.map((item: any) => {
                          const isActive = router.pathname === item.path || router.pathname.startsWith(item.path + '/');
                          return (
                            <Link key={item.path} href={item.path} onClick={toggleMenu}>
                              <div className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primary-color/10 ring-1 ring-primary-color/20 text-white' : 'hover:bg-white/5 text-gray-500'}`}>
                                <div className="flex items-center gap-3">
                                  <item.icon className={`text-lg transition-transform duration-300 ${isActive ? 'text-primary-color' : ''}`} />
                                  <span className={`text-[13px] font-bold ${isActive ? 'text-white' : ''}`}>
                                    {item.name}
                                  </span>
                                </div>
                                {isActive && <FaChevronRight className="text-[10px] text-primary-color" />}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Promo / Pricing in Drawer at the bottom */}
                {authData?.plan !== 'business' && (
                  <Link href="/pricing" onClick={toggleMenu} className="block px-3 mt-4 mb-8">
                    <div className="w-full flex items-center p-4 rounded-2xl bg-gradient-to-br from-[#12D8FA] to-[#0066FF] text-white shadow-lg">
                      <FaCrown className="text-xl mr-3" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Planes y Créditos</span>
                        <span className="text-[8px] font-bold opacity-80 mt-1">Mejora tu plan hoy</span>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Bar Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0C10]/95 backdrop-blur-2xl border-t border-white/5 z-50 h-16 safe-area-bottom flex items-center justify-around px-10">
        {/* Home/Logo */}
        <Link href="/" className="flex flex-col items-center justify-center p-2 group">
          <div className="w-8 h-8 relative rounded-lg bg-white/5 border border-white/10 p-1.5 group-active:scale-95 transition-all">
            <Image src="/droplab.png" alt="DROPAPP" fill className="object-cover p-1" />
          </div>
        </Link>

        {/* Menu Toggle */}
        <button
          onClick={toggleMenu}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary-color text-black shadow-[0_5px_15px_rgba(18,216,250,0.3)] hover:scale-105 active:scale-95 transition-all"
        >
          {isOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center p-2 text-gray-500 hover:text-rose-400 active:scale-90 transition-all"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5">
            <FaSignOutAlt className="text-lg" />
          </div>
        </button>
      </div>
    </>
  );
};

export default MobileNavigation;
