const { query } = require('./db');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const REPORT_WHATSAPP_NUMBER = process.env.REPORT_WHATSAPP_NUMBER;

async function sendWhatsAppMessage(phone, text, mediaUrl = null, mediaType = null) {
  if (!WHATSAPP_API_URL || !WHATSAPP_API_KEY) {
    console.error('WhatsApp API credentials not configured');
    return { success: false, error: 'WhatsApp API not configured' };
  }

  const payload = { phone, text };
  if (mediaUrl && mediaType) {
    payload.mediaUrl = mediaUrl;
    payload.mediaType = mediaType;
  }

  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': WHATSAPP_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      return { success: false, error: data.message || 'Failed to send message' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('WhatsApp API request failed:', error);
    return { success: false, error: error.message };
  }
}

function formatDomainReport(domains, reportType = 'summary') {
  if (!domains || domains.length === 0) {
    return 'No domains to report.';
  }

  const timestamp = new Date().toLocaleString();
  let report = `CronBoy Report - ${timestamp}\n\n`;

  if (reportType === 'summary') {
    const healthy = domains.filter((d) => d.status === 'healthy').length;
    const degraded = domains.filter((d) => d.status === 'degraded').length;
    const down = domains.filter((d) => d.status === 'down').length;
    report += `Summary:\nTotal: ${domains.length}\nHealthy: ${healthy}\nDegraded: ${degraded}\nDown: ${down}\n`;
  } else if (reportType === 'detailed') {
    report += 'Detailed Status:\n\n';
    domains.forEach((domain) => {
      report += `${domain.subdomain}\nStatus: ${domain.status}\nResponse: ${domain.responseTime || 0}ms\nUptime: ${domain.uptime}%\n\n`;
    });
  } else if (reportType === 'critical') {
    const critical = domains.filter((d) => d.status === 'down' || d.status === 'degraded' || d.sslExpiryDays <= 7);
    report += 'Critical Issues:\n\n';
    if (critical.length === 0) {
      report += 'No critical issues detected.\n';
    } else {
      critical.forEach((domain) => {
        report += `${domain.subdomain}: ${domain.status}\n`;
      });
    }
  }

  return report;
}

async function sendDomainReport(domains, reportType = 'summary', recipientPhone = null) {
  const phone = recipientPhone || REPORT_WHATSAPP_NUMBER;
  if (!phone) {
    console.error('No recipient phone number configured');
    return { success: false, error: 'Recipient phone not configured' };
  }

  const reportText = formatDomainReport(domains, reportType);
  const result = await sendWhatsAppMessage(phone, reportText);

  if (!result.success) {
    return result;
  }

  try {
    const domainIds = JSON.stringify(domains.map((d) => d.id));
    const insertResult = await query(
      `INSERT INTO reports (domain_ids, report_type, sent_via, recipient_phone, content, status) VALUES (?, ?, ?, ?, ?, 'sent')`,
      [domainIds, reportType, 'whatsapp', phone, reportText]
    );
    const reportId = insertResult?.insertId || null;
    await query(
      `INSERT INTO whatsapp_messages (report_id, phone_number, message_text, status, sent_at) VALUES (?, ?, ?, 'sent', NOW())`,
      [reportId, phone, reportText]
    );
    return { success: true, message: 'Report sent successfully', reportId };
  } catch (error) {
    console.error('Error logging report:', error);
    return { success: true, message: 'Report sent but logging failed', error: error.message };
  }
}

module.exports = { sendDomainReport, sendWhatsAppMessage, formatDomainReport };