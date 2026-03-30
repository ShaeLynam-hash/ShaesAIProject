import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
export const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@yourdomain.com";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "SaaS Platform";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
