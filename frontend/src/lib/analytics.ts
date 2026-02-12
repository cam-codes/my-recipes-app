const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const analyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';

export function initGA() {
  if (!GA_ID || !analyticsEnabled) return;

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
  if (!GA_ID || !analyticsEnabled || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
  });
}
