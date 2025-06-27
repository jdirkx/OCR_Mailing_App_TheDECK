import { EmailTemplate } from '@/components/EmailTemplate';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const tips = [
  { id: 1, description: "Always search before asking." },
  { id: 2, description: "Use clear and descriptive titles." },
  { id: 3, description: "Format your code properly." },
];

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['matthewnguyen1230@gmail.com'],
      subject: 'Hello world',
      react: EmailTemplate({ tips }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}