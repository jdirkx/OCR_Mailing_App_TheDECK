import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplate } from '../../../components/EmailTemplate'; // Adjust import path

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';


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
        content: buffer,
      });
    }

    const logoUrl = `${BASE_URL}/logo.png`;

    // Pass the logo URL to the template
    const { data, error } = await resend.emails.send({
      from: 'Your Mail Service <onboarding@resend.dev>',
      to,
      subject,
      react: EmailTemplate({ 
        logoUrl: "https://placehold.co/150x50", // Replace with your actual logo URL
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
