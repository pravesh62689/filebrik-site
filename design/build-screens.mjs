// F:/filebrik/design/build-screens.mjs
// Generates the 4 core Stitch design export screens (HTML + PNG screenshots) for FileBrik.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const exportsDir = path.join(__dirname, 'exports');
const tokensCss = fs.readFileSync(path.join(__dirname, 'tokens.css'), 'utf8');

if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// ---------------------------------------------------------------------------
// Screen 1: S1-home-desktop.html
// ---------------------------------------------------------------------------
const s1Html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FileBrik - 100% Private, Client-Side PDF & Media Tools</title>
  <style>
${tokensCss}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--fb-font-sans); background: var(--fb-bg); color: var(--fb-text-main); line-height: 1.5; }
    .header { background: var(--fb-surface); border-bottom: 1px solid var(--fb-border); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 50; }
    .logo { font-size: 1.35rem; font-weight: 800; color: var(--fb-primary); text-decoration: none; display: flex; align-items: center; gap: 0.5rem; }
    .nav { display: flex; gap: 1.5rem; align-items: center; }
    .nav a { color: var(--fb-text-muted); text-decoration: none; font-size: 0.9rem; font-weight: 600; }
    .nav a:hover { color: var(--fb-primary); }
    .hero { max-width: 900px; margin: 3rem auto 2rem; text-align: center; padding: 0 1.5rem; }
    .hero h1 { font-size: 2.75rem; font-weight: 900; line-height: 1.2; margin-bottom: 1rem; color: #0F172A; }
    .hero h1 span { color: var(--fb-primary); }
    .hero p { font-size: 1.15rem; color: var(--fb-text-muted); max-width: 680px; margin: 0 auto 2rem; }
    .badge { display: inline-flex; align-items: center; gap: 0.35rem; background: var(--fb-primary-light); color: var(--fb-primary); padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 700; margin-bottom: 1.5rem; }
    .tools-grid { max-width: 1200px; margin: 0 auto 4rem; padding: 0 1.5rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
    .tool-card { background: var(--fb-surface); border: 1px solid var(--fb-border); border-radius: var(--fb-radius-lg); padding: 1.5rem; text-decoration: none; color: inherit; transition: all 0.2s; box-shadow: var(--fb-shadow-sm); display: flex; flex-direction: column; }
    .tool-card:hover { transform: translateY(-3px); box-shadow: var(--fb-shadow-md); border-color: var(--fb-border-focus); }
    .tool-icon { width: 44px; height: 44px; border-radius: var(--fb-radius-md); background: var(--fb-primary-light); color: var(--fb-primary); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 1rem; }
    .tool-card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.4rem; }
    .tool-card p { font-size: 0.85rem; color: var(--fb-text-muted); line-height: 1.4; flex-grow: 1; }
    .features { background: var(--fb-surface); border-top: 1px solid var(--fb-border); border-bottom: 1px solid var(--fb-border); padding: 4rem 1.5rem; }
    .features-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem; text-align: center; }
    .feature h4 { font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem; }
    .feature p { font-size: 0.9rem; color: var(--fb-text-muted); }
    .footer { max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--fb-text-muted); }
    .footer-links { display: flex; gap: 1.5rem; }
    .footer-links a { color: var(--fb-text-muted); text-decoration: none; }
  </style>
