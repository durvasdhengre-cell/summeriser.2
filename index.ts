import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { content, fileName, isImage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert medical document analyzer. When given a medical document (report, prescription, lab result, clinical notes, or medical image), you MUST return a JSON response with the following structure. Do NOT return markdown. Return ONLY valid JSON.

{
  "patient": {
    "name": "Patient name or null",
    "age": "Age or null",
    "gender": "Gender or null",
    "date": "Report date or null",
    "lab": "Lab/hospital name or null",
    "doctor": "Doctor name or null",
    "reportType": "e.g. CBC, Blood Panel, Lipid Profile, etc."
  },
  "parameters": [
    {
      "name": "Parameter name (e.g. Hemoglobin)",
      "result": "Observed value with unit (e.g. 14 g/dL)",
      "normalRange": "Reference range (e.g. 13-17 g/dL)",
      "status": "Normal | Slightly High | Slightly Low | High | Low | Borderline High | Borderline Low | Critical High | Critical Low"
    }
  ],
  "summary": "A brief 2-3 sentence overall assessment of the report highlighting any concerns.",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Rules:
- Extract ALL parameters from the document
- Compare each value against the reference range to determine status
- For male patients, use male reference ranges
- "Normal" = within range, "Slightly High/Low" = marginally outside, "High/Low" = significantly outside, "Critical" = dangerously outside
- If you cannot determine the range, use standard medical reference ranges
- Return ONLY the JSON object, no other text, no markdown code blocks`;

    const userContent: any[] = [];

    if (isImage) {
      userContent.push({
        type: "image_url",
        image_url: { url: content },
      });
      userContent.push({
        type: "text",
        text: `Analyze this medical document image named "${fileName}". Extract all parameters and return structured JSON.`,
      });
    } else {
      userContent.push({
        type: "text",
        text: `Analyze this medical document named "${fileName}" and return structured JSON:\n\n${content}`,
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";
    
    // Clean up the response - remove markdown code blocks if present
    let jsonStr = rawContent.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    // Try to parse to validate it's valid JSON
    try {
      const parsed = JSON.parse(jsonStr);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      // If parsing fails, return the raw content as a fallback
      return new Response(JSON.stringify({ 
        patient: null,
        parameters: [],
        summary: rawContent,
        recommendations: [],
        rawText: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("summarize error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
