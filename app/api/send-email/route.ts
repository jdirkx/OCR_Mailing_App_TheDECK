import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplate } from '../../../components/EmailTemplate'; // Adjust path as needed

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.RESEND_FROM!;

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const to = formData.get('to');
    const ccRaw = formData.get('cc');
    const subject = formData.get('subject');
    const notes = formData.get('notes');
    const ALWAYS_CC_EMAIL = process.env.ALWAYS_CC_EMAIL;

    // TypeScript-safe cc array
    let cc: string[] = [];
    if (typeof ccRaw === 'string') {
      cc = ccRaw
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);
    }
    if (ALWAYS_CC_EMAIL && typeof ALWAYS_CC_EMAIL === 'string') {
      cc.push(ALWAYS_CC_EMAIL);
    }
    cc = Array.from(new Set(cc)); // Remove duplicates

    // Attachments
    const attachments: { filename: string; content: Buffer; type?: string }[] = [];
    const attachmentFiles = formData.getAll('attachments');
    for (const file of attachmentFiles) {
      // Only process File objects (browser FormData may include empty entries)
      if (
        typeof file === 'object' &&
        file !== null &&
        'arrayBuffer' in file &&
        'name' in file &&
        'type' in file &&
        (file as File).size > 0
      ) {
        const buffer = Buffer.from(await (file as File).arrayBuffer());
        attachments.push({
          filename: (file as File).name,
          content: buffer,
          type: (file as File).type,
        });
      }
    }

    // Debug log
    console.log('Sending email:', {
      to,
      cc,
      subject,
      notes,
      attachments: attachments.map(a => a.filename),
    });

    const { data, error } = await resend.emails.send({
      from, // Now pulls from environment
      to: to as string,
      cc: cc.length > 0 ? cc : undefined,
      subject: subject as string,
      react: EmailTemplate({
        logoUrl: 'https://thedeck.jp/wp/wp-content/themes/thedeck-new/img/logo.png',
        notes: notes as string,
        attachmentCount: attachments.length,
      }),
      attachments,
    });


    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}