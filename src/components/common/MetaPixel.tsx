import React, { useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

const MetaPixel: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Solo registrar PageView si estamos exactamente en la landing page
    if (router.pathname === '/' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }
  }, [router.pathname]);

  if (!META_PIXEL_ID) return null;

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
          `,
        }}
      />
      {router.pathname === '/' && (
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}
    </>
  );
};

export default MetaPixel;
