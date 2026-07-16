import nodemailer from "nodemailer";
import { env } from "@/config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: env.SMTP_USER && env.SMTP_PASSWORD ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
});

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"]/g,
    (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character] ?? character,
  );
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  heading: string;
  body: string;
  actionLabel?: string;
  actionUrl?: string;
}) {
  const safeHeading = escapeHtml(input.heading);
  const safeBody = escapeHtml(input.body);
  const action =
    input.actionLabel && input.actionUrl
      ? `<p style="margin:24px 0"><a href="${escapeHtml(input.actionUrl)}" style="background:#e9641a;color:white;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:700">${escapeHtml(input.actionLabel)}</a></p>`
      : "";

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: input.to,
    subject: input.subject,
    text: `${input.heading}\n\n${input.body}${input.actionUrl ? `\n\n${input.actionUrl}` : ""}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#3f321f;background:#fffaf0;padding:28px;border-radius:20px"><h1 style="font-size:24px">${safeHeading}</h1><p style="line-height:1.6">${safeBody}</p>${action}<p style="font-size:12px;color:#806d54">Suy Luận Nhí · An toàn, riêng tư và tích cực cho trẻ.</p></div>`,
  });
}
