/**
 * Luniara Chat API – Vercel Serverless Function
 * ----------------------------------------------
 * Ruft OpenAI an und gibt eine ruhige, einfühlsame Antwort für den Shopify-Chatbot zurück.
 */

module.exports = async function handler(req, res) {
  // --- CORS Header für Shopify ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Preflight-Request
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ message: "Kein gültiger Text übermittelt." });
  }

  try {
    // --- KI-Systemrolle: Luniara ---
    const systemPrompt = [
      {
        role: "system",
        content: `
          Du bist "Luniara" – eine ruhige Mentorin und achtsame Begleiterin
          in einem Naturkosmetik-Shop für Frauen. Du sprichst ruhig, klar,
          freundlich und ehrlich, niemals aufdringlich. Du stellst sanfte Fragen,
          hilfst Kundinnen, sich verstanden zu fühlen und empfiehlst dezent passende
          Produkte aus dem Shop, wenn es zur Situation passt.
          Du nutzt dabei einfache Sprache, sprichst wie eine gute Freundin,
          die wirklich zuhört.
        `
      },
      { role: "user", content: String(message) }
    ];

    // --- Anfrage an OpenAI ---
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: systemPrompt,
        temperature: 0.7,
        max_tokens: 220
      })
    });

    const data = await response.json();

    // --- Fehlerbehandlung ---
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Leere Antwort oder API-Fehler:", data);
      return res.status(500).json({
        message: "Ich spüre gerade keine klare Antwort, bitte versuch es nochmal."
      });
    }

    const text = data.choices[0].message.content.trim();

    // --- Antwort an Frontend ---
    res.status(200).json({ message: text });
  } catch (error) {
    console.error("Fehler bei der Kommunikation mit OpenAI:", error);
    res.status(500).json({
      message: "Ich konnte dich gerade nicht hören. Versuch es später nochmal."
    });
  }
};
