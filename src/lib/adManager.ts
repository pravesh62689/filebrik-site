// F:/filebrik/src/lib/adManager.ts
// Programmatic Ad & Monetization Manager for FileBrik.
// Strictly adheres to CLS safety (reserved container dimensions) and user experience standards.

export interface AdConfig {
  enabled: boolean;
  monetagId?: string;
  clickaduId?: string;
  adsterraId?: string;
  hilltopId?: string;
  pushEnabled?: boolean;
}

const isBrowser = typeof window !== 'undefined';

// Environmental gate: off by default until explicit production deployment
export const ADS_ENABLED = isBrowser
  ? (window as any).PUBLIC_ADS_ENABLED === true || (window as any).PUBLIC_ADS_ENABLED === 'true'
  : false;

const POPUNDER_COOLDOWN_MS = 60 * 60 * 1000; // 1 per 60 minutes
const POPUNDER_STORAGE_KEY = 'fb_popunder_last';

/**
 * Checks if current page is an exempt legal/policy route
 */
export function isExemptRoute(pathname: string): boolean {
  const clean = pathname.toLowerCase();
  return (
    clean === '/privacy' ||
    clean === '/privacy/' ||
    clean === '/terms' ||
    clean === '/terms/' ||
    clean === '/contact' ||
    clean === '/contact/'
  );
}

/**
 * Triggers Monetag Pop-Under with Clickadu fallback and strict 60-min rate limiting
 */
export function triggerPopunder(currentPath: string): void {
  if (!ADS_ENABLED || !isBrowser || isExemptRoute(currentPath)) return;

  const now = Date.now();
  const last = parseInt(localStorage.getItem(POPUNDER_STORAGE_KEY) || '0', 10);
  if (now - last < POPUNDER_COOLDOWN_MS) {
    return; // Rate limit protected
  }

  try {
    localStorage.setItem(POPUNDER_STORAGE_KEY, String(now));
    // Monetag SDK invocation or fallback
    if ((window as any).monetag) {
      (window as any).monetag.trigger();
    } else if ((window as any).clickadu) {
      (window as any).clickadu.show();
    }
  } catch (err) {
    console.debug('[AdManager] Popunder suppressed');
  }
}

/**
 * Mounts Adsterra Social Bar non-intrusively
 */
export function initSocialBar(currentPath: string): void {
  if (!ADS_ENABLED || !isBrowser || isExemptRoute(currentPath)) return;

  const script = document.createElement('script');
  script.async = true;
  script.dataset.cfasync = 'false';
  script.src = '//pl25000000.effectivecpmgate.com/socialbar.js';
  document.body.appendChild(script);
}

/**
 * Desktop-only video slider banner (HilltopAds)
 */
export function initDesktopVideoSlider(currentPath: string): void {
  if (!ADS_ENABLED || !isBrowser || isExemptRoute(currentPath)) return;
  if (window.innerWidth < 1024) return; // Desktop only

  const container = document.getElementById('fb-desktop-slider');
  if (!container) return;

  // Reserved container prevents CLS
  container.style.minHeight = '250px';
  container.style.width = '300px';
}

/**
 * Initializes Web Push prompt service worker
 */
export async function registerPushWorker(): Promise<void> {
  if (!isBrowser || !('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    console.debug('[Push] ServiceWorker registered:', reg.scope);
  } catch (err) {
    console.debug('[Push] Registration skipped:', err);
  }
}

/**
 * A/B Bucket Experiment for monetization click conversion
 * Returns 'download' (control) or 'process' (variant)
 */
export function getButtonExperimentBucket(): 'download' | 'process' {
  if (!isBrowser) return 'download';
  let bucket = localStorage.getItem('fb_ab_bucket') as 'download' | 'process';
  if (!bucket || (bucket !== 'download' && bucket !== 'process')) {
    bucket = Math.random() < 0.5 ? 'download' : 'process';
    localStorage.setItem('fb_ab_bucket', bucket);
  }
  return bucket;
}
