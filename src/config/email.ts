import nodemailer from 'nodemailer';

function createTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    // Fallback para desenvolvimento: imprime o link no console
    console.log('\n─────────────────────────────────────────────');
    console.log('[DEV] Link de redefinição de senha');
    console.log(`Para: ${to}`);
    console.log(`Link: ${resetLink}`);
    console.log('─────────────────────────────────────────────\n');
    return;
  }

  const from = process.env.SMTP_FROM ?? 'noreply@servicecontrol.com';

  await transporter.sendMail({
    from: `"Service Control" <${from}>`,
    to,
    subject: 'Redefinição de senha — Service Control',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1e293b;">
        <h2 style="margin-bottom: 8px; color: #0f172a;">Redefinição de senha</h2>
        <p style="color: #475569; margin-bottom: 24px;">
          Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Service Control</strong>.
          Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.
        </p>
        <a href="${resetLink}"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #ffffff;
                  text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Redefinir minha senha
        </a>
        <p style="margin-top: 24px; font-size: 13px; color: #94a3b8;">
          Se você não solicitou isso, ignore este e-mail — sua senha permanece a mesma.
        </p>
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #cbd5e1; margin-top: 16px;">
          Service Control &bull; Sistema de Gestão
        </p>
      </div>
    `,
  });
}
