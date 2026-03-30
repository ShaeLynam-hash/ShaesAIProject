import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { model, messages } = await req.json();
  if (!messages?.length) return NextResponse.json({ error: "Missing messages" }, { status: 400 });

  const isAnthropic = model?.startsWith("claude");

  try {
    if (isAnthropic) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) return NextResponse.json({ content: "Anthropic API key not configured. Add it in Settings → Integrations." });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: model ?? "claude-sonnet-4-6", max_tokens: 2048, messages }),
      });
      const data = await res.json();
      const content = data.content?.[0]?.text ?? "No response";
      return NextResponse.json({ content });
    } else {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return NextResponse.json({ content: "OpenAI API key not configured. Add it in Settings → Integrations." });

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: model ?? "gpt-4o", messages }),
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "No response";
      return NextResponse.json({ content });
    }
  } catch {
    return NextResponse.json({ content: "AI service unavailable. Please try again." });
  }
}
