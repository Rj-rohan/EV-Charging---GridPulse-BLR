import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "prompt required" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are GridPulse BLR — an AI decision-support system for BESCOM (Bangalore Electricity Supply Company) managing EV charging infrastructure across Bengaluru. 
You analyze real-time SCADA data, EV registration patterns, feeder load curves, and user behavior to provide actionable recommendations.
Always respond in JSON format as specified. Be concise, specific, and use real Bengaluru ward names, DTR IDs, and grid terminology.
Never use generic placeholders — generate realistic, specific values for a Bengaluru distribution grid context.`,
        },
        {
          role: "user",
          content: context ? `Context: ${JSON.stringify(context)}\n\n${prompt}` : prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content ?? "";

    // Try to parse JSON from response
    let data: unknown = text;
    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) data = JSON.parse(jsonMatch[1] ?? jsonMatch[0]);
    } catch {
      // Return raw text if not JSON
    }

    return NextResponse.json({ result: data, raw: text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
