/**
 * Email Service with multi-provider dispatch (Resend, SendGrid, SMTP, or In-App Outbox Inspector)
 * Includes vibrant African/Nigerian styled responsive HTML email templates.
 */

const nodemailer = require('nodemailer');
const storage = require('./storageService');

// Colors matching Nigerian & African palette
const PALETTE = {
  nigeriaGreen: '#008751',
  nigeriaDarkGreen: '#005a36',
  terracotta: '#D9531E',
  sunGold: '#F4B41A',
  deepIndigo: '#1B1947',
  coralRed: '#D9383A',
  bgLight: '#FDFBF7',
  cardBg: '#FFFFFF',
  textColor: '#1F2937',
  mutedText: '#6B7280'
};

function getScopeBadge(scope) {
  switch (scope) {
    case 'nigeria':
      return { label: 'Nigeria 🇳🇬', bg: '#E8F5E9', color: '#008751', border: '#A5D6A7' };
    case 'africa':
      return { label: 'Africa 🌍', bg: '#FFF3E0', color: '#D9531E', border: '#FFCC80' };
    case 'energy':
      return { label: 'Energy Sector ⚡', bg: '#FFFDE7', color: '#B78103', border: '#FFF59D' };
    case 'global':
    default:
      return { label: 'Global 🌐', bg: '#E8EAF6', color: '#1B1947', border: '#C5CAE9' };
  }
}

