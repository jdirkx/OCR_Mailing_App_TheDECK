import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const to = formData.get('to') as string;
    const subject = formData.get('subject') as string;
    const notes = formData.get('notes') as string;
    
    // Process attachments
    const attachments = [];
    const attachmentFiles = formData.getAll('attachments') as File[];
    
    for (const file of attachmentFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name,
        content: buffer.toString('base64'),
        contentType: file.type || 'application/octet-stream'
      });
    }

    // Send email to client's actual email
    await resend.emails.send({
      from: 'Your Mail Service <onboarding@resend.dev>',
      to,
      subject,
      html: `
        <h1>New Mail Received</h1>
        <p><strong>Notes:</strong> ${notes}</p>
        <p>${attachments.length} attachment(s) included</p>
      `,
      attachments
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
