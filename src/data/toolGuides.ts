// src/data/toolGuides.ts
import type { FaqItem, LimitRow, RelatedTool } from '../components/ToolArticle.astro';

export interface ToolGuideData {
  howToTitle: string;
  steps: string[];
  limitsTitle: string;
  limits: LimitRow[];
  overviewParagraphs: string[];
  faqs: FaqItem[];
  relatedTools: RelatedTool[];
}

export const TOOL_GUIDES: Record<string, ToolGuideData> = {
  'compress-pdf': {
    howToTitle: 'How to Compress a PDF Inside Your Browser',
    steps: [
      'Click the PDF dropzone or drag a PDF document directly from your laptop or phone storage.',
      'Select your target size profile such as Government Upload (< 200 KB), Strict Portal (< 100 KB), or Email (< 500 KB).',
      'Press Compress PDF Now so pdf-lib parses cross-reference tables and packs uncompressed objects into dense object streams.',
      'Compare the before-and-after kilobyte telemetry card and save the newly generated compressed PDF to your device.',
    ],
    limitsTitle: 'Compression Mechanics & File Boundaries',
    limits: [
      { label: 'Recommended Input Size', value: 'Up to 200 MB depending on device RAM' },
      { label: 'Processing Library', value: 'Bundled pdf-lib with XRef Object Streams' },
      { label: 'Network Uploads', value: 'Zero bytes transmitted outside browser memory' },
      { label: 'Output Preservation', value: 'Retains vector text clarity and bookmarks' },
    ],
    overviewParagraphs: [
      'PDF files exported by office suites, tax portals, and scanner utilities frequently carry bloated duplicate font dictionaries, unindexed ASCII metadata streams, and redundant revision trailers left behind by incremental edits. Structural object-stream packing merges fragmented page objects into compressed deflate streams without rasterizing sharp vector text.',
      'For heavily photographed multi-megabyte documents where nearly all payload bytes reside inside raw bitmap streams, structural repacking alone cannot drop beneath a strict 100 KB cap. In those scenarios, extracting heavy scans with PDF to JPG, shrinking image dimensions, and rebuilding a slim document via JPG to PDF yields far steeper byte reductions.',
      'Preset options such as 100 KB Portal Limit, 200 KB Government Limit, and 500 KB Email Friendly benchmark your reduced output immediately so you know before leaving the tab whether structural cleanup met your submission threshold or whether image-level downsampling is needed.',
    ],
    faqs: [
      {
        q: 'Does PDF compression blur selectable text or signatures?',
        a: 'No. Because FileBrik uses pdf-lib structural object-stream packing rather than lossy screenshot re-encoding, vector fonts, vector lines, and digital text layers remain crisp at every zoom level.',
      },
      {
        q: 'Why can scanned PDFs stay larger than text PDFs after structural optimization?',
        a: 'A scanned PDF wraps embedded JPEG or PNG photographs inside a thin PDF container. Shrinking pure image scans requires downsampling pixel resolution before re-wrapping pages.',
      },
      {
        q: 'Can confidential bank statements and ITR filings be compressed safely?',
        a: 'Yes. File bytes stay inside temporary browser ArrayBuffers in local RAM and vanish immediately once you close or reload the browser tab.',
      },
      {
        q: 'What if structural compression still leaves my PDF slightly above 200 KB?',
        a: 'Extract large photo pages using PDF to JPG, shrink individual scan images inside Compress Image to KB, and wrap those compact pages back via JPG to PDF.',
      },
    ],
    relatedTools: [
      { label: 'Merge PDF Documents', href: '/tools/merge-pdf/' },
      { label: 'Split PDF Pages', href: '/tools/split-pdf/' },
      { label: 'PDF to JPG Converter', href: '/tools/pdf-to-jpg/' },
    ],
  },
  'merge-pdf': {
    howToTitle: 'How to Combine Multiple PDFs Offline',
    steps: [
      'Select two or more PDF files inside the multi-file selector in the exact order they should appear.',
      'Confirm the queued file count and per-document kilobyte breakdown shown in the staging box.',
      'Click Merge PDFs Now to instantiate a unified empty PDFDocument container and copy every source page cleanly.',
      'Download the combined multi-page PDF without watermarks, page caps, or remote server queues.',
    ],
    limitsTitle: 'Multi-Document Assembly Specifications',
    limits: [
      { label: 'Minimum Files Required', value: '2 PDF documents (no fixed upper count)' },
      { label: 'Page Orientation Handling', value: 'Preserves individual portrait and landscape MediaBoxes' },
      { label: 'Total Memory Budget', value: 'Up to ~200 MB combined browser heap' },
      { label: 'Watermark Policy', value: 'None — clean unmodified page trees' },
    ],
    overviewParagraphs: [
      'Combining application forms, academic transcripts, KYC identity proofs, and rent agreements traditionally meant uploading private paperwork to remote cloud queues. Browser-based assembly iterates through each local FileReader ArrayBuffer and copies page resources directly into a single master catalog using pdf-lib.',
      'Mixed page dimensions such as A4 portrait cover letters followed by landscape bank schedules remain intact because copyPages clones each source page dictionary individually. After combining large attachments, you can pass the combined packet through Split PDF or Compress PDF to match strict portal limits.',
      'When joining dozens of multi-page bank statements or scholarship certificates on older smartphones, load batches of 5 to 10 files per pass to keep mobile browser heap allocation smooth without triggering tab reloads. Inspect total merged page counts immediately inside the green completion banner before submitting your consolidated packet to external recruitment or visa uploaders.',
    ],
    faqs: [
      {
        q: 'Are page dimensions altered when joining different PDFs?',
        a: 'Each imported page retains its original width, height, and rotation attributes, avoiding awkward clipping when mixing portrait letters with landscape invoices.',
      },
      {
        q: 'Why is merging encrypted or password-locked PDFs restricted?',
        a: 'Password-protected documents encrypt internal stream objects. Remove any read password first so client-side code can read page trees legally on your device.',
      },
      {
        q: 'Does FileBrik impose a daily document limit?',
        a: 'No. Because computation happens solely on your CPU, there are zero server quotas, hourly cooldowns, or registration walls.',
      },
      {
        q: 'In what sequence are selected PDFs appended to the combined output?',
        a: 'Files append strictly in the numbered order shown inside the staging list, matching your exact selection sequence.',
      },
    ],
    relatedTools: [
      { label: 'Compress Merged PDF', href: '/tools/compress-pdf/' },
      { label: 'Split PDF Pages', href: '/tools/split-pdf/' },
      { label: 'JPG to PDF Converter', href: '/tools/jpg-to-pdf/' },
    ],
  },
  'split-pdf': {
    howToTitle: 'How to Extract Specific Page Ranges from a PDF',
    steps: [
      'Drop or choose a multi-page PDF booklet from your local drive.',
      'Type 1-based page numbers or hyphenated spans inside Page Range (for example 1-3, 5, 8-10).',
      'Select Split PDF so the local parser resolves valid 1-based indices against total page count and copies only matched pages.',
      'Download the trimmed standalone PDF named after your original file.',
    ],
    limitsTitle: 'Range Syntax & Parser Constraints',
    limits: [
      { label: 'Indexing Convention', value: '1-based human page numbering (page 1 = first page)' },
      { label: 'Supported Expressions', value: 'Single numbers (2), ranges (1-4), comma lists (1,3-5)' },
      { label: 'Out-of-Bounds Clamping', value: 'Automatically clamped to [1, totalPages]' },
      { label: 'Source File Mutation', value: 'Read-only — original file stays untouched' },
    ],
    overviewParagraphs: [
      'Government notification PDFs and consolidated textbook downloads often exceed dozens of pages even when an applicant only needs a two-page annexure or fee receipt. Extracting exact page subsets offline eliminates unnecessary file bulk while keeping confidential records off shared cloud hosts.',
      'Our range tokenizer splits comma-delimited tokens, expands inclusive start-to-end spans in order, removes duplicate indices with a Set, and safely skips negative or out-of-range indexes rather than throwing cryptic parser crashes.',
      'Because pdf-lib copies only selected page tree nodes and dependent font or XObject resources into a clean container, sensitive salary slips or personal cover letters left outside your chosen span never remain hidden inside unreferenced trailers. You can extract single cover certificates or multiple comma-separated annexure ranges rapidly on desktop or mobile browsers.',
    ],
    faqs: [
      {
        q: 'How should I format multiple non-contiguous ranges?',
        a: 'Separate ranges and single pages using commas with no trailing separators, such as 1, 4-6, 12.',
      },
      {
        q: 'Does extracting fewer pages automatically lower file size?',
        a: 'Yes, dropping unwanted pages strips unreferenced image streams and page trees cleanly, often cutting size proportionally.',
      },
      {
        q: 'What happens if I type a page number larger than the PDF?',
        a: 'Out-of-bounds numbers are ignored or clamped safely so extraction never fails silently; if zero valid pages match, page 1 is extracted as a safe fallback.',
      },
      {
        q: 'Are bookmarks and selectable fonts preserved inside the extracted PDF?',
        a: 'Yes. Extracted pages copy their exact vector drawing instructions and embedded fonts verbatim without rasterizing text.',
      },
    ],
    relatedTools: [
      { label: 'Merge PDF Files', href: '/tools/merge-pdf/' },
      { label: 'Compress PDF Size', href: '/tools/compress-pdf/' },
      { label: 'PDF to JPG Converter', href: '/tools/pdf-to-jpg/' },
    ],
  },
  'jpg-to-pdf': {
    howToTitle: 'How to Package Photos & Receipts into One PDF',
    steps: [
      'Select one or multiple JPG, PNG, or WebP images from your phone gallery or desktop.',
      'Check the selected image count badge displayed inside the dropzone panel.',
      'Press Convert to PDF so each image is drawn onto a clean white canvas, normalized as opaque JPEG, and embedded as a full-bleed PDF page.',
      'Download your portable multi-page PDF ready for job portals, university admissions, or visa uploads.',
    ],
    limitsTitle: 'Image-to-PDF Conversion Standards',
    limits: [
      { label: 'Accepted Image Inputs', value: 'JPEG, PNG (including transparent alpha), WebP' },
      { label: 'Alpha Transparency Fill', value: 'Flattened onto pure white #FFFFFF background' },
      { label: 'Page Dimensions', value: 'Matched 1:1 to each image natural pixel aspect ratio' },
      { label: 'Server Transmission', value: '0 KB — runs strictly inside local Canvas + pdf-lib' },
    ],
    overviewParagraphs: [
      'Online admission portals and tax verification workflows commonly reject raw PNG screenshots or demand a single PDF bundle for front-and-back ID cards. Rendering each source image onto an opaque HTML5 Canvas before calling pdf-lib embedJpg guarantees transparent PNG backgrounds never turn solid black inside strict PDF viewers.',
      'Matching every PDF page width and height to the embedded image pixel dimensions ensures sharp full-bleed framing without white sidebars or letterbox cropping when printed or inspected on administrative dashboards.',
      'Users compiling KYC packets, rental leases, or university certificate portfolios can combine portrait phone snaps alongside flat scanned receipts cleanly in one pass without creating accounts or exposing raw scans to third-party upload buckets.',
    ],
    faqs: [
      {
        q: 'Why does FileBrik normalize PNG and WebP files before embedding into PDF?',
        a: 'PDFium and mobile viewers occasionally render transparent PNG alpha masks as dark boxes. Painting onto a #FFFFFF canvas first guarantees clean readable pages.',
      },
      {
        q: 'Can I shrink the output PDF if a portal rejects files over 200 KB?',
        a: 'Yes — compress individual source scans to 40–80 KB first using Compress Image to KB, or pass the built document through Compress PDF.',
      },
      {
        q: 'Do uploaded Aadhaar, PAN, or mark-sheet scans ever reach FileBrik servers?',
        a: 'Never. FileBrik ships static HTML and client JavaScript only; zero file bytes ever traverse the network.',
      },
      {
        q: 'Can multiple smartphone photos be packed into a single multi-page PDF?',
        a: 'Yes. Select multiple images simultaneously in the picker and each image automatically creates its own sequentially numbered PDF page.',
      },
    ],
    relatedTools: [
      { label: 'Compress Image to KB', href: '/tools/compress-image-kb/' },
      { label: 'Merge Multiple PDFs', href: '/tools/merge-pdf/' },
      { label: 'PDF to JPG Extractor', href: '/tools/pdf-to-jpg/' },
    ],
  },
  'pdf-to-jpg': {
    howToTitle: 'How to Render PDF Pages as High-Resolution Images',
    steps: [
      'Pick or drop any single-page or multi-page PDF document into the browser staging zone.',
      'Choose target render scale (1x Standard, 2x Crisp HD, or 3x Print Sharpness) and output format (JPEG or PNG).',
      'Click Convert PDF Pages to trigger lazy in-memory PDF.js rasterization across every page onto an isolated Canvas.',
      'Download any individual page thumbnail or grab page 1 directly at full raster resolution.',
    ],
    limitsTitle: 'PDF Rasterization Engine Parameters',
    limits: [
      { label: 'Rendering Engine', value: 'Bundled Mozilla PDF.js worker executing offline in browser' },
      { label: 'Output Formats', value: 'Lossy JPEG (92% quality) or Lossless PNG' },
      { label: 'Scale Multiplier', value: '1.0x (72 DPI base), 1.5x, 2.0x (~144 DPI), or 3.0x' },
      { label: 'Maximum Pages Per Pass', value: 'All document pages rendered sequentially to memory' },
    ],
    overviewParagraphs: [
      'Extracting an individual chart, certificate, or signed declaration from a PDF into a standard JPEG allows effortless pasting into presentations, social posts, and strict image-only upload forms. Lazy loading Mozilla PDF.js keeps initial page load instant while unlocking full vector, font, and shading rasterization on demand.',
      'Each PDF page is drawn sequentially at the requested viewport scale onto a temporary white HTMLCanvasElement and encoded with canvas.toBlob, avoiding memory spikes even on mobile phones.',
      'Once pages render into JPEG or lossless PNG cards, you can pass individual page exports straight into our Compress Image to KB or Exam Photo Resizer workflows whenever downstream application forms enforce tight kilobyte bounds.',
    ],
    faqs: [
      {
        q: 'Which resolution scale should I pick for exam documents or mark sheets?',
        a: 'Use 2.0x (Crisp HD Default) for readable small print, or 1.0x when feeding results straight into strict kilobyte upload forms.',
      },
      {
        q: 'Does PDF to JPG support multi-page documents?',
        a: 'Yes. Every page is rasterized in sequence and listed with its own download button and pixel dimensions.',
      },
      {
        q: 'Is any remote rendering API called during conversion?',
        a: 'No. Both the PDF parser and worker run locally on your machine using static bundled assets.',
      },
      {
        q: 'Why choose JPEG versus PNG output for scanned pages?',
        a: 'JPEG yields much smaller files ideal for photography and portal forms, whereas lossless PNG retains sharper pixel edges around monochrome tables and bar charts.',
      },
    ],
    relatedTools: [
      { label: 'JPG to PDF Converter', href: '/tools/jpg-to-pdf/' },
      { label: 'Compress Image to KB', href: '/tools/compress-image-kb/' },
      { label: 'Split PDF Pages', href: '/tools/split-pdf/' },
    ],
  },
  'exam-photo-signature-resizer': {
    howToTitle: 'How to Prepare Exam Photos & Signatures to Official Specs',
    steps: [
      'Select your portal preset such as UPSC, SSC, IBPS RRB, NEET NTA, UPPSC, BPSC, or Passport Seva.',
      'Check the displayed Official Notice card showing verbatim PDF bounds, pixel sizes, DPI requirement, and portal PDF link.',
      'Upload your candidate photograph, inked white-paper signature, or thumb impression image.',
      'Click Auto-Resize & Inject DPI to run dimension fitting, JPEG KB binary search, 200/300 DPI JFIF injection, and download your compliant JPEG.',
    ],
    limitsTitle: 'Official Portal Calibration Rules',
    limits: [
      { label: 'Verified Official Portals', value: '14 presets verified verbatim against portal PDFs; 6 flagged notices' },
      { label: 'KB Range Accuracy', value: 'JPEG binary search + COM segment padding inside [minKB, maxKB]' },
      { label: 'Metadata Embedded', value: 'JFIF APP0 200 DPI / 300 DPI binary resolution tags' },
      { label: 'PAN Card Notice Status', value: 'Flagged "check official notice" (portal PDF WAF blocked)' },
    ],
    overviewParagraphs: [
      'Indian recruitment portals including UPSC, IBPS, NTA NEET, and state Public Service Commissions run automated validator scripts checking not only kilobyte boundaries (often 10–20 KB or 20–50 KB) but also exact pixel geometry and embedded JFIF DPI headers. Standard OS painters strip DPI metadata and miss strict lower KB floors.',
      'FileBrik executes a two-phase pipeline inside browser memory: adaptive Canvas scaling locks pixel width and height inside official bounds, 12-iteration binary search converges JPEG quality into [minKB, maxKB], and our binary injector writes valid APP0 JFIF DPI bytes without altering pixel content. Unverified or live-camera portals keep explicit "Check Official Notice" warnings and direct official PDF references.',
    ],
    faqs: [
      {
        q: 'Why do some portals fail when a photo is under the minimum KB limit?',
        a: 'Blank signatures and plain white backgrounds compress efficiently below 10 KB, failing lower-bound checks like 10–20 KB. FileBrik pads harmless JPEG COM comment bytes inside APP0/FE markers so the output validates cleanly inside range.',
      },
      {
        q: 'Why are SSC Photo, RRB Photo, and PAN marked "Check Official Notice"?',
        a: 'Recent SSC and RRB CEN notifications migrated candidate photographs to live webcam capture, while Income Tax PAN PDFs block automated extraction. Always verify your live notification PDF link displayed on the card.',
      },
      {
        q: 'Are candidate photos uploaded or cached anywhere?',
        a: 'No. Passport photos, signatures, and thumb impressions remain inside local browser Canvas buffers only.',
      },
    ],
    relatedTools: [
      { label: 'Passport Photo Maker (630×810)', href: '/tools/passport-photo-maker/' },
      { label: 'Compress Image to Exact KB', href: '/tools/compress-image-kb/' },
      { label: 'Image Format Converter', href: '/tools/image-converter/' },
    ],
  },
  'compress-image-kb': {
    howToTitle: 'How to Hit Exact Minimum & Maximum KB Bounds',
    steps: [
      'Upload any JPG, PNG, or WebP photograph from your device.',
      'Choose a quick portal preset (20–50 KB, 10–20 KB, 50–100 KB, 100–200 KB) or type custom Minimum KB and Maximum KB targets.',
      'Click Compress to Target KB so the solver iterates Canvas quality and adaptive scaling until byte size lands inside [minKB, maxKB].',
      'Inspect the original vs. compressed size summary and save the resulting JPEG.',
    ],
    limitsTitle: 'Adaptive KB Solver Parameters',
    limits: [
      { label: 'Target Bounds Supported', value: '2 KB minimum up to 10,000 KB maximum' },
      { label: 'Algorithm', value: '12-step JPEG quality binary search + sqrt dimension scaling' },
      { label: 'Floor Protection', value: 'Gentle upscaling pass when max quality falls below minKB' },
      { label: 'Transparency Handling', value: 'Alpha pixels flattened onto #FFFFFF prior to JPEG encode' },
    ],
    overviewParagraphs: [
      'Most image compressors only offer vague "low / medium / high" sliders that leave users guessing until an upload form rejects the file. Web-form validators frequently enforce tight two-sided windows such as "greater than 20 KB and under 50 KB".',
      'Our solver tests boundary JPEG quality levels first; if even quality 0.05 exceeds your maximum KB ceiling, it shrinks pixel width and height proportionally using area-ratio square-root scaling before running a fresh binary search. Conversely, tiny PNG scans under the minimum KB floor receive controlled canvas upsampling.',
      'Common presets covering exam photos (20–50 KB), strict signatures (10–20 KB), KYC identity scans (50–100 KB), and NTA NEET postcards (100–200 KB) populate exact bounds in one click while allowing manual overrides down to 2 KB.',
    ],
    faqs: [
      {
        q: 'Will hitting 20–50 KB cut resolution noticeably on a 12MP phone photo?',
        a: 'Shrinking a 4000×3000 phone photo to web-portal dimensions (~600–900 px wide) retains facial clarity far better than crushing a giant resolution at 5% quality.',
      },
      {
        q: 'Why does the output always save as JPEG (.jpg)?',
        a: 'JPEG exposes predictable perceptual quality quantization curves needed for fine-grained KB convergence, unlike lossless PNG.',
      },
      {
        q: 'Can I also inject 200 or 300 DPI for government forms?',
        a: 'Yes — use our Exam Photo & Signature Resizer when portals specifically enforce JFIF DPI headers alongside pixel bounds.',
      },
      {
        q: 'What if an already tiny image compresses smaller than my Minimum KB field?',
        a: 'The outer convergence pass gently scales the canvas dimension ceiling and quality setting upward so output file weight lands inside your lower KB requirement.',
      },
    ],
    relatedTools: [
      { label: 'Exam Photo & Signature Resizer', href: '/tools/exam-photo-signature-resizer/' },
      { label: 'Image Format Converter', href: '/tools/image-converter/' },
      { label: 'Passport Photo Maker', href: '/tools/passport-photo-maker/' },
    ],
  },
  'image-converter': {
    howToTitle: 'How to Convert Between WebP, JPEG, and PNG',
    steps: [
      'Drop any PNG, JPEG, WebP, GIF, or AVIF image readable by your browser.',
      'Choose your destination MIME format: modern WebP, universal JPEG, or lossless transparent PNG.',
      'Adjust the quality slider (20%–100%, default 85%) for WebP and JPEG outputs.',
      'Click Convert Image to re-encode directly via local Canvas pixel buffers and download immediately.',
    ],
    limitsTitle: 'Codec & Format Conversion Matrix',
    limits: [
      { label: 'WebP Encoding', value: 'Verified RIFF/WEBP container via native Chromium/browser codec' },
      { label: 'PNG Encoding', value: 'Lossless 32-bit RGBA preserving crisp alpha transparency' },
      { label: 'JPEG Encoding', value: 'Flattened RGB with white backdrop for portals rejecting WebP' },
      { label: 'Resolution', value: '1:1 pixel dimensions preserved — zero forced cropping' },
    ],
    overviewParagraphs: [
      'Modern smartphone cameras and web downloads increasingly save images as HEIC or WebP, which older university admission portals and HR forms frequently reject. Conversely, web developers converting heavy PNG screenshots into modern WebP routinely shrink page payload weight by 40% to 75% without noticeable visual degradation.',
      'FileBrik renders decoded pixels cleanly at original dimensions onto an offscreen canvas and invokes browser-native hardware-accelerated encoders, keeping every converted frame strictly private inside client RAM.',
      'Using the manual quality slider between 75% and 90% balances near-lossless edge crispness with rapid Core Web Vitals loading performance when converting hero assets, diagrams, or product snapshots into WebP. Unlike legacy server converters that inject compression watermarks or queue your photos behind timed wait screens, FileBrik encodes pure browser-memory buffers immediately on every click.',
    ],
    faqs: [
      {
        q: 'Does converting transparent PNG to WebP keep transparency?',
        a: 'Yes. FileBrik only paints a #FFFFFF backdrop when encoding JPEG (which lacks an alpha channel), so WebP and PNG preserve transparent pixels cleanly.',
      },
      {
        q: 'Does changing format change width or height in pixels?',
        a: 'No. Width and height remain identical to the natural source image.',
      },
      {
        q: 'How do I verify an exported WebP is authentic rather than a renamed file?',
        a: 'Every FileBrik WebP file begins with valid RIFF....WEBP binary container signatures written directly by Canvas.toBlob.',
      },
      {
        q: 'When should I pick PNG instead of JPEG or WebP?',
        a: 'Pick PNG when editing logos, crisp monochrome line drawings, or overlays requiring lossless zero-artifact transparency without sacrificing sharp font or diagram strokes across presentation slides or print layouts.',
      },
    ],
    relatedTools: [
      { label: 'Compress Image to KB', href: '/tools/compress-image-kb/' },
      { label: 'JPG to PDF Converter', href: '/tools/jpg-to-pdf/' },
      { label: 'Passport Photo Maker', href: '/tools/passport-photo-maker/' },
    ],
  },
  'passport-photo-maker': {
    howToTitle: 'How to Create a 630×810 or 4×6 Printable Passport Sheet',
    steps: [
      'Upload a front-facing portrait taken under even lighting against a plain white or light neutral background.',
      'Pick an official standard: 630×810 px (India Passport Seva 35×45 mm), 600×600 px (USA/OCI 2×2 in), or 413×531 px (UK/Schengen).',
      'Click Generate Passport Photo to apply automatic center-cover cropping, 300 DPI JFIF injection, and build an 8-up 4×6 print sheet.',
      'Download either the single digital JPEG for portal uploads or the 1800×1200 px 4×6 sheet for local lab printing.',
    ],
    limitsTitle: 'Biometric & Print Sheet Specifications',
    limits: [
      { label: 'India / Passport Seva Size', value: '630 × 810 px (exact 35×45 mm aspect at 300+ DPI)' },
      { label: 'USA / OCI Square Size', value: '600 × 600 px (2 × 2 inch at 300 DPI)' },
      { label: 'UK / Schengen Preset', value: '413 × 531 px (35 × 45 mm at 300 DPI)' },
      { label: 'Printable Collage Sheet', value: '1800 × 1200 px (4 × 6 in @ 300 DPI) with 8 cut-lined tiles' },
    ],
    overviewParagraphs: [
      'Paying studio fees solely to crop a smartphone headshot to 35×45 mm or align eight copies onto a 4×6 postcard layout is unnecessary. Cover-cropping preserves portrait aspect proportions without stretching or squishing facial features while trimming excess side walls.',
      'After cropping cleanly to exact pixel dimensions, FileBrik injects 300 DPI JFIF resolution headers so both digital visa uploaders and brick-and-mortar lab printers recognize exact physical print dimensions automatically.',
      'Always capture source portraits facing soft window light roughly one meter away from a smooth matte background so harsh shadows do not interfere with automated biometric face-framing algorithms.',
    ],
    faqs: [
      {
        q: 'How is the 4×6 printable sheet laid out?',
        a: 'It renders a 1800×1200 pixel canvas (6 inches by 4 inches at 300 DPI) containing 2 rows of 4 cleanly bordered passport portraits ready for standard ₹10–₹20 kiosk prints.',
      },
      {
        q: 'Does Passport Seva require a specific KB size for 630×810 uploads?',
        a: 'Official Passport Seva guidelines mandate 630×810 px JPEG format; if your regional upload portal adds a strict KB cap, run the single image through Compress Image to KB afterward.',
      },
      {
        q: 'Are biometric portraits stored or used for face recognition training?',
        a: 'Never. Cropping and JPEG encoding occur strictly in temporary browser memory.',
      },
      {
        q: 'Why choose 600×600 versus 630×810 dimensions?',
        a: 'Use 630×810 px (35×45 mm) for Indian Passport Seva, PAN/visa biometrics, or Schengen filings, and 600×600 px (2×2 inch) for US Visa, DS-160, and OCI applications.',
      },
    ],
    relatedTools: [
      { label: 'Exam Photo & Signature Resizer', href: '/tools/exam-photo-signature-resizer/' },
      { label: 'Compress Image to KB', href: '/tools/compress-image-kb/' },
      { label: 'Image Format Converter', href: '/tools/image-converter/' },
    ],
  },
  'audio-trimmer': {
    howToTitle: 'How to Cut & Export Audio Clips Using Web Audio API',
    steps: [
      'Select an MP3, WAV, OGG, AAC, or M4A audio file from local storage.',
      'Check the detected audio duration and sample rate decoded cleanly inside browser memory.',
      'Enter precise Start Time (seconds) and End Time (seconds) for the clip you want to keep.',
      'Click Trim & Export WAV to slice the decoded PCM channel arrays and generate a standards-compliant 16-bit WAV file offline.',
    ],
    limitsTitle: 'In-Browser Audio Slicing Specifications',
    limits: [
      { label: 'Decoding Engine', value: 'Browser native AudioContext.decodeAudioData()' },
      { label: 'Output Container', value: 'Uncompressed 16-bit PCM RIFF/WAVE (.wav)' },
      { label: 'Trim Precision', value: 'Exact sample-frame accuracy (down to 1/sampleRate sec)' },
      { label: 'Channel Support', value: 'Mono and multi-channel stereo preserved verbatim' },
    ],
    overviewParagraphs: [
      'Extracting a concise ringtone, trimming awkward silence from the start of a voice memo, or cutting a clean quote from a recorded interview usually requires bloated desktop audio suites or uploading private recordings to cloud converters. Modern browsers natively expose Web Audio decoding APIs capable of reading decoded PCM Float32Array samples directly in JavaScript.',
      'FileBrik decodes your source track purely in memory, calculates exact integer startFrame and endFrame sample indices from your timestamps, clamps safely inside track duration, interleaves stereo or mono samples into 16-bit signed integers, and prepends a valid 44-byte RIFF/WAVE header for instant lossless playback.',
    ],
    faqs: [
      {
        q: 'Why does the trimmed download export in WAV format instead of MP3?',
        a: 'Every major browser supports zero-dependency lossless PCM WAV generation natively via Web Audio, whereas clean client-side MP3 encoders add heavy WASM payloads that slow mobile performance.',
      },
      {
        q: 'What happens if End Time exceeds the actual track duration?',
        a: 'End Time automatically clamps to the detected audio duration and guarantees at least a 0.1-second slice so the exported WAV always contains valid playable samples.',
      },
      {
        q: 'Are private voice memos uploaded during audio decoding?',
        a: 'No. Audio decoding, frame slicing, and RIFF header construction occur 100% inside local browser RAM.',
      },
    ],
    relatedTools: [
      { label: 'Compress PDF Online', href: '/tools/compress-pdf/' },
      { label: 'Image Format Converter', href: '/tools/image-converter/' },
      { label: 'Passport Photo Maker', href: '/tools/passport-photo-maker/' },
    ],
  },
};

export function buildToolJsonLd(slug: string, title: string, description: string) {
  const canonical = `https://filebrik.pages.dev/tools/${slug}/`;
  const guide = TOOL_GUIDES[slug];
  const webApp = {
    '@type': 'WebApplication',
    name: title,
    url: canonical,
    description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
  const faqLd = guide?.faqs?.length
    ? {
        '@type': 'FAQPage',
        mainEntity: guide.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null;
  const crumbs = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://filebrik.pages.dev/' },
      { '@type': 'ListItem', position: 2, name: title, item: canonical },
    ],
  };
  return faqLd ? [webApp, faqLd, crumbs] : [webApp, crumbs];
}
