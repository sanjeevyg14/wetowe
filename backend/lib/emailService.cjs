const axios = require('axios');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildCustomerTemplate = (booking) => {
  const customerName = escapeHtml(booking.customerName || 'Traveler');
  const tripTitle = escapeHtml(booking.tripTitle || 'Your Trip');
  const tripDate = escapeHtml(booking.date || 'TBD');
  const travelers = escapeHtml(booking.travelers || 1);
  const pickupPoint = escapeHtml(booking.pickupPoint || 'Will be shared by team');
  const bookingRef = escapeHtml(String(booking._id || '').padStart(6, '0').slice(-6).toUpperCase());
  const baseUrl = process.env.FRONTEND_URL || 'https://wetowe.vercel.app';
  const logoUrl = `${baseUrl}/wetowe1.png`;

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f5eb; padding: 40px 20px; color: #2c3e2b;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2ddcf; box-shadow: 0 4px 12px rgba(58, 77, 57, 0.08);">
        
        <!-- Header with logo and background -->
        <div style="background-color: #3A4D39; padding: 35px 30px; text-align: center; border-bottom: 5px solid #ece3ce;">
          <img src="${logoUrl}" alt="Wheels to Wilderness" style="max-height: 70px; margin-bottom: 20px; display: inline-block;" height="70" />
          <h1 style="margin: 0; font-size: 22px; color: #ffffff; font-weight: 600; letter-spacing: 0.5px;">Booking Enquiry Received</h1>
          <p style="margin: 8px 0 0; font-size: 14px; color: #ece3ce; opacity: 0.9;">Thanks for reaching out, ${customerName}!</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px;">
          <p style="margin-top: 0; margin-bottom: 24px; font-size: 15px; line-height: 1.6; color: #4a5c48;">
            We have received your enquiry for the upcoming expedition. Our team is checking availability and will get in touch with you shortly to finalize your booking.
          </p>

          <!-- Booking Reference Badge -->
          <div style="background-color: #f5f2eb; border: 1px dashed #3A4D39; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 28px;">
            <p style="margin: 0 0 6px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #739072; font-weight: bold;">Booking Reference</p>
            <p style="margin: 0; font-size: 22px; font-weight: bold; color: #3A4D39;">#${bookingRef}</p>
          </div>

          <!-- Trip details -->
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #3A4D39; border-bottom: 2px solid #f5f2eb; padding-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Trip Details</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f5f2eb; color: #739072; font-size: 14px;">Selected Trip</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f5f2eb; text-align: right; font-weight: bold; font-size: 14px; color: #3A4D39;">${tripTitle}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f5f2eb; color: #739072; font-size: 14px;">Departure Date</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f5f2eb; text-align: right; font-weight: bold; font-size: 14px; color: #3A4D39;">${tripDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f5f2eb; color: #739072; font-size: 14px;">No. of Travelers</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f5f2eb; text-align: right; font-weight: bold; font-size: 14px; color: #3A4D39;">${travelers}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #739072; font-size: 14px;">Pickup Point</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; font-size: 14px; color: #3A4D39;">${pickupPoint}</td>
            </tr>
          </table>

          <!-- Information Callout -->
          <div style="background-color: #faf9f6; border-left: 4px solid #739072; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #4a5c48;">
              <strong>Note:</strong> This is a booking request confirmation. Online payment was not collected. A travel coordinator will contact you directly to confirm seat availability and discuss payment/onboarding steps.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #faf9f6; padding: 25px 30px; text-align: center; border-top: 1px solid #ece3ce; font-size: 12px; color: #739072;">
          <p style="margin: 0 0 8px; font-weight: bold; color: #3A4D39;">Wheels to Wilderness</p>
          <p style="margin: 0 0 15px; line-height: 1.4;">Weekend getaways, trekking spots, and hidden gems across India.</p>
          <div style="margin-bottom: 15px;">
            <a href="${baseUrl}" style="color: #3A4D39; text-decoration: none; font-weight: bold; margin: 0 10px;">Website</a> | 
            <a href="https://instagram.com/wheelstowilderness" style="color: #3A4D39; text-decoration: none; font-weight: bold; margin: 0 10px;">Instagram</a>
          </div>
          <p style="margin: 0; font-size: 10px; color: #a2b0a2;">&copy; ${new Date().getFullYear()} Wheels to Wilderness. All rights reserved.</p>
        </div>

      </div>
    </div>
  `;
};

const buildAdminTemplate = (booking) => {
  const customerName = escapeHtml(booking.customerName || 'N/A');
  const customerEmail = escapeHtml(booking.email || 'N/A');
  const customerPhone = escapeHtml(booking.phone || 'N/A');
  const tripTitle = escapeHtml(booking.tripTitle || 'N/A');
  const tripDate = escapeHtml(booking.date || 'N/A');
  const travelers = escapeHtml(booking.travelers || 1);
  const pickupPoint = escapeHtml(booking.pickupPoint || 'N/A');
  const totalPrice = escapeHtml(booking.totalPrice || '0');
  const bookingRef = escapeHtml(String(booking._id || '').padStart(6, '0').slice(-6).toUpperCase());
  const transactionId = escapeHtml(booking.transactionId || 'N/A');
  const baseUrl = process.env.FRONTEND_URL || 'https://wetowe.vercel.app';
  const logoUrl = `${baseUrl}/wetowe1.png`;

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f5eb; padding: 40px 20px; color: #2c3e2b;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2ddcf; box-shadow: 0 4px 12px rgba(58, 77, 57, 0.08);">
        
        <!-- Header with logo and background -->
        <div style="background-color: #1a261a; padding: 35px 30px; text-align: center; border-bottom: 5px solid #739072;">
          <img src="${logoUrl}" alt="Wheels to Wilderness" style="max-height: 70px; margin-bottom: 20px; display: inline-block;" height="70" />
          <h1 style="margin: 0; font-size: 22px; color: #ffffff; font-weight: 600; letter-spacing: 0.5px;">🚨 New Booking Enquiry</h1>
          <p style="margin: 8px 0 0; font-size: 14px; color: #ece3ce; opacity: 0.9;">Reference: #${bookingRef}</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px;">
          <p style="margin-top: 0; margin-bottom: 24px; font-size: 15px; line-height: 1.6; color: #4a5c48;">
            A new manual booking enquiry has been submitted. Please review the details below and log in to the admin panel to update the status.
          </p>

          <!-- Customer Details -->
          <h3 style="margin: 0 0 12px; font-size: 15px; color: #3A4D39; border-bottom: 2px solid #f5f2eb; padding-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Customer Contact Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; color: #739072; font-size: 14px;">Full Name</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; text-align: right; font-weight: bold; font-size: 14px; color: #3A4D39;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; color: #739072; font-size: 14px;">Email Address</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; text-align: right; font-weight: bold; font-size: 14px; color: #3A4D39;">
                <a href="mailto:${customerEmail}" style="color: #3A4D39; text-decoration: none; border-bottom: 1px dotted #3A4D39;">${customerEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; color: #739072; font-size: 14px;">Phone Number</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; text-align: right; font-weight: bold; font-size: 14px; color: #3A4D39;">
                <a href="tel:${customerPhone}" style="color: #3A4D39; text-decoration: none; border-bottom: 1px dotted #3A4D39;">${customerPhone}</a>
              </td>
            </tr>
          </table>

          <!-- Booking Details -->
          <h3 style="margin: 0 0 12px; font-size: 15px; color: #3A4D39; border-bottom: 2px solid #f5f2eb; padding-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Trip & Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; color: #739072; font-size: 14px;">Trip Package</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; text-align: right; font-weight: bold; font-size: 14px; color: #3A4D39;">${tripTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; color: #739072; font-size: 14px;">Travel Date</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; text-align: right; font-weight: bold; font-size: 14px; color: #3A4D39;">${tripDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; color: #739072; font-size: 14px;">Travelers</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; text-align: right; font-weight: bold; font-size: 14px; color: #3A4D39;">${travelers}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; color: #739072; font-size: 14px;">Pickup Point</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; text-align: right; font-weight: bold; font-size: 14px; color: #3A4D39;">${pickupPoint}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; color: #739072; font-size: 14px;">Total Price Quotation</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f5f2eb; text-align: right; font-weight: bold; font-size: 14px; color: #2c3e2b;">₹${Number(totalPrice).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #739072; font-size: 14px;">Transaction Reference ID</td>
              <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 13px; color: #3A4D39;">${transactionId}</td>
            </tr>
          </table>

          <!-- Admin Panel Action Button -->
          <div style="text-align: center; margin-top: 10px; margin-bottom: 10px;">
            <a href="${baseUrl}/admin" style="background-color: #3A4D39; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px; letter-spacing: 0.5px;">Open Admin Dashboard</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #faf9f6; padding: 20px 30px; text-align: center; border-top: 1px solid #ece3ce; font-size: 11px; color: #739072;">
          <p style="margin: 0;">This is an automated administrative notification. Please do not reply directly to this email.</p>
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

  const missing = [];
  if (!apiKey) missing.push('BREVO_API_KEY');
  if (!senderEmail) missing.push('BREVO_SENDER_EMAIL');
  if (!adminEmail) missing.push('BOOKING_ADMIN_EMAIL');
  if (!booking?.email) missing.push('booking.email');

  if (missing.length > 0) {
    console.error(`[Booking Email] Missing required configuration/parameters: ${missing.join(', ')}`);
    return { sent: false };
  }

  const bookingRef = String(booking._id || '').padStart(6, '0').slice(-6).toUpperCase();

  const customerPayload = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: booking.email, name: booking.customerName || 'Traveler' }],
    subject: `Booking Enquiry Received - ${booking.tripTitle || 'Wheels to Wilderness'}`,
    htmlContent: buildCustomerTemplate(booking),
    textContent: `Hi ${booking.customerName || 'Traveler'}, your booking enquiry for ${booking.tripTitle} on ${booking.date} is received. Our team will contact you shortly.`,
    headers: {
      'X-Mailin-custom': 'booking-enquiry'
    }
  };

  const adminPayload = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: adminEmail, name: 'Admin Team' }],
    subject: `🚨 NEW ENQUIRY: #${bookingRef} - ${booking.customerName} - ${booking.tripTitle}`,
    htmlContent: buildAdminTemplate(booking),
    textContent: `New booking enquiry received from ${booking.customerName} (Phone: ${booking.phone}, Email: ${booking.email}) for ${booking.tripTitle} on ${booking.date} with ${booking.travelers} traveler(s).`,
    headers: {
      'X-Mailin-custom': 'admin-notification'
    }
  };

  const headers = {
    'api-key': apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  try {
    await Promise.all([
      axios.post(BREVO_API_URL, customerPayload, { headers, timeout: 10000 }),
      axios.post(BREVO_API_URL, adminPayload, { headers, timeout: 10000 })
    ]);
  } catch (apiError) {
    console.error('[Booking Email] Failed to send email via Brevo:', apiError.response?.data || apiError.message);
    throw apiError;
  }

  return { sent: true };
}

module.exports = { sendBookingNotification };
