/* FileBrik Browser Kit v1.0 — Chrome DevTools Snippet "filebrik" (run: F12 → Ctrl+Shift+P → !filebrik).
   Safe by design: never fills passwords, OTP, CAPTCHA, payment, bank, tax or ID fields; never ticks terms;
   never clicks a final Sign-up / Submit / Pay button (it only outlines it in orange). Results → Downloads. */
(async () => {
  const CFG = {
    site: 'https://filebrik.pages.dev',
    sitemap: 'sitemap-index.xml',
    me: {                                    // fill once — not secret
      first: '', last: '', email: '',        // email = your FileBrik Gmail
      telegram: '',                          // optional, e.g. @yourhandle
      country: 'India',
      traffic: 'New site, under 1,000 visits/month (organic search)',
      desc: 'FileBrik: free in-browser PDF and image tools (compress, resize, convert, exam photo resizer). Files never leave the device.'
    }
  };

  /* ---------- core ---------- */
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const say = m => console.log('%c[FileBrik] ' + m, 'color:#0a7;font-weight:bold');
  const you = m => console.log('%c[YOU] ' + m, 'color:#fff;background:#d60;padding:2px 6px;font-weight:bold');
  const deep = (sel, root = document, out = []) => {
    root.querySelectorAll(sel).forEach(e => out.push(e));
    root.querySelectorAll('*').forEach(e => { if (e.shadowRoot) deep(sel, e.shadowRoot, out); });
    root.querySelectorAll('iframe').forEach(f => { try { if (f.contentDocument) deep(sel, f.contentDocument, out); } catch (_) {} });
    return out;
  };
  const vis = e => { try { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; } catch (_) { return false; } };
  const txt = e => norm(e.innerText || e.value || e.getAttribute('aria-label') || e.title);
  const CLICK = 'button,a,[role="button"],[role="tab"],[role="option"],[role="menuitem"],[role="radio"],[role="checkbox"],summary,label,input[type="submit"],input[type="button"]';
  const find = (labels, sel = CLICK, root = document) => {
    const L = [].concat(labels).map(norm), els = deep(sel, root).filter(vis);
    for (const l of L) { const e = els.find(x => txt(x) === l); if (e) return e; }
    for (const l of L) { const e = els.filter(x => txt(x).includes(l)).sort((a, b) => txt(a).length - txt(b).length)[0]; if (e) return e; }
    return null;
  };
  const nearEl = (el, labels, up = 7) => { for (let n = el; n && up-- > 0; n = n.parentElement) { const b = find(labels, CLICK, n); if (b && b !== el) return b; } return null; };
  const anchor = t => deep('h1,h2,h3,h4,p,span,div,strong,label,td').filter(e => vis(e) && txt(e).includes(norm(t))).sort((a, b) => txt(a).length - txt(b).length)[0] || null;
  const click = async e => { if (!e) return false; e.scrollIntoView({ block: 'center' }); await sleep(300); e.click(); await sleep(900); return true; };
  const body = () => (document.body ? document.body.innerText : '');
  const waitFor = async (fn, ms = 60000) => { const t = Date.now() + ms; while (Date.now() < t) { const r = await fn(); if (r) return r; await sleep(800); } return null; };
  const ctx = e => { for (let n = e.parentElement, i = 0; n && i < 4; n = n.parentElement, i++) { const t = n.innerText || ''; if (t.trim() && t.length < 140) return norm(t); } return ''; };
  const own = e => {
    let lab = '';
    try { if (e.id) lab = (e.getRootNode().querySelector('label[for="' + CSS.escape(e.id) + '"]') || {}).innerText || ''; } catch (_) {}
    const by = (e.getAttribute('aria-labelledby') || '').split(/\s+/).map(i => ((i && document.getElementById(i)) || {}).innerText || '').join(' ');
    return norm([e.getAttribute('aria-label'), e.placeholder, e.name, e.id, e.getAttribute('autocomplete'), lab, by, (e.closest('label') || {}).innerText].join(' '));
  };
  const BLOCK = /pass|otp|captcha|card|cvv|cvc|expir|iban|swift|ifsc|bank|account.?(no|num)|routing|tax|gst|\bpan\b|aadhaar|ssn|paypal|payoneer|wallet|upi|verification code|security code/i;
  const inputs = () => deep('input,textarea,select').filter(e => vis(e) && !e.disabled && !e.readOnly && !/^(hidden|password|checkbox|radio|submit|button|file|image|reset)$/i.test(e.type || ''));
  const setVal = (e, v) => {
    const W = e.ownerDocument.defaultView;
    if (e.tagName === 'SELECT') {
      const o = [...e.options].find(o => (v instanceof RegExp ? v.test(o.text) : norm(o.text).includes(norm(v))));
      if (!o) return false;
      e.value = o.value;
    } else {
      if (v instanceof RegExp) return false;
      Object.getOwnPropertyDescriptor((e.tagName === 'TEXTAREA' ? W.HTMLTextAreaElement : W.HTMLInputElement).prototype, 'value').set.call(e, v);
    }
    ['input', 'change', 'blur'].forEach(t => e.dispatchEvent(new W.Event(t, { bubbles: true })));
    e.style.outline = '2px solid #0a7';
    return true;
  };
  const used = new Set();
  const fill = (keys, v, alt) => {
    if (v == null || v === '') return false;
    const K = [].concat(keys).map(norm);
    const pool = inputs().filter(e => !used.has(e) && !BLOCK.test(own(e)) && (!e.value || e.tagName === 'SELECT'));
    const e = pool.find(x => K.some(k => own(x).includes(k))) || pool.find(x => K.some(k => ctx(x).includes(k)));
    if (!e) return false;
    used.add(e);
    return setVal(e, v) || (alt ? setVal(e, alt) : false);
  };
  const save = (name, data) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ savedAt: new Date().toISOString(), page: location.href, ...data }, null, 2)], { type: 'application/json' }));
    a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 1500);
    say('Saved ' + name + ' → Downloads (Antigravity picks it up).');
  };
  const SITE = (() => { try { return (localStorage.getItem('fbSite') || CFG.site).replace(/\/+$/, ''); } catch (_) { return CFG.site; } })();
  const hasCode = () => deep('textarea,pre,code').some(e => /<script|<meta|<ins|,\s*(DIRECT|RESELLER)\b/i.test(e.value || e.innerText || ''));
  const hasForm = () => deep('input[type="password"]').some(vis) || inputs().some(e => !e.value && /email|website|url|domain|site/.test(own(e)));

  /* ---------- generic: sign-up / add-website forms (ad networks, affiliates, directories) ---------- */
  function autofill() {
    const M = CFG.me, full = (M.first + ' ' + M.last).trim();
    if (!M.email) you('Tip: put your name + FileBrik Gmail in CFG.me (top of the snippet) once.');
    const plan = [
      [['first name', 'firstname', 'given name'], M.first],
      [['last name', 'lastname', 'surname', 'family name'], M.last],
      [['full name', 'your name', 'contact name'], full],
      [['email', 'e-mail'], M.email],
      [['confirm email', 'repeat email', 'email'], M.email],
      [['website', 'site url', 'url', 'domain'], SITE],
      [['site name', 'website name', 'project name', 'platform name'], 'FileBrik'],
      [['telegram', 'skype', 'messenger', 'whatsapp'], M.telegram],
      [['country'], M.country],
      [['category', 'vertical', 'niche', 'topic'], /tool|utilit|software|technolog|productiv|other/i],
      [['traffic', 'visits', 'visitors', 'pageviews', 'impressions'], M.traffic, /less|under|below|<|up to|^0|^1\s*[-–]|1[,.]?000|1k/i],
      [['description', 'about', 'comment', 'tell us', 'additional info'], M.desc],
      [['company', 'organization', 'organisation'], 'FileBrik'],
      [['username', 'nickname', 'login'], M.email ? M.email.split('@')[0] : '']
    ];
    let n = 0;
    plan.forEach(([k, v, alt]) => { if (fill(k, v, alt)) n++; });
    const go = find(['sign up', 'create account', 'register', 'submit', 'add website', 'add site', 'save', 'continue', 'next', 'apply']);
    if (go) { go.style.outline = '3px solid #d60'; go.scrollIntoView({ block: 'center' }); }
    say(n + ' field(s) filled (green outline).');
    you('Check fields, pick any dropdown left blank, type password, solve CAPTCHA, tick terms, then click the ORANGE button yourself.');
  }

  /* ---------- generic: capture ad / verification code from any dashboard ---------- */
  function collect(prefix = 'filebrik') {
    const net = (location.hostname.match(/monetag|adsterra|hilltopads|clickadu|adsense|propellerads/i) || [location.hostname.split('.').slice(-2, -1)[0]])[0].toLowerCase();
    const out = new Set(), push = v => { v = String(v || '').trim(); if (v && v.length < 20000) out.add(v); };
    deep('textarea,pre,code,input:not([type="password"])').forEach(e => { const v = e.value || e.innerText || ''; if (/<script|<meta|<ins|src=|importScripts|,\s*(DIRECT|RESELLER)\b/i.test(v)) push(v); });
    const b = body();
    (b.match(/<meta[^>\n]+>/gi) || []).forEach(push);
    (b.match(/<script[\s\S]{0,2000}?<\/script>/gi) || []).forEach(push);
    (b.match(/^[a-z0-9.-]+\.[a-z]{2,}\s*,\s*[\w.-]+\s*,\s*(DIRECT|RESELLER)\b.*$/gim) || []).forEach(push);
    if (!out.size) return you('No ad/verification code visible. Open the "Get code" / verification / ads.txt dialog first, then run again.');
    const label = ((deep('[role="dialog"] h1,[role="dialog"] h2,[role="dialog"] h3,h1,h2').filter(vis)[0] || {}).innerText || document.title).trim().slice(0, 80);
    save(`${prefix}-ads-${net}-${Date.now()}.json`, { network: net, label, snippets: [...out] });
    say(out.size + ' snippet(s) captured: ' + label);
  }

  /* ---------- Cloudflare: account ID, Web Analytics, API token (only if Antigravity asks) ---------- */
  async function cloudflare() {
    if (deep('input[type="password"]').some(vis)) return autofill();
    const acct = (location.pathname.match(/\/([a-f0-9]{32})(\/|$)/) || [])[1] || '';
    if (/\/profile\/api-tokens/.test(location.pathname)) {
      for (let i = 0; i < 5; i++) {
        if (/only be displayed once|copy this token|successfully created/i.test(body())) break;
        const tpl = anchor('edit cloudflare workers');
        const step = (tpl && nearEl(tpl, ['use template'])) || find(['continue to summary']) || find(['create token']);
        if (!step) break;
        await click(step); await sleep(2500);
      }
      return you('Click COPY on the token, then paste it ONLY into the black "gh secret set" window Antigravity opened → Enter. Never paste it in chat.');
    }
    if (/\/pages\/view\//.test(location.pathname)) {
      const b = body();
      const info = { accountId: acct, url: SITE, directUpload: /direct upload/i.test(b), mentionsGit: /github|git repository/i.test(b) };
      const m = find(['metrics']); if (m) { await click(m); await sleep(2500); }
      const wa = anchor('web analytics'), en = wa && nearEl(wa, ['enable']);
      if (en) { await click(en); say('Web Analytics enabled (active after next deploy).'); } else you('Optional: Metrics → Web Analytics → Enable (skip if already on).');
      return save('filebrik-cloudflare.json', info);
    }
    if (acct) { save('filebrik-cloudflare.json', { accountId: acct }); return you('Open Workers & Pages → filebrik, then run kit again.'); }
    you('Open https://dash.cloudflare.com → Workers & Pages → filebrik, then run kit.');
  }

  /* ---------- Google Search Console: URL-prefix property → verify → sitemap ---------- */
  async function gsc(depth = 0) {
    const prop = SITE + '/';
    if (/\/sitemaps/.test(location.pathname)) {
      const inp = await waitFor(() => inputs().find(e => /sitemap|url/.test(own(e) + ' ' + ctx(e))), 20000);
      if (!inp) return you('Type ' + CFG.sitemap + ' in "Add a new sitemap" and click SUBMIT.');
      setVal(inp, CFG.sitemap); await sleep(700);
      const s = nearEl(inp, ['submit']) || find(['submit']);
      if (!s) return you('Click SUBMIT.');
      await click(s); await sleep(4000);
      say('Sitemap submitted.');
      return save('filebrik-gsc.json', { status: 'sitemap-submitted', property: prop });
    }
    const verified = () => /ownership verified/i.test(body());
    if (verified()) return gscDone(prop);
    if (/verify ownership/i.test(body())) {
      let sent = null; try { sent = localStorage.getItem('fbGsc'); } catch (_) {}
      if (sent === 'sent') {
        const v = find(['verify']); if (v) await click(v);
        const r = await waitFor(() => verified() || (/verification failed|couldn.t verify|could not verify/i.test(body()) && 'fail'), 45000);
        if (r === true) return gscDone(prop);
        return you('Not verified yet. Wait for Antigravity: "GSC file live", then run kit again on this tab.');
      }
      const dl = deep('a,button,[role="button"]').filter(vis).find(e => /google[0-9a-f]+\.html/i.test((e.innerText || '') + ' ' + (e.getAttribute('href') || '')));
      if (dl) await click(dl);
      const tag = find(['html tag']); if (tag) { await click(tag); await sleep(1500); }
      const metaHits = body().match(/<meta name="google-site-verification" content="[^"]+"\s*\/?>/i) || deep('input,textarea').map(e => e.value || '').filter(v => /google-site-verification/.test(v));
      const meta = (metaHits && metaHits[0]) || '';
      try { localStorage.setItem('fbGsc', 'sent'); } catch (_) {}
      save('filebrik-gsc.json', { status: 'awaiting-deploy', property: prop, file: dl ? ((dl.innerText + ' ' + (dl.getAttribute('href') || '')).match(/google[0-9a-f]+\.html/i) || [''])[0] : '', meta });
      return you('Keep this tab open. When Antigravity says "GSC file live", run kit again here → it clicks VERIFY.');
    }
    const urlIn = inputs().find(e => /^https?:\/\//i.test(e.placeholder || '') || /url prefix/.test(own(e)));
    if (urlIn && depth < 2) {
      setVal(urlIn, prop); await sleep(600);
      const c = nearEl(urlIn, ['continue']); if (c) await click(c);
      await waitFor(() => /verify ownership|ownership verified/i.test(body()), 25000);
      return gsc(depth + 1);
    }
    if (depth >= 2) return you('Click CONTINUE under "URL prefix" yourself, then run kit again.');
    you('Opening Search Console "Add property" — run kit again when it loads.');
    location.href = 'https://search.google.com/search-console/welcome';
  }
  function gscDone(prop) {
    save('filebrik-gsc.json', { status: 'verified', property: prop });
    try { localStorage.removeItem('fbGsc'); } catch (_) {}
    say('Verified. Opening Sitemaps — run kit again there.');
    setTimeout(() => { location.href = 'https://search.google.com/search-console/sitemaps?resource_id=' + encodeURIComponent(prop); }, 1500);
  }

  /* ---------- Bing Webmaster: import from GSC ---------- */
  async function bing() {
    if (!/webmaster/i.test(location.href)) { you('Opening Bing Webmaster Tools — sign in, then run kit again.'); location.href = 'https://www.bing.com/webmasters'; return; }
    const cb = deep('input[type="checkbox"],[role="checkbox"]').filter(vis).find(e => /filebrik/i.test(ctx(e)));
    if (cb) {
      if (!(cb.checked || cb.getAttribute('aria-checked') === 'true')) await click(cb);
      const go = find(['import']); if (go) await click(go);
      return save('filebrik-bing.json', { status: 'import-clicked', site: SITE });
    }
    const a = anchor('google search console'), imp = a && nearEl(a, ['import']);
    if (imp) { await click(imp); return you('Choose the Google account that owns the Search Console property → Allow → run kit again on the site list.'); }
    you('If FileBrik is already listed in Bing, nothing to do. Else click "Import" under Google Search Console.');
  }

  /* ---------- Shift & Tip: Blogger → AdSense sign-up (only when Antigravity says APPLY NOW) ---------- */
  async function blogger() {
    if (!/\/earnings\//.test(location.pathname)) {
      const e = deep('a[href*="/earnings/"]').filter(vis)[0] || find(['earnings']);
      if (!e) return you('Open your Shift & Tip blog in Blogger, then run kit again.');
      await click(e); await sleep(3000);
    }
    const b = await waitFor(() => find(['sign up for adsense', 'get started', 'sign up']), 15000);
    if (b) { await click(b); return you('In AdSense: choose India; YOU accept terms + submit. Later (you): payments profile, PIN letter, W-8BEN.'); }
    you('No sign-up button: already applied or not eligible yet (Antigravity tracks this).');
  }
  function adsense() {
    if (hasCode()) return collect('shiftandtip');
    you('Ads → By ad unit → Display ads → name (st-top / st-incontent / st-sidebar / st-bottom) → Create → run kit on the code dialog. Privacy & messaging → European regulations → Create message → choose site → Publish (you).');
  }

  /* ---------- PAN official specs (Protean / UTIITSL) ---------- */
  async function pan() {
    const lines = body().split(/\n+/).map(s => s.trim()).filter(s => s.length > 3 && s.length < 600 && /photo|photograph|signature|\bkb\b|dpi|pixel|jpe?g|dimension|resolution|\bcm\b|\bmm\b/i.test(s));
    const links = [...new Set(deep('a[href]').map(a => a.href).filter(h => /\.pdf(\?|#|$)|guideline|instruction|form.?49|specification/i.test(h)))];
    const saved = []; let n = 0, opened = 0;
    for (const h of links.filter(h => /\.pdf(\?|#|$)/i.test(h)).slice(0, 12)) {
      try {
        if (new URL(h).origin === location.origin) {
          const r = await fetch(h, { credentials: 'include' }); if (!r.ok) throw new Error(r.status);
          const a = document.createElement('a'); a.href = URL.createObjectURL(await r.blob());
          a.download = `fb-pan-${location.hostname}-${++n}.pdf`; document.body.appendChild(a); a.click(); a.remove();
          saved.push({ file: a.download, url: h });
        } else if (opened < 3) { window.open(h, '_blank'); opened++; you('Opened ' + h + ' → press Ctrl+S → save in Downloads.'); }
        await sleep(1200);
      } catch (err) { you('Could not fetch ' + h + ' → open it, Ctrl+S into Downloads.'); }
    }
    save(`filebrik-pan-${location.hostname}-${Date.now()}.json`, { title: document.title, lines, links, saved });
    say(`PAN: ${lines.length} spec lines, ${n} PDF(s) saved. Repeat on the photo/signature guideline page if Antigravity asks.`);
  }

  /* ---------- dispatcher ---------- */
  const h = location.hostname;
  say('Kit v1.0 on ' + h);
  try {
    if (/(^|\.)dash\.cloudflare\.com$/.test(h)) await cloudflare();
    else if (h === 'search.google.com') await gsc();
    else if (/(^|\.)bing\.com$/.test(h)) await bing();
    else if (/(^|\.)blogger\.com$/.test(h)) await blogger();
    else if (/adsense\.google\.com$/.test(h)) adsense();
    else if (/protean|nsdl|utiitsl|incometax/.test(h)) await pan();
    else if (/stitch\.withgoogle\.com$/.test(h)) you('Stitch: click canvas → Ctrl+A → ⋮ More → Download (zip → Downloads). Only if Antigravity asks.');
    else if (/monetag|adsterra|hilltopads|clickadu|adsense/i.test(h) && hasCode()) collect();
    else if (!/(^|\.)claude\.ai$/i.test(h) && hasForm()) autofill();
    else you('Wrong page — open the URL from the last BROWSER line');
  } catch (err) {
    console.error('[FileBrik]', err);
    you('Error above. Tell Antigravity: "kit error on ' + h + ': <red line>" — it patches F:\\filebrik\\tools\\browser-kit.js and re-copies it.');
  }
})();
