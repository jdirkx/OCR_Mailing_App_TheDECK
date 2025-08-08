import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplate } from '../../../components/EmailTemplate'; // Adjust path as needed

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.RESEND_FROM!;

// Test recipient and cc override 
const TEST_RECIPIENT_EMAIL = process.env.TEST_RECIPIENT_EMAIL;
const ALWAYS_CC_EMAIL = process.env.ALWAYS_CC_EMAIL;

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const toRaw = formData.get('to');
    const ccRaw = formData.get('cc');
    const subject = formData.get('subject');
    const notes = formData.get('notes');

    // Declare 'to' with 'let' here so it's accessible outside the if/else block
    let to: string | string[];

    if (TEST_RECIPIENT_EMAIL) {
      // If a test recipient is set, override 'to'
      to = TEST_RECIPIENT_EMAIL;
      console.log(`REDIRECTING EMAIL to test recipient: ${TEST_RECIPIENT_EMAIL}`);
    } else {
      // Otherwise, use the actual recipient from the form data
      to = toRaw as string;
      console.log('Sending email to actual recipients.');
    }

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

    // Testing override 
    const TEST_CC = process.env.TEST_CC;
    if (TEST_CC && typeof TEST_CC === 'string') {
      cc = TEST_CC
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);
    }

    // Attachments
    const attachments: { filename: string; content: Buffer; type?: string }[] = [];
    const attachmentFiles = formData.getAll('attachments');
    for (const file of attachmentFiles) {
      if (
        typeof file === 'object' &&
        file !== null &&
        'arrayBuffer' in file &&
        'name' in file &&
        'type' in file &&
        (file as File).size > 0
      ) {
        console.log(`- Received File Name: ${(file as File).name}, File Type: ${(file as File).type}`);
        const buffer = Buffer.from(await (file as File).arrayBuffer());
        attachments.push({
          filename: (file as File).name,
          content: buffer,
          type: (file as File).type,
        });
      }
    }

    // The 'to' variable is now accessible here
    const { data, error } = await resend.emails.send({
      from,
      to: to,
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