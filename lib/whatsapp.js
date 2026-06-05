import { query } from './db';

const WHATSAPP_API_URL = process.env.NEXT_PUBLIC_WHATSAPP_API_URL;
const WHATSAPP_API_KEY = process.env.NEXT_PUBLIC_WHATSAPP_API_KEY;

export async function sendWhatsAppMessage(phone, text, mediaUrl = null, mediaType = null) {
  if (!WHATSAPP_API_URL || !WHATSAPP_API_KEY) {
    console.error('WhatsApp API credentials not configured');
    return { success: false, error: 'WhatsApp API not configured' };
  }

  const payload = {
    phone,
    text,
  };

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

export function formatDomainReport(domains, reportType = 'summary') {
  if (!domains || domains.length === 0) {
    return 'No domains to report.';
  }

  const timestamp = new Date().toLocaleString();
  let report = `CronBoy Report - ${timestamp}\n\n`;

  if (reportType === 'summary') {
    const healthy = domains.filter(d => d.status === 'healthy').length;
    const degraded = domains.filter(d => d.status === 'degraded').length;
    const down = domains.filter(d => d.status === 'down').length;

    report += `Summary:\n`;
    report += `Total: ${domains.length}\n`;
    report += `Healthy: ${healthy}\n`;
    report += `Degraded: ${degraded}\n`;
    report += `Down: ${down}\n`;
  } else if (reportType === 'detailed') {
    report += 'Detailed Status:\n\n';
    domains.forEach((domain) => {
      report += `${domain.subdomain}\n`;
      report += `Status: ${domain.status}\n`;
      report += `Response: ${domain.responseTime || 0}ms\n`;
      report += `Uptime: ${domain.uptime}%\n`;
      report += `SSL Expiry: ${domain.sslExpiryDays}d\n\n`;
    });
  } else if (reportType === 'critical') {
    const critical = domains.filter(d => d.status === 'down' || d.status === 'degraded' || d.sslExpiryDays <= 7);
    report += 'Critical Issues:\n\n';
    if (critical.length === 0) {
      report += 'No critical issues detected.\n';
    } else {
      critical.forEach((domain) => {
        report += `${domain.subdomain}: ${domain.status}`;
        if (domain.sslExpiryDays && domain.sslExpiryDays <= 7) {
          report += ` (SSL expires in ${domain.sslExpiryDays}d)`;
        }
        report += '\n';
      });
    }
  }

  return report;
}

export async function sendDomainReport(domains, reportType = 'summary', recipientPhone = null) {
  const phone = recipientPhone || process.env.REPORT_WHATSAPP_NUMBER;

  if (!phone) {
    console.error('No recipient phone number configured');
    return { success: false, error: 'Recipient phone not configured' };
  }

  const reportText = formatDomainReport(domains, reportType);

  const result = await sendWhatsAppMessage(phone, reportText);

  if (result.success) {
    try {
      const reportQuery = `
        INSERT INTO reports (domain_ids, report_type, sent_via, recipient_phone, content, status)
        VALUES ($1, $2, $3, $4, $5, 'sent')
        RETURNING id;
      `;

      const domainIds = domains.map(d => d.id || d.id);
      const reportRes = await query(reportQuery, [domainIds, reportType, 'whatsapp', phone, reportText]);
      const reportId = reportRes.rows[0].id;

      const msgQuery = `
        INSERT INTO whatsapp_messages (report_id, phone_number, message_text, status, sent_at)
        VALUES ($1, $2, $3, 'sent', NOW());
      `;

      await query(msgQuery, [reportId, phone, reportText]);

      return { success: true, reportId, message: 'Report sent successfully' };
    } catch (dbError) {
      console.error('Error logging report:', dbError);
      return { success: true, message: 'Report sent but logging failed', error: dbError.message };
    }
  }

  return result;
}

export async function logWhatsAppMessage(reportId, phone, messageText, status = 'pending') {
  try {
    const res = await query(
      `INSERT INTO whatsapp_messages (report_id, phone_number, message_text, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id;`,
      [reportId, phone, messageText, status]
    );
    return { success: true, id: res.rows[0].id };
  } catch (error) {
    console.error('Error logging WhatsApp message:', error);
    return { success: false, error: error.message };
  }
}