function formatDateFriendly(dateStr) {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

function generateHtmlEmail({ subscriber, event, leadTimeDays, eventDateStr, appBaseUrl }) {
  const scopeBadge = getScopeBadge(event.scope);
  const friendlyDate = formatDateFriendly(eventDateStr);
  const baseUrl = appBaseUrl || 'http://localhost:3000';
  const manageUrl = `${baseUrl}/?view=manage-alerts&token=${encodeURIComponent(subscriber.token)}`;
  const unsubUrl = `${baseUrl}/?view=unsubscribe&token=${encodeURIComponent(subscriber.token)}`;

  let countdownText = '';
  if (leadTimeDays === 0) {
    countdownText = 'is TODAY!';
  } else if (leadTimeDays === 1) {
    countdownText = 'is TOMORROW!';
  } else {
    countdownText = `is coming up in ${leadTimeDays} days!`;
  }

  const officialBadgeText = event.official
    ? 'Official Public Holiday / Recognized Observance'
    : 'Industry-Recognized Observance (Unofficial)';

  const officialBadgeColor = event.official ? '#008751' : '#D9531E';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Advance Alert: ${event.name}</title>
</head>
<body style="margin:0; padding:0; background-color:${PALETTE.bgLight}; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; color:${PALETTE.textColor};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PALETTE.bgLight}; padding:32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:${PALETTE.cardBg}; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04); border:1px solid #E5E7EB;">
          
          <!-- Ankara Pattern Decorative Top Bar -->
          <tr>
            <td style="height:10px; background:linear-gradient(90deg, ${PALETTE.nigeriaGreen} 0%, ${PALETTE.sunGold} 35%, ${PALETTE.terracotta} 70%, ${PALETTE.deepIndigo} 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 20px 32px; text-align:left; background-color:#FAFAF9; border-bottom:1px solid #F3F4F6;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:12px; font-weight:800; letter-spacing:1px; text-transform:uppercase; color:${PALETTE.nigeriaGreen};">CELEBRATION & ENERGY CALENDAR</span>
                    <h2 style="margin:4px 0 0 0; font-size:22px; color:${PALETTE.deepIndigo}; font-weight:800;">Upcoming Observance Alert</h2>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <span style="display:inline-block; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; background-color:${scopeBadge.bg}; color:${scopeBadge.color}; border:1px solid ${scopeBadge.border}; text-transform:uppercase;">
                      ${scopeBadge.label}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Countdown Banner -->
          <tr>
            <td style="padding:28px 32px 20px 32px; background-color:#F0FDF4; border-bottom:1px solid #DCFCE7;">
              <div style="font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:${PALETTE.nigeriaDarkGreen}; margin-bottom:6px;">
                🎉 Advance Reminder (${leadTimeDays === 0 ? 'Same Day' : leadTimeDays + ' Days Ahead'})
              </div>
              <div style="font-size:26px; font-weight:800; color:#14532D; line-height:1.2;">
                ${event.name} <span style="font-weight:600; color:${PALETTE.terracotta};">${countdownText}</span>
              </div>
              <div style="font-size:15px; font-weight:600; color:#166534; margin-top:8px;">
                📅 Date: <strong>${friendlyDate}</strong>
              </div>
            </td>
          </tr>

          <!-- Event Details Body -->
          <tr>
            <td style="padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:16px;">
                    <div style="font-size:12px; font-weight:700; color:${PALETTE.mutedText}; text-transform:uppercase; letter-spacing:0.5px;">About this Celebration</div>
                    <div style="font-size:16px; line-height:1.6; color:${PALETTE.textColor}; margin-top:6px;">
                      ${event.description}
                    </div>
                  </td>
                </tr>

                <!-- Verification / Status Notice -->
                <tr>
                  <td style="padding:14px 18px; background-color:#F9FAFB; border-radius:8px; border-left:4px solid ${officialBadgeColor}; margin-bottom:20px;">
                    <div style="font-size:12px; font-weight:700; color:${officialBadgeColor}; margin-bottom:2px;">
                      STATUS: ${officialBadgeText}
                    </div>
                    <div style="font-size:12px; color:#4B5563;">
                      Source: ${event.source_note || 'Official National / International Gazette'}
                    </div>
                  </td>
                </tr>

                <!-- Interactive CTA Button -->
                <tr>
                  <td align="center" style="padding:24px 0 12px 0;">
                    <a href="${baseUrl}" target="_blank" style="display:inline-block; padding:12px 28px; background-color:${PALETTE.nigeriaGreen}; color:#FFFFFF; text-decoration:none; font-weight:700; font-size:15px; border-radius:8px; box-shadow:0 4px 6px -1px rgba(0, 135, 81, 0.25);">
                      Open Interactive Calendar
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer & NDPR / CAN-SPAM Compliance -->
          <tr>
            <td style="padding:24px 32px; background-color:#F9FAFB; border-top:1px solid #E5E7EB; font-size:12px; color:${PALETTE.mutedText}; line-height:1.5;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 8px 0;">
                      You received this email alert because you subscribed to <strong>${event.scope.toUpperCase()}</strong> observances with your <em>${subscriber.email_type || 'work'}</em> address (${subscriber.email}).
                    </p>
                    <p style="margin:0 0 12px 0; color:#9CA3AF; font-size:11px;">
                      Compliant with the Nigeria Data Protection Act (NDPA) and NDPR regulations. We respect your inbox and never sell contact data.
                    </p>
                    <div style="margin-top:8px;">
                      <a href="${manageUrl}" style="color:${PALETTE.nigeriaGreen}; font-weight:600; text-decoration:underline; margin-right:16px;">
                        Manage My Alert Preferences
                      </a>
                      <a href="${unsubUrl}" style="color:${PALETTE.coralRed}; font-weight:600; text-decoration:underline;">
                        Unsubscribe
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Dispatches an alert email to the subscriber.
 * Supports: Resend API, SendGrid API, SMTP, and automatically records in Outbox for in-app preview.
 */
async function sendAlertEmail({ subscriber, event, leadTimeDays, eventDateStr, appBaseUrl }) {
  const subject = `🎉 ${event.name} is in ${leadTimeDays === 0 ? 'Today' : leadTimeDays + ' days'}! [Celebration & Energy Alert]`;
  const html = generateHtmlEmail({ subscriber, event, leadTimeDays, eventDateStr, appBaseUrl });
  const text = `${event.name} is in ${leadTimeDays} days (${eventDateStr})!\n\n${event.description}\n\nSource: ${event.source_note}\n\nManage preferences: ${appBaseUrl}/?view=manage-alerts&token=${subscriber.token}\nUnsubscribe: ${appBaseUrl}/?view=unsubscribe&token=${subscriber.token}`;

  let dispatchResult = {
    provider: 'in-app-outbox',
    delivered: true,
    messageId: `sim-${Date.now()}`
  };

  // 1. Check for RESEND_API_KEY
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'alerts@nigeriacalendar.org',
          to: [subscriber.email],
          subject,
          html,
          text
        })
      });
      const data = await response.json();
      if (response.ok) {
        dispatchResult = { provider: 'resend', delivered: true, messageId: data.id };
      } else {
        console.error('Resend dispatch error:', data);
        dispatchResult = { provider: 'resend', delivered: false, error: data };
      }
    } catch (err) {
      console.error('Resend network error:', err);
    }
  }

  // 2. Check for SENDGRID_API_KEY if not already sent by Resend
  else if (process.env.SENDGRID_API_KEY) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: subscriber.email }] }],
          from: { email: process.env.EMAIL_FROM || 'alerts@nigeriacalendar.org' },
          subject,
          content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html }
          ]
        })
      });
      if (response.ok) {
        dispatchResult = { provider: 'sendgrid', delivered: true };
      } else {
        const errorText = await response.text();
        console.error('SendGrid dispatch error:', errorText);
        dispatchResult = { provider: 'sendgrid', delivered: false, error: errorText };
      }
    } catch (err) {
      console.error('SendGrid network error:', err);
    }
  }

  // 3. Check for SMTP credentials
  else if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Nigeria Celebration Calendar" <alerts@nigeriacalendar.org>',
        to: subscriber.email,
        subject,
        text,
        html
      });
      dispatchResult = { provider: 'smtp', delivered: true, messageId: info.messageId };
    } catch (err) {
      console.error('SMTP send error:', err);
      dispatchResult = { provider: 'smtp', delivered: false, error: err.message };
    }
  }

  // Log to outbox store so admins and users can preview in the web UI
  const outboxRecord = storage.logToOutbox({
    to: subscriber.email,
    recipientName: subscriber.name || 'Subscriber',
    emailType: subscriber.email_type,
    subject,
    eventId: event.id,
    eventName: event.name,
    eventScope: event.scope,
    eventDate: eventDateStr,
    leadTimeDays,
    provider: dispatchResult.provider,
    delivered: dispatchResult.delivered,
    html,
    text
  });

  return { dispatchResult, outboxRecord };
}

module.exports = {
  sendAlertEmail,
  generateHtmlEmail,
  formatDateFriendly
};
