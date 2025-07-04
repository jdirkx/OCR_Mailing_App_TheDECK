import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplate } from '../../../components/EmailTemplate'; // Adjust import path

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const to = formData.get('to') as string;
    const ccRaw = formData.get('cc') as string | null;
    const subject = formData.get('subject') as string;
    const notes = formData.get('notes') as string;
    
    // Always include this email in CC
    const ALWAYS_CC_EMAIL = process.env.ALWAYS_CC_EMAIL;

    // Build CC array: parse any provided CCs, add the fixed one, remove duplicates and empty
    let cc: string[] = [];
    if (ccRaw) {
      cc = ccRaw
        .split(',')
        .map(e => e.trim())
        .filter(Boolean);
    }
    if (ALWAYS_CC_EMAIL) {
      cc.push(ALWAYS_CC_EMAIL);
    }
    cc = Array.from(new Set(cc)); // Remove duplicates
    console.log("cc:", cc);

    // Process attachments
    const attachments = [];
    const attachmentFiles = formData.getAll('attachments') as File[];
    for (const file of attachmentFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name,
        content: buffer,
      });
    }

    const logoUrl = `${BASE_URL}/logo.png`;

    // ---- MOCK MODE: skip actual email send in dev/test ----
    if (
      process.env.SKIP_EMAIL_SEND === 'true' ||
      process.env.NODE_ENV === 'development'
    ) {
      console.log('MOCK EMAIL SEND (not actually sending):', {
        from: 'Your Mail Service <onboarding@resend.dev>',
        to,
        cc,
        subject,
        notes,
        attachments: attachments.map(a => a.filename),
        logoUrl,
      });
      return NextResponse.json({
        success: true,
        mock: true,
        message: 'Email send skipped (mock mode)',
        data: {
          from: 'Your Mail Service <onboarding@resend.dev>',
          to,
          cc,
          subject,
          notes,
          attachments: attachments.map(a => a.filename),
          logoUrl,
        },
      });
    }
    // -------------------------------------------------------

    // Pass the logo URL to the template
    const { data, error } = await resend.emails.send({
      from: 'Your Mail Service <onboarding@resend.dev>',
      to,
      cc, 
      subject,
      react: EmailTemplate({ 
        logoUrl: "https://placehold.co/150x50",
        notes, 
        attachmentCount: attachments.length 
      }),
      attachments,
    });

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
