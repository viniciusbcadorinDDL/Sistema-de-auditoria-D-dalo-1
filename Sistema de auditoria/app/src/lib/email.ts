import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const FROM = process.env.EMAIL_FROM ?? "Dédalo <nao-responder@dedalo.com.br>";

/**
 * Envia um e-mail transacional. Em desenvolvimento (sem RESEND_API_KEY),
 * apenas registra no console — as notificações in-app continuam funcionando.
 */
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<void> {
  if (!resend) {
    console.log(
      `[email] (ignorado — sem RESEND_API_KEY) "${params.subject}" → ${params.to}`,
    );
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  } catch (err) {
    console.error("[email] falha ao enviar:", err);
  }
}
