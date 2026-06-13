const axios = require('axios');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildUserTemplate = (booking) => {
  const customerName = escapeHtml(booking.customerName || 'Traveler');
  const tripTitle = escapeHtml(booking.tripTitle || 'Your Trip');
  const tripDate = escapeHtml(booking.date || 'TBD');
  const travelers = escapeHtml(booking.travelers || 1);
  const pickupPoint = escapeHtml(booking.pickupPoint || 'Will be shared by team');
  const bookingRef = escapeHtml(String(booking._id || '').slice(-6).toUpperCase());

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f7f4ec;padding:32px;color:#1a1a1a;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #ece3ce;">
        <div style="background:linear-gradient(135deg,#3A4D39,#739072);padding:28px 24px;color:#fff;">
          <h1 style="margin:0;font-size:24px;line-height:1.2;">Thanks for your booking enquiry, ${customerName}!</h1>
          <p style="margin:10px 0 0;font-size:14px;opacity:0.95;">We have received your request and our team will contact you shortly.</p>
        </div>
        <div style="padding:24px;">
          <div style="background:#f9f5eb;border:1px solid #ece3ce;border-radius:10px;padding:16px 18px;margin-bottom:18px;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#739072;font-weight:700;">Booking Reference</p>
            <p style="margin:0;font-size:20px;font-weight:700;color:#3A4D39;">#${bookingRef || 'PENDING'}</p>
          </div>
          <h2 style="margin:0 0 10px;font-size:18px;color:#3A4D39;">Trip Details</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #f1ede3;color:#666;">Trip</td><td style="padding:10px 0;border-bottom:1px solid #f1ede3;text-align:right;font-weight:600;">${tripTitle}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f1ede3;color:#666;">Travel Date</td><td style="padding:10px 0;border-bottom:1px solid #f1ede3;text-align:right;font-weight:600;">${tripDate}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f1ede3;color:#666;">Travelers</td><td style="padding:10px 0;border-bottom:1px solid #f1ede3;text-align:right;font-weight:600;">${travelers}</td></tr>
            <tr><td style="padding:10px 0;color:#666;">Pickup Point</td><td style="padding:10px 0;text-align:right;font-weight:600;">${pickupPoint}</td></tr>
          </table>
          <p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:#555;">
            This is a manual confirmation flow. Payment is not collected online. Our team will reach out to you for the next steps.
          </p>
        </div>
      </div>
    </div>
  `;
};

async function sendBookingNotification(booking) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'Wheels to Wilderness';
  const adminEmail = process.env.BOOKING_ADMIN_EMAIL;

  if (!apiKey || !senderEmail || !adminEmail || !booking?.email) {
    return { sent: false };
  }

  const payload = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: booking.email, name: booking.customerName || 'Traveler' }],
    cc: [{ email: adminEmail, name: 'Admin' }],
    subject: `Booking enquiry received - ${booking.tripTitle || 'Wheels to Wilderness'}`,
    htmlContent: buildUserTemplate(booking),
    textContent: `Hi ${booking.customerName || 'Traveler'}, your booking enquiry for ${booking.tripTitle} on ${booking.date} is received. Our team will contact you shortly.`,
    headers: {
      'X-Mailin-custom': 'booking-enquiry'
    }
  };

  await axios.post(BREVO_API_URL, payload, {
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    timeout: 10000
  });

  return { sent: true };
}

module.exports = { sendBookingNotification };
