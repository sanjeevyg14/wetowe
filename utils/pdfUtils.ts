import { Booking } from '../types';

const BRAND_DARK = '#3A4D39';   // forest green – used for ticket main panel
const BRAND_SAGE = '#739072';   // medium green – accents
const BRAND_CREAM = '#F9F5EB';  // off-white / light text on dark bg
const BRAND_BEIGE = '#ECE3CE';  // warm beige – stub background

const PRINT_DELAY_MS = 600; // allow the pop-up window's DOM and styles to fully load before printing

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
  // Sanitize: only allow alphanumeric chars and safe separators to prevent XSS
  const safe = text.replace(/[^A-Z0-9a-z\-_]/g, '').slice(0, 40);

  // Build a binary string from the character codes, framed with start/stop guards
  let bits = '10101';  // start guard
  for (let i = 0; i < safe.length; i++) {
    bits += safe.charCodeAt(i).toString(2).padStart(8, '0');
  }
  bits += '10101';  // stop guard

  const bars = bits
    .split('')
    .map((bit, idx) => {
      const width = idx % 3 === 0 ? 2 : 1;  // vary width for texture
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
  const statusColors: Record<string, string> = {
    confirmed: 'background:#d1fae5;color:#065f46',
    pending:   'background:#fef3c7;color:#92400e',
    cancelled: 'background:#fee2e2;color:#991b1b',
    refunded:  'background:#f3f4f6;color:#6b7280',
  };
  const statusStyle = statusColors[booking.status] ?? statusColors.pending;

  // Escape all user-supplied strings before embedding in HTML to prevent XSS
  const esc = (s: string | undefined | null): string => {
    if (!s) return '—';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  };
  const safeRef          = esc(ref);
  const safeName         = esc(booking.customerName);
  const safeTrip         = esc(booking.tripTitle);
  const safeDate         = esc(booking.date);
  const safeTravelers    = esc(String(booking.travelers));
  const safeStatus       = esc(booking.status);
  const safeEmail        = esc(booking.email);
  const safePhone        = esc(booking.phone);
  const safePrice        = esc(booking.totalPrice?.toLocaleString('en-IN') || '0');
  const safeBookedDate   = esc(bookedDate);

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

        <!-- Amount highlight -->
        <div class="price-highlight">
          <div class="field-label" style="opacity:0.7">Total Amount Paid</div>
          <div class="field-value" style="font-size:26px;color:#a8d5a2;">&#8377;${safePrice}</div>
          <div style="font-size:9px;opacity:0.5;margin-top:2px;">Booked on ${safeBookedDate}</div>
        </div>
      </div>

      <div class="main-footer">
        Present this pass at the rendezvous / boarding point &bull; Emergency: +91 98765 43210
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
  const totalTravelers = bookings.reduce((sum, b) => sum + b.travelers, 0);
  const confirmedTravelers = confirmedBookings.reduce((sum, b) => sum + b.travelers, 0);
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  // Escape user-supplied strings to prevent XSS in the printed document
  const esc = (s: string | undefined | null): string => {
    if (s === undefined || s === null || s === '') return '&#8212;';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  };

  const safeTripTitle = esc(tripTitle);
  const safeDate      = esc(date);

  const rows = bookings
    .slice()
    .sort((a, b) => {
      const order: Record<string, number> = { confirmed: 0, pending: 1, cancelled: 2, refunded: 3 };
      return (order[a.status] ?? 9) - (order[b.status] ?? 9);
    })
    .map((b, i) => {
      const rowClass = b.status === 'confirmed' ? 'row-confirmed' : b.status === 'cancelled' ? 'row-cancelled' : '';
      // Only allow known status values as CSS class names
      const safeStatusClass = ['confirmed','pending','cancelled','refunded'].includes(b.status) ? b.status : 'pending';
      return `<tr class="${rowClass}">
        <td style="text-align:center">${i + 1}</td>
        <td><strong>${esc(b.customerName)}</strong></td>
        <td>${esc(b.phone)}</td>
        <td>${esc(b.email)}</td>
        <td style="text-align:center">${Number(b.travelers) || 0}</td>
        <td style="text-align:right">&#8377;${esc(b.totalPrice?.toLocaleString('en-IN') || '0')}</td>
        <td style="text-align:center"><span class="badge status-${safeStatusClass}">${esc(b.status)}</span></td>
        <td class="mono">${esc(b.id)}</td>
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
