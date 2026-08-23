import { Booking, Trip } from '../types';

/* ─────────────────────────────────────────────────────────────────────────────
 *  html2pdf.js  – lazy CDN loader
 * ─────────────────────────────────────────────────────────────────────────── */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    html2pdf?: any;
  }
}

let html2pdfLoading: Promise<void> | null = null;

function loadHtml2Pdf(): Promise<void> {
  if (window.html2pdf) return Promise.resolve();
  if (html2pdfLoading) return html2pdfLoading;

  html2pdfLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load html2pdf.js'));
    document.head.appendChild(script);
  });

  return html2pdfLoading;
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  Helpers
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * Fetches an image URL and returns a base64 data-URI so html2canvas never
 * has to deal with cross-origin requests (which it often blocks).
 * Returns null on any failure so the caller can skip the image gracefully.
 */
async function toBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  Itinerary PDF  – direct download, no print dialog
 * ─────────────────────────────────────────────────────────────────────────── */
export async function downloadItineraryPDF(trip: Trip): Promise<void> {
  await loadHtml2Pdf();

  // Pre-fetch cover image as base64 so html2canvas has no CORS issues
  const coverBase64 = trip.imageUrl ? await toBase64(trip.imageUrl) : null;

  const brandDark  = '#3A4D39';
  const brandSage  = '#739072';
  const brandCream = '#F9F5EB';
  const brandBeige = '#ECE3CE';
  const accent1    = '#D4A853'; // gold
  const accent2    = '#5B8FA8'; // teal

  /* ── Day rows HTML ── */
  const dayColors = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722'];
  const dayRows = (trip.itinerary ?? []).map((day, i) => {
    const col = dayColors[i % dayColors.length];
    const activities = (day.activities ?? [])
      .map(a => `<li style="margin:4px 0 4px 0;padding-left:12px;border-left:2px solid ${col}40;font-size:12px;color:#333;">${escHtml(a)}</li>`)
      .join('');
    return `
      <div style="margin-bottom:20px;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <div style="background:${col};padding:10px 18px;display:flex;align-items:center;gap:12px;">
          <div style="background:white;color:${col};font-weight:900;font-size:16px;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${day.day}</div>
          <span style="font-size:14px;font-weight:700;color:white;letter-spacing:0.5px;">${escHtml(day.title)}</span>
        </div>
        <div style="background:#fff;padding:14px 18px;">
          <ul style="list-style:none;margin:0;padding:0;">${activities}</ul>
        </div>
      </div>`;
  }).join('');

  /* ── Inclusions / Exclusions ── */
  const inclRows = (trip.inclusions ?? [])
    .map(i => `<li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;font-size:12px;"><span style="color:#4CAF50;font-size:14px;flex-shrink:0;">✓</span>${escHtml(i)}</li>`)
    .join('');
  const exclRows = (trip.exclusions ?? [])
    .map(i => `<li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;font-size:12px;"><span style="color:#f44336;font-size:14px;flex-shrink:0;">✗</span>${escHtml(i)}</li>`)
    .join('');

  /* ── Highlights ── */
  const highlights = (trip.highlights ?? []).map(h =>
    `<span style="display:inline-block;background:${brandSage}20;border:1px solid ${brandSage}40;border-radius:20px;padding:3px 12px;font-size:11px;color:${brandDark};margin:3px;">${escHtml(h)}</span>`
  ).join('');

  /* ── Pickup Points ── */
  const pickups = (trip.pickupPoints ?? []).length > 0
    ? `<div style="margin-top:24px;background:${brandDark};color:${brandCream};border-radius:8px;padding:18px 20px;">
        <h4 style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;opacity:0.7;margin:0 0 12px;">🚌 Boarding Points</h4>
        ${(trip.pickupPoints ?? []).map((p, i) =>
          `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <div style="width:8px;height:8px;border-radius:50%;background:${accent1};flex-shrink:0;"></div>
            <span style="font-size:13px;">${escHtml(p)}</span>
          </div>`
        ).join('')}
       </div>`
    : '';

  /* ── Dates ── */
  const datesHtml = (trip.dates ?? []).length > 0
    ? (trip.dates ?? []).map(d => `<span style="display:inline-block;background:${accent2}20;border:1px solid ${accent2}50;border-radius:4px;padding:3px 10px;font-size:11px;color:${accent2};font-weight:700;margin:3px;font-family:monospace;">${escHtml(d)}</span>`).join('')
    : `<span style="font-size:12px;color:#888;">Contact us for upcoming dates</span>`;

  const imageSection = coverBase64
    ? `<div style="height:240px;overflow:hidden;border-radius:0 0 8px 8px;margin-bottom:0;">
         <img src="${coverBase64}" alt="${escHtml(trip.title)}" style="width:100%;height:100%;object-fit:cover;" />
       </div>`
    : '';

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Itinerary – ${escHtml(trip.title)}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, Helvetica, sans-serif; background: #f5f5f0; color: #222; }
    ul { list-style: none; }
    h1,h2,h3,h4 { font-family: Georgia, serif; }
  </style>
</head>
<body>
  <!-- Cover Header -->
  <div style="background:${brandDark};color:${brandCream};padding:28px 32px 20px;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-20px;right:-20px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.04);"></div>
    <div style="position:absolute;bottom:-40px;left:40%;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,0.03);"></div>
    <!-- Brand -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;position:relative;z-index:1;">
      <div>
        <div style="font-size:22px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:${brandCream};">🏕️ Wheels to Wilderness</div>
        <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;opacity:0.5;margin-top:2px;">Let's Get Lost Together</div>
      </div>
      <div style="text-align:right;">
        <div style="background:${accent1};color:${brandDark};font-size:9px;font-weight:900;letter-spacing:2px;text-transform:uppercase;padding:4px 14px;border-radius:20px;">Itinerary</div>
        <div style="font-size:9px;opacity:0.4;margin-top:4px;">Generated ${new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
      </div>
    </div>
    <!-- Trip Title -->
    <div style="position:relative;z-index:1;">
      <h1 style="font-size:28px;font-weight:900;color:${accent1};line-height:1.2;margin-bottom:8px;">${escHtml(trip.title)}</h1>
      <div style="display:flex;gap:20px;flex-wrap:wrap;font-size:12px;opacity:0.75;">
        <span>📍 ${escHtml(trip.location)}</span>
        <span>⏱ ${escHtml(trip.duration)}</span>
        <span>💰 ₹${(trip.price ?? 0).toLocaleString('en-IN')} / person</span>
      </div>
    </div>
  </div>

  <!-- Cover Image -->
  ${imageSection}

  <!-- Main Content -->
  <div style="padding:28px 32px;">

    <!-- Description -->
    <div style="background:white;border-radius:8px;padding:20px 24px;margin-bottom:24px;border-left:4px solid ${brandSage};box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <h2 style="font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${brandSage};margin-bottom:10px;">About This Trip</h2>
      <p style="font-size:13px;line-height:1.8;color:#444;">${escHtml(trip.description ?? '')}</p>
    </div>

    <!-- Highlights -->
    ${(trip.highlights ?? []).length > 0 ? `
    <div style="margin-bottom:24px;">
      <h2 style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${brandDark};margin-bottom:12px;border-bottom:2px solid ${brandDark}20;padding-bottom:6px;">✨ Highlights</h2>
      <div>${highlights}</div>
    </div>` : ''}

    <!-- Dates -->
    <div style="background:white;border-radius:8px;padding:16px 20px;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <h2 style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${accent2};margin-bottom:10px;">📅 Available Dates</h2>
      <div>${datesHtml}</div>
    </div>

    <!-- Day-by-Day Itinerary -->
    ${(trip.itinerary ?? []).length > 0 ? `
    <div style="margin-bottom:24px;">
      <h2 style="font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${brandDark};margin-bottom:16px;border-bottom:2px solid ${brandDark}20;padding-bottom:8px;">🗓️ Day-by-Day Itinerary</h2>
      ${dayRows}
    </div>` : ''}

    <!-- Inclusions / Exclusions -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
      <div style="background:white;border-radius:8px;padding:16px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4CAF50;margin-bottom:12px;">✓ Included</h3>
        <ul>${inclRows || '<li style="font-size:12px;color:#888;">Contact us for details</li>'}</ul>
      </div>
      <div style="background:white;border-radius:8px;padding:16px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#f44336;margin-bottom:12px;">✗ Not Included</h3>
        <ul>${exclRows || '<li style="font-size:12px;color:#888;">Contact us for details</li>'}</ul>
      </div>
    </div>

    <!-- Boarding Points -->
    ${pickups}

    <!-- Price Box -->
    <div style="background:linear-gradient(135deg,${brandDark} 0%,${brandSage} 100%);border-radius:8px;padding:20px 24px;margin-top:${pickups ? '24px' : '0'};color:white;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;opacity:0.7;">Starting from</div>
        <div style="font-size:30px;font-weight:900;font-family:monospace;">₹${(trip.price ?? 0).toLocaleString('en-IN')}</div>
        <div style="font-size:10px;opacity:0.6;">per person + GST</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:10px;opacity:0.7;margin-bottom:4px;">wheelstowilderness.in</div>
        <div style="font-size:11px;font-weight:700;">📞 +91 96064 99422</div>
        <div style="font-size:11px;">📧 experiences@wheelstowilderness.in</div>
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div style="background:${brandBeige};padding:14px 32px;text-align:center;border-top:1px solid ${brandDark}20;">
    <div style="font-size:10px;color:${brandDark};opacity:0.5;letter-spacing:1px;">
      Wheels to Wilderness • wheelstowilderness.in • Crafted with ❤️ for adventure seekers
    </div>
  </div>
</body>
</html>`;


  const opts = {
    margin:      [0, 0, 0, 0],
    filename:    `${trip.title.replace(/[^a-z0-9]/gi, '_')}_Itinerary.pdf`,
    image:       { type: 'jpeg', quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: false,   // false because all images are already base64 data URIs
      logging: false,
      imageTimeout: 0,  // disable per-image timeout
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  // Pass the raw HTML string – html2pdf creates its own sandboxed iframe
  // so html2canvas can capture it properly.
  await window.html2pdf().set(opts).from(htmlContent, 'string').save();
}



const BRAND_DARK  = '#3A4D39';  // forest green – used for ticket main panel
const BRAND_SAGE  = '#739072';  // medium green – accents (reserved for future use)
const BRAND_CREAM = '#F9F5EB';  // off-white / light text on dark bg
const BRAND_BEIGE = '#ECE3CE';  // warm beige – stub background

/** Delay (ms) before calling window.print() – increased to 600ms to allow complex styles to render */
const PRINT_DELAY_MS = 600;

/** Known booking status values used for CSS class names and colour maps */
const BOOKING_STATUSES = ['confirmed', 'pending', 'cancelled', 'refunded'] as const;
type BookingStatus = typeof BOOKING_STATUSES[number];

/** CSS inline style per booking status for badge colouring */
const STATUS_BADGE_STYLES: Record<BookingStatus, string> = {
  confirmed: 'background:#d1fae5;color:#065f46',
  pending:   'background:#fef3c7;color:#92400e',
  cancelled: 'background:#fee2e2;color:#991b1b',
  refunded:  'background:#f3f4f6;color:#6b7280',
};

/**
 * Escape a user-supplied string for safe embedding inside HTML.
 * Returns '&#8212;' (em dash) when the value is absent.
 */
function escHtml(s: string | undefined | null): string {
  if (s === undefined || s === null || s === '') return '&#8212;';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/** Returns a branded booking reference: WTW-YYMM-XXXXXX */
function brandedBookingId(booking: Booking): string {
  let datePart = '';
  if (booking.bookedAt) {
    const d = new Date(booking.bookedAt);
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    datePart = `${yy}${mm}`;
  }
  const tail = booking.id.slice(-6).toUpperCase();
  return datePart ? `WTW-${datePart}-${tail}` : `WTW-${tail}`;
}

/**
 * Generates a simple CSS barcode from a text string.
 * Encodes each character's 8 bits as narrow (1 px) and wide (2 px) vertical bars,
 * alternating between black and transparent to produce a realistic-looking barcode.
 */
function cssBarcode(text: string, height = 56): string {
  // Only allow alphanumeric chars and safe separators (prevents XSS; matches WTW-* format)
  const safe = text.replace(/[^A-Z0-9a-z\-_]/g, '').slice(0, 40);

  // Build a binary string from the character codes, framed with start/stop guards
  let bits = '10101';  // start guard
  for (let i = 0; i < safe.length; i++) {
    bits += safe.charCodeAt(i).toString(2).padStart(8, '0');
  }
  bits += '10101';  // stop guard

  // Every 3rd bar is doubled in width to create the classic barcode texture
  const WIDE_BAR_PERIOD = 3;

  const bars = bits
    .split('')
    .map((bit, idx) => {
      const width = idx % WIDE_BAR_PERIOD === 0 ? 2 : 1;
      const bg = bit === '1' ? '#1a1a1a' : 'transparent';
      return `<div style="display:inline-block;vertical-align:top;width:${width}px;height:${height}px;background:${bg};flex-shrink:0;"></div>`;
    })
    .join('');

  return `<div style="display:inline-flex;align-items:flex-start;background:white;padding:4px 6px;border:1px solid #e5e5e5;">${bars}</div>`;
}

function openPrintWindow(html: string): void {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Pop-up blocked. Please allow pop-ups to generate the PDF.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, PRINT_DELAY_MS);
}

export function downloadTicketPDF(booking: Booking): void {
  const ref = brandedBookingId(booking);
  const barcode = cssBarcode(ref);
  const bookedDate = booking.bookedAt
    ? new Date(booking.bookedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';
  const statusStyle = STATUS_BADGE_STYLES[booking.status as BookingStatus] ?? STATUS_BADGE_STYLES.pending;

  const safeRef          = escHtml(ref);
  const safeName         = escHtml(booking.customerName);
  const safeTrip         = escHtml(booking.tripTitle);
  const safeDate         = escHtml(booking.date);
  const safeTravelers    = escHtml(String(booking.maleTravelers + booking.femaleTravelers));
  const safeStatus       = escHtml(booking.status);
  const safeEmail        = escHtml(booking.email);
  const safePhone        = escHtml(booking.phone);
  const safePrice        = escHtml(booking.totalPrice?.toLocaleString('en-IN') || '0');
  const safeBookedDate   = escHtml(bookedDate);
  const safePickupPoint  = booking.pickupPoint ? escHtml(booking.pickupPoint) : null;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Boarding Pass &#8211; ${safeRef}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f0ede6; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }

    /* ── Outer boarding pass card ── */
    .pass {
      width: 720px;
      display: flex;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
    }

    /* ── Left main panel (dark green) ── */
    .main {
      flex: 1;
      background: ${BRAND_DARK};
      color: ${BRAND_CREAM};
      padding: 0;
      display: flex;
      flex-direction: column;
    }
    .main-header {
      padding: 22px 28px 16px;
      border-bottom: 1px solid rgba(249,245,235,0.15);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-name {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: ${BRAND_CREAM};
    }
    .brand-tagline { font-size: 10px; opacity: 0.6; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
    .pass-type {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      background: ${BRAND_SAGE};
      color: ${BRAND_CREAM};
      padding: 4px 10px;
      border-radius: 4px;
    }

    .main-body { flex: 1; padding: 20px 28px; }

    .field { margin-bottom: 16px; }
    .field-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      opacity: 0.55;
      margin-bottom: 3px;
    }
    .field-value { font-size: 15px; font-weight: 700; color: ${BRAND_CREAM}; }
    .field-value.large { font-size: 22px; font-weight: 900; }
    .field-value.mono  { font-family: 'Courier New', monospace; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin-bottom: 16px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 16px; margin-bottom: 16px; }

    .price-highlight {
      background: rgba(249,245,235,0.10);
      border: 1px solid rgba(249,245,235,0.20);
      border-radius: 8px;
      padding: 10px 14px;
      margin-top: 4px;
    }
    .price-highlight .field-value { font-size: 26px; color: #a8d5a2; }

    .status-badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      ${statusStyle};
    }

    .main-footer {
      padding: 14px 28px;
      border-top: 1px solid rgba(249,245,235,0.15);
      font-size: 10px;
      opacity: 0.55;
      text-align: center;
      letter-spacing: 0.5px;
    }

    /* ── Perforation tear strip ── */
    .tear {
      width: 18px;
      background: #f0ede6;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      position: relative;
    }
    .tear::before, .tear::after {
      content: '';
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 18px;
      height: 18px;
      background: #f0ede6;
      border-radius: 50%;
    }
    .tear::before { top: -9px; }
    .tear::after  { bottom: -9px; }
    .tear-dots {
      flex: 1;
      width: 2px;
      border-left: 2px dashed rgba(58,77,57,0.30);
    }

    /* ── Right stub (beige) ── */
    .stub {
      width: 200px;
      background: ${BRAND_BEIGE};
      padding: 24px 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      border-left: none;
    }
    .stub-title {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: ${BRAND_DARK};
      opacity: 0.5;
      text-align: center;
    }
    .stub-ref {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      font-weight: 900;
      color: ${BRAND_DARK};
      text-align: center;
      letter-spacing: 1px;
      word-break: break-all;
      margin: 8px 0;
    }
    .stub-field { text-align: center; margin: 6px 0; }
    .stub-field .lbl { font-size: 8px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${BRAND_DARK}; opacity: 0.45; }
    .stub-field .val { font-size: 12px; font-weight: 800; color: ${BRAND_DARK}; margin-top: 2px; }
    .stub-field .val.big { font-size: 18px; }
    .divider-stub { width: 100%; border-top: 1px dashed rgba(58,77,57,0.25); margin: 10px 0; }
    .barcode-wrap { text-align: center; }
    .barcode-text {
      font-family: 'Courier New', monospace;
      font-size: 7px;
      color: ${BRAND_DARK};
      opacity: 0.5;
      letter-spacing: 1px;
      margin-top: 4px;
      word-break: break-all;
    }

    @media print {
      body { background: white; padding: 0; min-height: auto; }
      .pass { box-shadow: none; border-radius: 0; width: 100%; }
    }
  </style>
</head>
<body>
  <div class="pass">

    <!-- ── Left main panel ── -->
    <div class="main">
      <div class="main-header">
        <div>
          <div class="brand-name">🎒 WeTowe Adventures</div>
          <div class="brand-tagline">Wheels to Wilderness</div>
        </div>
        <div class="pass-type">Boarding Pass</div>
      </div>

      <div class="main-body">
        <!-- Passenger -->
        <div class="field">
          <div class="field-label">Passenger Name</div>
          <div class="field-value large">${safeName}</div>
        </div>

        <!-- Trip destination -->
        <div class="field">
          <div class="field-label">Expedition / Destination</div>
          <div class="field-value" style="font-size:17px">${safeTrip}</div>
        </div>

        <!-- 3-col grid: date / travelers / status -->
        <div class="grid-3">
          <div class="field" style="margin-bottom:0">
            <div class="field-label">Departure Date</div>
            <div class="field-value" style="font-size:13px">${safeDate}</div>
          </div>
          <div class="field" style="margin-bottom:0">
            <div class="field-label">Travelers</div>
            <div class="field-value" style="font-size:13px">${safeTravelers} Pax</div>
          </div>
          <div class="field" style="margin-bottom:0">
            <div class="field-label">Status</div>
            <div style="margin-top:3px"><span class="status-badge">${safeStatus}</span></div>
          </div>
        </div>

        <!-- Contact -->
        <div class="grid-2" style="margin-top:4px">
          <div class="field" style="margin-bottom:0">
            <div class="field-label">Email</div>
            <div class="field-value mono" style="font-size:11px">${safeEmail}</div>
          </div>
          <div class="field" style="margin-bottom:0">
            <div class="field-label">Phone</div>
            <div class="field-value mono" style="font-size:12px">${safePhone}</div>
          </div>
        </div>

        ${safePickupPoint ? `
        <!-- Boarding Point -->
        <div class="field" style="margin-top:4px">
          <div class="field-label">&#128652; Boarding / Pickup Point</div>
          <div class="field-value" style="font-size:13px">${safePickupPoint}</div>
        </div>` : ''}

        <!-- Amount highlight -->
        <div class="price-highlight">
          <div class="field-label" style="opacity:0.7">Total Amount Paid</div>
          <div class="field-value" style="font-size:26px;color:#a8d5a2;">&#8377;${safePrice}</div>
          <div style="font-size:9px;opacity:0.5;margin-top:2px;">Booked on ${safeBookedDate}</div>
        </div>
      </div>

      <div class="main-footer">
        Present this pass at the rendezvous / boarding point &bull; Emergency: +91 96064 99422
      </div>
    </div>

    <!-- ── Tear strip ── -->
    <div class="tear"><div class="tear-dots"></div></div>

    <!-- ── Right stub ── -->
    <div class="stub">
      <div>
        <div class="stub-title">Admit One</div>
        <div class="stub-ref">${safeRef}</div>
        <div class="stub-title" style="margin-top:2px">Booking Reference</div>
      </div>

      <div class="divider-stub"></div>

      <div class="stub-field">
        <div class="lbl">Date</div>
        <div class="val" style="font-size:12px;">${safeDate}</div>
      </div>
      <div class="stub-field">
        <div class="lbl">Travelers</div>
        <div class="val big">${safeTravelers}</div>
      </div>
      ${safePickupPoint ? `<div class="stub-field">
        <div class="lbl">Boarding Point</div>
        <div class="val" style="font-size:10px;line-height:1.3;">${safePickupPoint}</div>
      </div>` : ''}
      <div class="stub-field">
        <div class="lbl">Total Paid</div>
        <div class="val" style="font-size:13px;color:${BRAND_DARK};">&#8377;${safePrice}</div>
      </div>

      <div class="divider-stub"></div>

      <!-- Barcode section -->
      <div class="barcode-wrap">
        ${barcode}
        <div class="barcode-text">${safeRef}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  openPrintWindow(html);
}

export function downloadManifestPDF(tripTitle: string, date: string, bookings: Booking[]): void {
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const totalTravelers = bookings.reduce((sum, b) => sum + (b.maleTravelers || 0) + (b.femaleTravelers || 0), 0);
  const confirmedTravelers = confirmedBookings.reduce((sum, b) => sum + (b.maleTravelers || 0) + (b.femaleTravelers || 0), 0);
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const safeTripTitle = escHtml(tripTitle);
  const safeDate      = escHtml(date);

  const rows = bookings
    .slice()
    .sort((a, b) => {
      const order: Record<BookingStatus, number> = { confirmed: 0, pending: 1, cancelled: 2, refunded: 3 };
      return (order[a.status as BookingStatus] ?? 9) - (order[b.status as BookingStatus] ?? 9);
    })
    .map((b, i) => {
      const rowClass = b.status === 'confirmed' ? 'row-confirmed' : b.status === 'cancelled' ? 'row-cancelled' : '';
      // Guard against unknown status values being used as CSS class names
      const safeStatusClass = (BOOKING_STATUSES as readonly string[]).includes(b.status) ? b.status : 'pending';
      return `<tr class="${rowClass}">
        <td style="text-align:center">${i + 1}</td>
        <td><strong>${escHtml(b.customerName)}</strong></td>
        <td>${escHtml(b.phone)}</td>
        <td>${escHtml(b.email)}</td>
        <td style="text-align:center">${(b.maleTravelers || 0) + (b.femaleTravelers || 0)}</td>
        <td>${b.pickupPoint ? escHtml(b.pickupPoint) : '<span style="color:#ccc">&#8212;</span>'}</td>
        <td style="text-align:right">&#8377;${escHtml(b.totalPrice?.toLocaleString('en-IN') || '0')}</td>
        <td style="text-align:center"><span class="badge status-${safeStatusClass}">${escHtml(b.status)}</span></td>
        <td class="mono">${escHtml(b.id)}</td>
      </tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Manifest &#8211; ${safeTripTitle} &#8211; ${safeDate}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #222; background: #fff; font-size: 13px; }
    .header { background: ${BRAND_DARK}; color: #fff; padding: 18px 24px; }
    .header h1 { font-size: 20px; font-weight: bold; }
    .header .meta { font-size: 12px; opacity: 0.8; margin-top: 5px; }
    .summary { display: flex; gap: 0; border-bottom: 2px solid ${BRAND_DARK}; }
    .summary-item { flex: 1; padding: 14px 16px; text-align: center; border-right: 1px solid #ddd; background: ${BRAND_CREAM}; }
    .summary-item:last-child { border-right: none; }
    .summary-item .num { font-size: 22px; font-weight: bold; color: ${BRAND_DARK}; }
    .summary-item .lbl { font-size: 10px; text-transform: uppercase; color: #777; margin-top: 2px; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #f3f4f6; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #555; border-bottom: 2px solid #ddd; font-weight: 700; }
    tbody td { padding: 9px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
    tbody tr.row-confirmed { background: #f0fdf4; }
    tbody tr.row-cancelled { background: #fff5f5; color: #aaa; }
    tbody tr:hover { background: #fafafa; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
    .status-confirmed { background: #d1fae5; color: #065f46; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    .status-refunded { background: #f3f4f6; color: #6b7280; }
    .mono { font-family: monospace; font-size: 11px; color: #999; }
    .footer { padding: 14px 24px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #eee; margin-top: 4px; }
    @media print { body { font-size: 11px; } thead { display: table-header-group; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>&#128203; Passenger Manifest &#8212; ${safeTripTitle}</h1>
    <div class="meta">Travel Date: ${safeDate} &bull; Generated: ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
  </div>
  <div class="summary">
    <div class="summary-item"><div class="num">${bookings.length}</div><div class="lbl">Bookings</div></div>
    <div class="summary-item"><div class="num">${confirmedBookings.length}</div><div class="lbl">Confirmed</div></div>
    <div class="summary-item"><div class="num">${confirmedTravelers}</div><div class="lbl">Confirmed Travelers</div></div>
    <div class="summary-item"><div class="num">${totalTravelers}</div><div class="lbl">Total Travelers</div></div>
    <div class="summary-item"><div class="num">&#8377;${totalRevenue.toLocaleString('en-IN')}</div><div class="lbl">Confirmed Revenue</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:36px">#</th>
        <th>Passenger Name</th>
        <th>Phone</th>
        <th>Email</th>
        <th style="text-align:center">Travelers</th>
        <th>Boarding Point</th>
        <th style="text-align:right">Amount</th>
        <th style="text-align:center">Status</th>
        <th>Booking ID</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <div class="footer">
    WeTowe Adventures &bull; Boarding Manifest &bull; For official use only &bull; Please verify passenger details at boarding point
  </div>
</body>
</html>`;

  openPrintWindow(html);
}