</head>
<body>
  <header class="header">
    <a href="/" class="logo">⚡ FileBrik</a>
    <nav class="nav">
      <a href="/tools/compress-pdf">Compress PDF</a>
      <a href="/tools/merge-pdf">Merge PDF</a>
      <a href="/tools/exam-photo-signature-resizer">Exam Resizer</a>
      <a href="/privacy">Privacy</a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <div class="badge">🔒 100% Client-Side Privacy — Files Never Leave Your Device</div>
      <h1>Ultra-Fast PDF & Media Tools,<br><span>Zero Server Uploads</span></h1>
      <p>Compress, merge, convert, and resize exam photos entirely in your browser using WebAssembly. Instant, secure, and private.</p>
    </section>

    <section class="tools-grid">
      <a href="/tools/compress-pdf" class="tool-card">
        <div class="tool-icon">🗜️</div>
        <h3>Compress PDF</h3>
        <p>Reduce PDF size to exact target KBs (100KB, 200KB, 500KB) while preserving high readability.</p>
      </a>
      <a href="/tools/merge-pdf" class="tool-card">
        <div class="tool-icon">📑</div>
        <h3>Merge PDF</h3>
        <p>Combine multiple documents into one structured PDF file with drag-and-drop page reordering.</p>
      </a>
      <a href="/tools/split-pdf" class="tool-card">
        <div class="tool-icon">✂️</div>
        <h3>Split PDF</h3>
        <p>Extract individual pages or custom ranges into standalone lightweight PDF files.</p>
      </a>
      <a href="/tools/jpg-to-pdf" class="tool-card">
        <div class="tool-icon">🖼️</div>
        <h3>JPG to PDF</h3>
        <p>Convert multiple photos and scans into a single printable PDF with custom orientation.</p>
      </a>
      <a href="/tools/pdf-to-jpg" class="tool-card">
        <div class="tool-icon">📸</div>
        <h3>PDF to JPG</h3>
        <p>Render PDF pages into crisp high-resolution WebP or JPEG images in seconds.</p>
      </a>
      <a href="/tools/exam-photo-signature-resizer" class="tool-card">
        <div class="tool-icon">🎓</div>
        <h3>Exam Photo & Signature</h3>
        <p>Official 200/300 DPI, exact dimensions, and KB limits for UPSC, SSC, IBPS, NEET, and PAN.</p>
      </a>
      <a href="/tools/compress-image-kb" class="tool-card">
        <div class="tool-icon">📉</div>
        <h3>Compress Image to KB</h3>
        <p>Smart binary search compression to fit strict portal requirements (under 20KB, 50KB, 100KB).</p>
      </a>
      <a href="/tools/image-converter" class="tool-card">
        <div class="tool-icon">🔄</div>
        <h3>Image Converter</h3>
        <p>Convert seamlessly between WebP, PNG, JPEG, and AVIF formats right in your memory.</p>
      </a>
      <a href="/tools/passport-photo-maker" class="tool-card">
        <div class="tool-icon">🛂</div>
        <h3>Passport Photo Maker</h3>
        <p>Create official 2x2 inch and 35x45mm printable passport photo sheets with cut borders.</p>
      </a>
      <a href="/tools/audio-trimmer" class="tool-card">
        <div class="tool-icon">🎵</div>
        <h3>Audio Trimmer</h3>
        <p>Trim MP3, WAV, and AAC voice memos client-side with millisecond waveform precision.</p>
      </a>
    </section>

    <section class="features">
      <div class="features-inner">
        <div class="feature">
          <h4>🔒 Absolute Confidentiality</h4>
          <p>Your bank statements, medical records, and ID proofs never touch external servers or cloud storage.</p>
        </div>
        <div class="feature">
          <h4>⚡ Zero Latency Processing</h4>
          <p>No uploading or downloading delays. Files process at local memory speed directly on your CPU/GPU.</p>
        </div>
        <div class="feature">
          <h4>📶 Offline-First Architecture</h4>
          <p>Powered by modern WebAssembly engines that run smoothly even without an active internet connection.</p>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <p>© 2026 FileBrik. All processing executed locally on device.</p>
    <div class="footer-links">
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms of Service</a>
      <a href="/contact">Contact</a>
    </div>
  </footer>
