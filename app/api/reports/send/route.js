import { sendDomainReport } from '@/lib/whatsapp';
export async function POST(req) {
  try {
    const { domains, reportType = 'summary', recipientPhone } = await req.json();

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return Response.json(
        { success: false, error: 'No domains provided' },
        { status: 400 }
      );
    }

    const validReportTypes = ['summary', 'detailed', 'critical'];
    if (!validReportTypes.includes(reportType)) {
      return Response.json(
        { success: false, error: 'Invalid report type' },
        { status: 400 }
      );
    }

    const result = await sendDomainReport(domains, reportType, recipientPhone);

    if (result.success) {
      return Response.json(
        { success: true, reportId: result.reportId, message: result.message },
        { status: 200 }
      );
    } else {
      return Response.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Report API error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

