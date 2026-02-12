const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const isProd = import.meta.env.PROD;

export function initGA() {
  console.log(`Initializing GA`);
  console.info(`GA_ID: ${GA_ID}`);
  if (!GA_ID) return;

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '${GA_ID}',{ send_page_view: false, debug_mode: true });
  `;
  document.head.appendChild(script2);
}

export function trackPageView(path: string) {
  if (!GA_ID || !isProd || !(window as any).gtag) return;

  console.log('Tracking page_view:', path);
  (window as any).gtag('event', 'page_view', {
    page_path: path,
  });
}
