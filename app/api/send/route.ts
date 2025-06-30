"use server"
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { to, subject, text } = await request.json();

  try {
    const data = await resend.emails.send({
      from: 'Your Name <onboarding@resend.dev>', // Use a verified sender if possible
      to,
      subject,
      text,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}