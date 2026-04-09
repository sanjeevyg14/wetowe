import { Booking } from '../types';

const BRAND_COLOR = '#3A4D39';
const BRAND_LIGHT = '#f0f7f0';

function openPrintWindow(html: string): void {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow pop-ups in your browser to download PDFs.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 500);
}

export function downloadTicketPDF(booking: Booking): void {
  const statusClass = `status-${booking.status}`;
  const bookedDate = booking.bookedAt
    ? new Date(booking.bookedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Booking Ticket – ${booking.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #222; background: #f5f5f5; }
    .page { max-width: 620px; margin: 40px auto; background: #fff; border: 2px solid ${BRAND_COLOR}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .header { background: ${BRAND_COLOR}; color: #fff; padding: 28px 28px 20px; text-align: center; }
    .header .logo { font-size: 26px; font-weight: bold; letter-spacing: 1px; }
    .header .subtitle { font-size: 13px; opacity: 0.8; margin-top: 4px; }
    .body { padding: 24px 28px; }
    .row { display: flex; justify-content: space-between; align-items: flex-start; padding: 9px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; gap: 12px; }
    .row:last-child { border-bottom: none; }
    .label { color: #777; font-weight: 500; white-space: nowrap; flex-shrink: 0; }
    .value { font-weight: 600; text-align: right; word-break: break-word; }
    .booking-id { font-family: monospace; font-size: 12px; color: #555; }
    .badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-confirmed { background: #d1fae5; color: #065f46; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    .status-refunded { background: #f3f4f6; color: #6b7280; }
    .divider { margin: 0 28px; height: 1px; background: repeating-linear-gradient(90deg, #ccc 0, #ccc 6px, transparent 6px, transparent 12px); }
    .footer { background: ${BRAND_LIGHT}; padding: 14px 28px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; }
    @media print { body { background: #fff; } .page { margin: 0; box-shadow: none; border-radius: 0; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">🎒 WeTowe Adventures</div>
      <div class="subtitle">Booking Confirmation Ticket</div>
    </div>
    <div class="body">
      <div class="row"><span class="label">Booking ID</span><span class="value booking-id">${booking.id}</span></div>
      <div class="row"><span class="label">Customer Name</span><span class="value">${booking.customerName || '—'}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${booking.email || '—'}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value">${booking.phone || '—'}</span></div>
      <div class="row"><span class="label">Trip</span><span class="value">${booking.tripTitle || '—'}</span></div>
      <div class="row"><span class="label">Travel Date</span><span class="value">${booking.date || '—'}</span></div>
      <div class="row"><span class="label">Travelers</span><span class="value">${booking.travelers}</span></div>
      <div class="row"><span class="label">Total Amount</span><span class="value">₹${booking.totalPrice?.toLocaleString('en-IN') || '0'}</span></div>
      <div class="row"><span class="label">Booked On</span><span class="value">${bookedDate}</span></div>
      <div class="row"><span class="label">Status</span><span class="value"><span class="badge ${statusClass}">${booking.status}</span></span></div>
    </div>
    <div class="divider"></div>
    <div class="footer">
      Please carry this ticket to the boarding point &bull; WeTowe Adventures &bull; Generated on ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
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

  const rows = bookings
    .slice()
    .sort((a, b) => {
      const order: Record<string, number> = { confirmed: 0, pending: 1, cancelled: 2, refunded: 3 };
      return (order[a.status] ?? 9) - (order[b.status] ?? 9);
    })
    .map((b, i) => {
      const rowClass = b.status === 'confirmed' ? 'row-confirmed' : b.status === 'cancelled' ? 'row-cancelled' : '';
      return `<tr class="${rowClass}">
        <td style="text-align:center">${i + 1}</td>
        <td><strong>${b.customerName || '—'}</strong></td>
        <td>${b.phone || '—'}</td>
        <td>${b.email || '—'}</td>
        <td style="text-align:center">${b.travelers}</td>
        <td style="text-align:right">₹${b.totalPrice?.toLocaleString('en-IN') || '0'}</td>
        <td style="text-align:center"><span class="badge status-${b.status}">${b.status}</span></td>
        <td class="mono">${b.id}</td>
      </tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Manifest – ${tripTitle} – ${date}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #222; background: #fff; font-size: 13px; }
    .header { background: ${BRAND_COLOR}; color: #fff; padding: 18px 24px; }
    .header h1 { font-size: 20px; font-weight: bold; }
    .header .meta { font-size: 12px; opacity: 0.8; margin-top: 5px; }
    .summary { display: flex; gap: 0; border-bottom: 2px solid ${BRAND_COLOR}; }
    .summary-item { flex: 1; padding: 14px 16px; text-align: center; border-right: 1px solid #ddd; background: ${BRAND_LIGHT}; }
    .summary-item:last-child { border-right: none; }
    .summary-item .num { font-size: 22px; font-weight: bold; color: ${BRAND_COLOR}; }
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
    <h1>📋 Passenger Manifest — ${tripTitle}</h1>
    <div class="meta">Travel Date: ${date} &bull; Generated: ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
  </div>
  <div class="summary">
    <div class="summary-item"><div class="num">${bookings.length}</div><div class="lbl">Bookings</div></div>
    <div class="summary-item"><div class="num">${confirmedBookings.length}</div><div class="lbl">Confirmed</div></div>
    <div class="summary-item"><div class="num">${confirmedTravelers}</div><div class="lbl">Confirmed Travelers</div></div>
    <div class="summary-item"><div class="num">${totalTravelers}</div><div class="lbl">Total Travelers</div></div>
    <div class="summary-item"><div class="num">₹${totalRevenue.toLocaleString('en-IN')}</div><div class="lbl">Confirmed Revenue</div></div>
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
