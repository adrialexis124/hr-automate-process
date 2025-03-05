import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend("re_hTyjeQ4s_89VbKNGVdWfMYsMdMaZQHKj4");

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    const data = await resend.emails.send({
      from: 'RRHH <onboarding@resend.dev>',
      to,
      subject,
      html
    });

    return NextResponse.json({ message: 'Email enviado exitosamente', data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al enviar el email' },
      { status: 500 }
    );
  }
} 