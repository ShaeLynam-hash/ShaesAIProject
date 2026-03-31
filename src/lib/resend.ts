import { Resend } from "resend";

export function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
}

// Keep backward compat for files that import `resend` directly
export const resend = { emails: { send: (...args: Parameters<Resend["emails"]["send"]>) => getResend().emails.send(...args) } };
export const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@yourdomain.com";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "SaaS Platform";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
