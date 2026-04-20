import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { topic, platforms, tone = "professional", type = "post" } = await req.json();
  if (!topic) return NextResponse.json({ error: "Topic required" }, { status: 400 });

  const platformList = Array.isArray(platforms) && platforms.length > 0
    ? platforms.join(", ")
    : "social media";

  const systemPrompt = `You are an expert social media content writer. Write engaging, platform-optimized content.
Always respond with ONLY a JSON object in this exact format:
{
  "content": "the main post content",
  "hashtags": ["tag1", "tag2", "tag3"],
  "tip": "one short platform-specific tip"
}`;

  const userPrompt = `Write a ${tone} ${type} about: ${topic}
Optimized for: ${platformList}
${platforms?.includes("Twitter") ? "Keep content under 280 characters for Twitter." : ""}
${platforms?.includes("LinkedIn") ? "Make it professional and insightful for LinkedIn." : ""}
${platforms?.includes("Instagram") ? "Make it visual and engaging for Instagram." : ""}

Include relevant hashtags and a short tip.`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch {
    // Fallback: return raw text as content
    return NextResponse.json({ content: text, hashtags: [], tip: "" });
  }
}