</body>
</html>`;

// ---------------------------------------------------------------------------
// Screen 2: S2-compress-pdf-desktop.html
// ---------------------------------------------------------------------------
const s2Html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compress PDF Client-Side - FileBrik</title>
  <style>
${tokensCss}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--fb-font-sans); background: var(--fb-bg); color: var(--fb-text-main); line-height: 1.5; }
    .header { background: var(--fb-surface); border-bottom: 1px solid var(--fb-border); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 1.35rem; font-weight: 800; color: var(--fb-primary); text-decoration: none; }
    .tool-layout { max-width: 1200px; margin: 2.5rem auto; padding: 0 1.5rem; display: grid; grid-template-columns: 1fr 300px; gap: 2rem; }
    .tool-container { background: var(--fb-surface); border: 1px solid var(--fb-border); border-radius: var(--fb-radius-xl); padding: 2.5rem; box-shadow: var(--fb-shadow-sm); }
    .tool-title { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
    .tool-desc { color: var(--fb-text-muted); font-size: 1rem; margin-bottom: 2rem; }
    .dropzone { border: 2px dashed var(--fb-border); border-radius: var(--fb-radius-lg); padding: 3.5rem 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; background: var(--fb-surface-alt); margin-bottom: 2rem; }
    .dropzone:hover { border-color: var(--fb-primary); background: var(--fb-primary-light); }
    .dropzone-icon { font-size: 3rem; margin-bottom: 1rem; }
    .dropzone h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
    .dropzone p { color: var(--fb-text-muted); font-size: 0.9rem; }
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--fb-text-main); }
    .select, .range { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--fb-border); border-radius: var(--fb-radius-md); font-size: 0.95rem; font-family: inherit; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; background: var(--fb-primary); color: white; padding: 0.85rem 2rem; border-radius: var(--fb-radius-md); font-size: 1rem; font-weight: 700; border: none; cursor: pointer; transition: background 0.2s; width: 100%; box-shadow: var(--fb-shadow-sm); }
    .btn:hover { background: var(--fb-primary-hover); }
    .ad-placeholder { background: var(--fb-surface); border: 1px solid var(--fb-border); border-radius: var(--fb-radius-lg); height: 600px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 1rem; color: var(--fb-text-light); font-size: 0.8rem; box-shadow: var(--fb-shadow-sm); }
    .badge-privacy { display: inline-flex; align-items: center; gap: 0.4rem; background: #ECFDF5; color: #047857; padding: 0.4rem 0.8rem; border-radius: var(--fb-radius-md); font-size: 0.85rem; font-weight: 700; margin-bottom: 1.5rem; }
  </style>
</head>
<body>
  <header class="header">
    <a href="/" class="logo">⚡ FileBrik</a>
  </header>

  <main class="tool-layout">
    <div class="tool-container">
      <div class="badge-privacy">🛡️ Processed 100% in your browser memory via pdf-lib</div>
      <h1 class="tool-title">Compress PDF File</h1>
      <p class="tool-desc">Drastically reduce file size without losing text sharpness or document formatting.</p>

      <div class="dropzone">
        <div class="dropzone-icon">📄</div>
        <h3>Drop your PDF file here</h3>
        <p>or click to browse from device (Up to 250MB)</p>
      </div>

      <div class="settings-grid">
        <div class="form-group">
          <label>Target Size Preset</label>
          <select class="select">
            <option>Balanced Compression (Recommended, ~50% reduction)</option>
            <option>Fit under 100 KB (Strict exam & portal requirement)</option>
            <option>Fit under 200 KB (Govt upload portals)</option>
            <option>Fit under 500 KB (Email attachment safe)</option>
            <option>Maximum Extreme Compression (Low DPI)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Image Quality Retention</label>
          <select class="select">
            <option>High Quality (150 DPI text & graphics)</option>
            <option>Medium Quality (96 DPI screen readable)</option>
            <option>Draft Quality (72 DPI minimum size)</option>
          </select>
        </div>
      </div>

      <button class="btn">Compress PDF Now</button>
    </div>

    <aside>
      <div class="ad-placeholder">
        <p>Sponsored Slot (CLS-Safe 300x600)</p>
        <span style="font-size: 0.7rem; margin-top: 0.5rem;">Reserved advertising container</span>
      </div>
    </aside>
  </main>
</body>
</html>`;

// ---------------------------------------------------------------------------
// Screen 3: S3-exam-resizer-mobile.html (Mobile 390px viewport)
// ---------------------------------------------------------------------------
const s3Html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>Exam Photo & Signature Resizer - FileBrik Mobile</title>
  <style>
