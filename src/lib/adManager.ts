// F:/filebrik/src/lib/adManager.ts
// Programmatic Ad & Monetization Manager for FileBrik.
// Strictly adheres to CLS safety (reserved container dimensions) and user experience standards.
import adZones from '../data/adZones.json';

export interface NetworkZonesConfig {
  socialBarScriptUrl?: string;
  videoSliderScriptUrl?: string;
  popunderScriptUrl?: string;
  nativeBannerScriptUrl?: string;
  nativeContainerId?: string;
  [key: string]: unknown;
}

export interface AdZonesConfig {
  enabled: boolean;
  networks: Record<string, NetworkZonesConfig | undefined>;
}

const zonesConfig = adZones as unknown as AdZonesConfig;

/**
 * Repo-driven ad switch (`src/data/adZones.json`), optionally overridden by `PUBLIC_ADS_ENABLED` ('true' | 'false').
 */
export function isAdsEnabled(envOverride: string | boolean | undefined = import.meta.env?.PUBLIC_ADS_ENABLED): boolean {
  if (envOverride === true || envOverride === 'true') return true;
  if (envOverride === false || envOverride === 'false') return false;
  return Boolean(zonesConfig.enabled);
}

const isBrowser = typeof window !== 'undefined';

export const ADS_ENABLED = isBrowser
  ? (window as any).PUBLIC_ADS_ENABLED === true || (window as any).PUBLIC_ADS_ENABLED === 'true'
  : isAdsEnabled();

const POPUNDER_COOLDOWN_MS = 60 * 60 * 1000; // 1 per 60 minutes
const POPUNDER_STORAGE_KEY = 'fb_popunder_last';
const POPUNDER_SESSION_KEY = 'fb_popunder_session';

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
    clean === '/contact/' ||
    clean === '/about' ||
    clean === '/about/'
  );
}

/**
 * Triggers Pop-Under (Monetag primary, Clickadu fallback) ONLY after a file download completes,
 * capped at 1 per session and 60-min cooldown.
 */
export function triggerPopunder(currentPath: string, opts: { afterDownload?: boolean } = {}): void {
  if (!ADS_ENABLED || !isBrowser || isExemptRoute(currentPath) || !opts.afterDownload) return;
  if (sessionStorage.getItem(POPUNDER_SESSION_KEY) === '1') return;

  const now = Date.now();
  const last = parseInt(localStorage.getItem(POPUNDER_STORAGE_KEY) || '0', 10);
  if (now - last < POPUNDER_COOLDOWN_MS) {
    return; // Rate limit protected
  }

  try {
    sessionStorage.setItem(POPUNDER_SESSION_KEY, '1');
    localStorage.setItem(POPUNDER_STORAGE_KEY, String(now));
    if ((window as any).monetag) {
      (window as any).monetag.trigger();
    } else if ((window as any).clickadu) {
      (window as any).clickadu.show();
    }
  } catch {
    console.debug('[AdManager] Popunder suppressed');
  }
}

/**
 * Mounts Adsterra Social Bar once per page, after first user interaction or 5 seconds.
 */
export function initSocialBar(currentPath: string): void {
  if (!ADS_ENABLED || !isBrowser || isExemptRoute(currentPath)) return;
  const scriptUrl = zonesConfig.networks?.adsterra?.socialBarScriptUrl;
  if (!scriptUrl || typeof scriptUrl !== 'string') return;
  if ((window as any).__fbSocialBarLoaded) return;

  const mount = () => {
    if ((window as any).__fbSocialBarLoaded) return;
    (window as any).__fbSocialBarLoaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src = scriptUrl;
    document.body.appendChild(script);
  };

  const timer = window.setTimeout(mount, 5000);
  const onInteract = () => {
    window.clearTimeout(timer);
    mount();
    window.removeEventListener('pointerdown', onInteract);
    window.removeEventListener('keydown', onInteract);
    window.removeEventListener('scroll', onInteract);
  };
  window.addEventListener('pointerdown', onInteract, { once: true, passive: true });
  window.addEventListener('keydown', onInteract, { once: true, passive: true });
  window.addEventListener('scroll', onInteract, { once: true, passive: true });
}

/**
 * Mounts Popunder once per session on first page click outside tool controls and download buttons.
 */
export function initSafeClickPopunder(currentPath: string): void {
  if (!ADS_ENABLED || !isBrowser || isExemptRoute(currentPath)) return;
  const scriptUrl = zonesConfig.networks?.adsterra?.popunderScriptUrl;
  if (!scriptUrl || typeof scriptUrl !== 'string') return;
  if (sessionStorage.getItem(POPUNDER_SESSION_KEY) === '1') return;

  const onClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('.tool-workspace, .fb-dropzone, button, input, select, textarea, #downloadOutput, #downloadBtn, [data-tool-control]')) {
      return;
    }
    if (sessionStorage.getItem(POPUNDER_SESSION_KEY) === '1') return;
    sessionStorage.setItem(POPUNDER_SESSION_KEY, '1');
    localStorage.setItem(POPUNDER_STORAGE_KEY, String(Date.now()));
    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src = scriptUrl;
    document.body.appendChild(script);
    document.removeEventListener('click', onClick, true);
  };
  document.addEventListener('click', onClick, true);
}

/**
 * Mounts Adsterra Native Banner once per page: prefers tool in-result slot, falls back to native-footer.
 */
export function initNativeBanners(currentPath: string): void {
  if (!ADS_ENABLED || !isBrowser || isExemptRoute(currentPath)) return;
  const scriptUrl = zonesConfig.networks?.adsterra?.nativeBannerScriptUrl;
  const containerId = zonesConfig.networks?.adsterra?.nativeContainerId || 'container-e2963278b5c991d69ee9418e31b0f1ef';
  if (!scriptUrl || typeof scriptUrl !== 'string') return;
  if (document.getElementById(containerId)) return;

  const targetSlot =
    document.querySelector('[data-ad-slot="in-result"]') ||
    document.querySelector('[data-ad-slot="native-footer"]');
  if (!targetSlot) return;

  const contentWrap = targetSlot.querySelector('.ad-content-slot') || targetSlot;
  const container = document.createElement('div');
  container.id = containerId;
  contentWrap.appendChild(container);

  const script = document.createElement('script');
  script.async = true;
  script.setAttribute('fetchpriority', 'high');
  script.dataset.cfasync = 'false';
  script.src = scriptUrl;
  contentWrap.appendChild(script);
}

/**
 * Desktop-only video slider banner (HilltopAds) when configured in src/data/adZones.json
 */
export function initDesktopVideoSlider(currentPath: string): void {
  if (!ADS_ENABLED || !isBrowser || isExemptRoute(currentPath)) return;
  if (window.innerWidth < 1024) return; // Desktop only

  const container = document.getElementById('fb-desktop-slider');
  if (!container) return;

  const scriptUrl = zonesConfig.networks?.hilltopads?.videoSliderScriptUrl;
  if (!scriptUrl || typeof scriptUrl !== 'string') return;

  // Reserved container prevents CLS
  container.style.minHeight = '250px';
  container.style.width = '300px';
  container.hidden = false;

  const script = document.createElement('script');
  script.async = true;
  script.src = scriptUrl;
  container.appendChild(script);
}

/**
 * Initializes Web Push prompt service worker
 */
export async function registerPushWorker(): Promise<void> {
  if (!ADS_ENABLED || !isBrowser || !('serviceWorker' in navigator)) return;

  try {
    const existing = await navigator.serviceWorker.getRegistration('/sw.js');
    if (existing) return;
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
