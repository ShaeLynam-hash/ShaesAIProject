import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const TEMPLATES: Record<string, (vars: Record<string, string>, biz: string) => string> = {
  email_campaign: (v, biz) =>
    `Write a compelling marketing email campaign for ${biz}.
Audience: ${v.audience || "existing customers"}
Goal: ${v.goal || "promote our services"}
Tone: ${v.tone || "professional and friendly"}
Subject line: create an attention-grabbing subject
Include: opening hook, value proposition, call-to-action, sign-off.
Format it as a complete email ready to send.`,

  sms_message: (v, biz) =>
    `Write a concise SMS marketing message for ${biz}. Keep it under 160 characters.
Audience: ${v.audience || "customers"}
Goal: ${v.goal || "drive engagement"}
Tone: ${v.tone || "friendly and direct"}
Include a clear call-to-action. No emojis unless specifically requested.`,

  sales_proposal: (v, biz) =>
    `Write a professional sales proposal from ${biz}.
Client name: ${v.client || "the client"}
Service/product: ${v.service || "our services"}
Price: ${v.price || "to be discussed"}
Key benefits: ${v.benefits || "high quality, fast delivery, expert team"}
Format: Executive Summary, The Problem, Our Solution, Deliverables, Investment, Next Steps.`,

  invoice_reminder: (v, biz) =>
    `Write a professional but firm invoice reminder email from ${biz}.
Client: ${v.client || "the client"}
Invoice #: ${v.invoice || "INV-001"}
Amount: ${v.amount || "the outstanding balance"}
Days overdue: ${v.days || "14"}
Keep it professional, include the invoice details, politely request payment, provide payment options.`,

  followup_email: (v, biz) =>
    `Write a friendly follow-up email from ${biz}.
Contact name: ${v.contact || "the contact"}
Last interaction: ${v.last || "our last meeting"}
Goal: ${v.goal || "reconnect and move forward"}
Tone: ${v.tone || "warm and professional"}
Keep it short (3-4 sentences), reference the last interaction, end with a clear next step.`,

  welcome_email: (v, biz) =>
    `Write a warm welcome email from ${biz} to a new client.
Client name: ${v.client || "the client"}
Service they signed up for: ${v.service || "our services"}
Next steps: ${v.next_steps || "onboarding call, account setup"}
Include: warm greeting, what they can expect, next steps, contact info for questions.`,

  social_post: (v, biz) =>
    `Write a ${v.platform || "LinkedIn"} post for ${biz}.
Topic: ${v.topic || "our services and value"}
Tone: ${v.tone || "professional and engaging"}
Goal: ${v.goal || "build brand awareness"}
CTA: ${v.cta || "visit our website"}
Include relevant hashtags for ${v.platform || "LinkedIn"}.`,

  proposal_intro: (v, biz) =>
    `Write an executive summary / introduction paragraph for a business proposal from ${biz}.
Client: ${v.client || "the prospect"}
Project: ${v.project || "the proposed project"}
Problem solved: ${v.problem || "their business challenge"}
Make it compelling, specific, and focused on the client's outcome.`,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { template, variables, businessName, customPrompt } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });

  const biz = businessName || "the business";
  const prompt = customPrompt || (template && TEMPLATES[template] ? TEMPLATES[template](variables ?? {}, biz) : null);

  if (!prompt) return NextResponse.json({ error: "Invalid template or missing prompt" }, { status: 400 });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: `You are an expert business copywriter. Write clear, professional, and persuasive content. Format your response as clean text ready to use — no meta-commentary, no "Here is your email:" preamble, just the content itself.`,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const content = data.content?.[0]?.text ?? "";
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
  }
}
