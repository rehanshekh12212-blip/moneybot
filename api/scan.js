
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "Gemini API key is not configured in Vercel."
    });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "You are MoneyBot AI, a cautious online business research assistant for a user in India with a zero-rupee starting budget. Find legal, realistic online business opportunities. Use Google Search to research current opportunities, demand, competition, free starting tools and eligibility where possible. Never promise income. Clearly separate verified facts from estimates. Include risks, time required, how to get the first customer, and whether any costs or payment fees may arise. Recommend only options that can begin without upfront spending. Give a concise, useful report in simple Hindi. Do not suggest scams, spam, fake reviews, gambling, trading or guaranteed returns."
            }]
          }],
          tools: [{ google_search: {} }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "AI request failed"
      });
    }

    const report =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("\n")
        .trim();

    return res.status(200).json({
      success: true,
      report: report || "AI did not return a report."
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error. Please try again."
    });
  }
}
