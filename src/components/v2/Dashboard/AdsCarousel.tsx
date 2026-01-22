import React, { useRef } from 'react';
import InstagramPost from './InstagramPost';
import { LandingGenerationState } from '../../../types/image-pro';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface AdsCarouselProps {
  landingState?: LandingGenerationState;
  customAds?: any[];
  minimal?: boolean;
}

const AdsCarousel: React.FC<AdsCarouselProps> = ({ landingState, customAds, minimal = false }) => {
  const adConcepts = customAds || landingState?.adConcepts || [];
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 420; // Ancho del post + gap
      const currentScroll = scrollRef.current.scrollLeft;
      const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;

      let nextScroll = direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;

      // Loop al final
      if (nextScroll > maxScroll + 10) nextScroll = 0;
      if (nextScroll < -10) nextScroll = maxScroll;

      scrollRef.current.scrollTo({
        left: nextScroll,
        behavior: 'smooth'
      });
    }
  };

  // Autoplay
  React.useEffect(() => {
    const interval = setInterval(() => {
      scroll('right');
    }, 5000);
    return () => clearInterval(interval);
  }, [adConcepts]);

  return (
    <div className={`w-full relative group/carousel ${minimal ? '' : 'py-4'}`}>
      {!minimal && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-primary-color rounded-full"></div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Conceptos Creativos de Ads</h3>
        </div>
      )}

      {/* Side Gradients for "Free" look */}
      {minimal && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#050608] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#050608] to-transparent z-10 pointer-events-none"></div>
        </>
      )}

      {/* Navigation Arrows */}
      {adConcepts.length > 1 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-[45%] -translate-y-1/2 z-20 w-10 h-10 bg-black/60 border border-white/10 rounded-full flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-primary-color hover:text-black hover:scale-110 -ml-5 shadow-xl backdrop-blur-md"
          >
            <FaChevronLeft className="text-lg" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-[45%] -translate-y-1/2 z-20 w-10 h-10 bg-black/60 border border-white/10 rounded-full flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-primary-color hover:text-black hover:scale-110 -mr-5 shadow-xl backdrop-blur-md"
          >
            <FaChevronRight className="text-lg" />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto pb-8 v2-scrollbar-hidden snap-x snap-mandatory px-2"
      >
        {adConcepts.length > 0 ? (
          adConcepts.map((concept) => {
            const generation = landingState?.adGenerations?.[concept.id];
            const imageUrl = concept.imageUrl || generation?.imageUrl || "";

            return (
              <div key={concept.id} className="min-w-[320px] md:min-w-[400px] snap-center">
                <InstagramPost
                  imageUrl={imageUrl}
                  hook={concept.hook}
                  cta={concept.adCta}
                  title={concept.title}
                  isLoading={generation?.status === 'pending'}
                />
              </div>
            );
          })
        ) : (
          <div className="w-full py-20 flex flex-col items-center justify-center border border-white/5 rounded-[32px] bg-white/[0.02]">
            <div className="text-white/20 text-4xl mb-4 font-black">?</div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Esperando conceptos de anuncios...</p>
          </div>
        )}
      </div>

      {/* Scroll indicator for mobile */}
      <div className="flex justify-center gap-1.5 mt-2">
        {adConcepts.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-primary-color' : 'bg-white/10'}`}></div>
        ))}
      </div>
    </div>
  );
};

export default AdsCarousel;