${tokensCss}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--fb-font-sans); background: var(--fb-bg); color: var(--fb-text-main); line-height: 1.4; padding-bottom: 2rem; }
    .mobile-header { background: var(--fb-surface); border-bottom: 1px solid var(--fb-border); padding: 0.85rem 1rem; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 50; }
    .logo { font-size: 1.15rem; font-weight: 800; color: var(--fb-primary); text-decoration: none; }
    .container { padding: 1rem; }
    .badge { display: inline-block; background: #EEF2FF; color: var(--fb-primary); padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem; }
    h1 { font-size: 1.45rem; font-weight: 800; margin-bottom: 0.35rem; }
    p.sub { font-size: 0.85rem; color: var(--fb-text-muted); margin-bottom: 1.25rem; }
    .card { background: var(--fb-surface); border: 1px solid var(--fb-border); border-radius: var(--fb-radius-lg); padding: 1.25rem; margin-bottom: 1rem; box-shadow: var(--fb-shadow-sm); }
    .field-label { display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.03em; color: var(--fb-text-muted); }
    .preset-select { width: 100%; padding: 0.75rem; border: 1px solid var(--fb-primary); border-radius: var(--fb-radius-md); font-size: 0.9rem; font-weight: 600; background: #FAF5FF; margin-bottom: 1rem; color: #4F46E5; }
    .req-box { background: var(--fb-surface-alt); border-radius: var(--fb-radius-md); padding: 0.75rem; font-size: 0.8rem; margin-bottom: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    .req-item b { display: block; color: var(--fb-text-main); font-size: 0.85rem; }
    .dropzone-mobile { border: 2px dashed var(--fb-border); border-radius: var(--fb-radius-md); padding: 1.5rem 1rem; text-align: center; background: var(--fb-surface-alt); margin-bottom: 1rem; cursor: pointer; }
    .btn-mobile { width: 100%; background: var(--fb-primary); color: white; padding: 0.85rem; border-radius: var(--fb-radius-md); font-size: 0.95rem; font-weight: 700; border: none; box-shadow: var(--fb-shadow-sm); }
    .verified-pill { display: flex; align-items: center; gap: 0.25rem; color: #059669; font-size: 0.75rem; font-weight: 700; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <div class="mobile-header">
    <a href="/" class="logo">⚡ FileBrik</a>
    <span style="font-size: 0.8rem; font-weight: 700; color: #0D9488;">Client-Side</span>
  </div>

  <div class="container">
    <span class="badge">Official Exam Specs</span>
    <h1>Exam Photo & Signature Resizer</h1>
    <p class="sub">Auto-scale to exact dimension, KB limit, and 200/300 DPI for government exam forms.</p>

    <div class="card">
      <label class="field-label">Select Exam / Recruitment Portal</label>
      <select class="preset-select">
        <option>UPSC Civil Services (Photo: 20-300KB, Sig: 20-300KB)</option>
        <option>SSC CGL / CHSL (Photo: 20-50KB, Sig: 10-20KB)</option>
        <option>IBPS PO / Clerk (Photo: 20-50KB, Sig: 10-20KB)</option>
        <option>NTA NEET UG (Postcard 4x6 & Passport, 10-200KB)</option>
        <option>Passport Seva Kendra (4.5 x 3.5cm, Under 200KB)</option>
        <option>PAN Card NSDL / UTI (Photo 200 DPI, 20-50KB)</option>
      </select>

      <div class="req-box">
        <div class="req-item">Photo Specs:<b>3.5 x 4.5 cm (20-50 KB)</b></div>
        <div class="req-item">Signature Specs:<b>4.0 x 2.0 cm (10-20 KB)</b></div>
      </div>

      <label class="field-label">1. Upload Candidate Photograph</label>
      <div class="dropzone-mobile">
        <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">📸</div>
        <div style="font-size: 0.85rem; font-weight: 700;">Tap to select photo</div>
        <div style="font-size: 0.75rem; color: #64748B;">Auto-injects 200 DPI metadata</div>
      </div>

      <label class="field-label">2. Upload Signature</label>
      <div class="dropzone-mobile">
        <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">✍️</div>
        <div style="font-size: 0.85rem; font-weight: 700;">Tap to select signature</div>
        <div style="font-size: 0.75rem; color: #64748B;">Auto-crops to crisp black & white</div>
      </div>

      <button class="btn-mobile">Download Portal-Ready Files (ZIP)</button>
      <div class="verified-pill">✓ Verified against official 2026 examination notices</div>
    </div>
  </div>
</body>
</html>`;

// ---------------------------------------------------------------------------
// Screen 4: S4-privacy-desktop.html
// ---------------------------------------------------------------------------
const s4Html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Architecture & Policy - FileBrik</title>
  <style>
${tokensCss}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--fb-font-sans); background: var(--fb-bg); color: var(--fb-text-main); line-height: 1.6; }
    .header { background: var(--fb-surface); border-bottom: 1px solid var(--fb-border); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 1.35rem; font-weight: 800; color: var(--fb-primary); text-decoration: none; }
    .content-wrap { max-width: 820px; margin: 3rem auto; padding: 0 1.5rem; }
    .privacy-card { background: var(--fb-surface); border: 1px solid var(--fb-border); border-radius: var(--fb-radius-xl); padding: 3rem; box-shadow: var(--fb-shadow-sm); }
    h1 { font-size: 2.25rem; font-weight: 900; margin-bottom: 1rem; color: #0F172A; }
    .last-updated { font-size: 0.85rem; color: var(--fb-text-muted); margin-bottom: 2rem; }
    h2 { font-size: 1.4rem; font-weight: 800; margin: 2rem 0 0.75rem; color: var(--fb-text-main); border-bottom: 1px solid var(--fb-border); padding-bottom: 0.5rem; }
    p { margin-bottom: 1rem; color: #334155; }
    ul { margin-bottom: 1.5rem; padding-left: 1.5rem; color: #334155; }
    li { margin-bottom: 0.5rem; }
    .callout { background: #EEF2FF; border-left: 4px solid var(--fb-primary); padding: 1.25rem; border-radius: 0 var(--fb-radius-md) var(--fb-radius-md) 0; margin: 1.5rem 0; }
    .callout b { color: var(--fb-primary); }
  </style>
</head>
<body>
  <header class="header">
    <a href="/" class="logo">⚡ FileBrik</a>
  </header>

  <main class="content-wrap">
    <article class="privacy-card">
      <h1>Privacy Policy & Architecture</h1>
      <div class="last-updated">Effective Date: November 2026 • Version 1.0</div>

      <div class="callout">
        <b>Core Privacy Commitment:</b> FileBrik is built from the ground up on a strict client-side architecture. We do not possess, operate, or maintain any backend servers that accept or store your uploaded files.
      </div>

      <h2>1. Technical Architecture & File Processing</h2>
      <p>When you use any utility on FileBrik (such as Compress PDF, Exam Resizer, or Audio Trimmer), your files are processed entirely inside your web browser's local sandbox memory using client-side WebAssembly and HTML5 Canvas APIs.</p>
      <ul>
        <li><b>Zero Upload:</b> Your files never transit across the internet to our systems or third-party servers.</li>
        <li><b>Instant Deletion:</b> As soon as you close or reload the browser tab, all temporary memory allocations are destroyed by your device's operating system.</li>
        <li><b>Confidential Records:</b> You can safely process bank statements, tax filings, legal agreements, and biometric photos with complete peace of mind.</li>
      </ul>

      <h2>2. Web Analytics & Aggregated Metrics</h2>
      <p>We respect user anonymity. We do not deploy invasive third-party fingerprinting trackers. We collect minimal aggregate telemetry (such as page views, country of origin, and tool usage frequencies) to monitor platform health and optimize tool performance.</p>

      <h2>3. Advertising Standards & Disclosures</h2>
      <p>FileBrik is sustained via non-intrusive programmatic advertisements. All advertising containers adhere to Cumulative Layout Shift (CLS) safety standards and maintain reserved height boundaries to ensure a smooth reading experience. Legal, policy, and tool runner views maintain zero intrusive ad formats.</p>

      <h2>4. GDPR & CCPA Compliance</h2>
      <p>Because FileBrik does not ingest, transmit, or retain personal document files or personally identifiable information (PII) on backend infrastructure, we are GDPR and CCPA compliant by architectural design.</p>
    </article>
  </main>
</body>
</html>`;

// Write HTML files
fs.writeFileSync(path.join(exportsDir, 'S1-home-desktop.html'), s1Html);
fs.writeFileSync(path.join(exportsDir, 'S2-compress-pdf-desktop.html'), s2Html);
fs.writeFileSync(path.join(exportsDir, 'S3-exam-resizer-mobile.html'), s3Html);
fs.writeFileSync(path.join(exportsDir, 'S4-privacy-desktop.html'), s4Html);

console.log('Successfully written 4 HTML design screens in design/exports.');
