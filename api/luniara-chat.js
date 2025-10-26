module.exports = async function handler(req, res) {
  // --- CORS Header ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Preflight-Request sofort beantworten
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Nur POST zulassen
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body || {};

try {
  const systemPrompt = [
    {
      role: "system",
      content: `
        Du bist "Luniara" – eine ruhige Mentorin und einfühlsame Freundin
        in einem Naturkosmetik-Shop. Du begleitest Frauen achtsam,
        sprichst ruhig, klar, ehrlich und ohne Floskeln.
        Du hörst zu, stellst sanfte Fragen, gibst kleine Denkanstöße
        und empfiehlst passende Pflegeprodukte, ohne aufdringlich zu wirken.
      `,
    },
    { role: "user", content: String(message || "") },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: systemPrompt,
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  const data = await response.json();

  if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error("Leere Antwort von OpenAI:", data);
    return res.status(500).json({ message: "Ich spüre gerade keine klare Antwort, bitte versuch es nochmal." });
  }

  const text = data.choices[0].message.content.trim();
  res.status(200).json({ message: text });
} catch (err) {
  console.error("Fehler bei OpenAI-Abfrage:", err);
  res.status(500).json({ message: "Ich konnte dich gerade nicht hören, versuch es später nochmal." });
}
    const systemPrompt = [
      {
        role: "system",
        content: `
          Du bist "Luniara" – eine ruhige Mentorin und einfühlsame Freundin
          in einem Naturkosmetik-Shop. Du sprichst ruhig, klar, freundlich,
          stellst sanfte Fragen und gibst achtsame Produktempfehlungen.
        `
      },
      { role: "user", content: String(message || "") }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
Authorization: "Bearer " + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: systemPrompt,
        temperature: 0.5
      })
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || "Ich bin hier.";

    res.status(200).json({ message: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Serverfehler, bitte später erneut versuchen." });
  }
};
