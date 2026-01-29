export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // 1. Обробка попереднього запиту CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. Дозволяємо лише POST запити
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Будь ласка, надішліть POST запит із JSON" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    try {
      const { text } = await request.json();
      const apiKey = env["Default Gemini API Key"]; // Назва з вашого скриншота

      if (!apiKey) {
        return new Response(JSON.stringify({ error: "API ключ не знайдено в налаштуваннях" }), {
          status: 500,
          headers: corsHeaders
        });
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Поясни цей текст дуже просто: ${text}` }] }]
        })
      });

      const data = await response.json();

      // Безпечне отримання тексту від Gemini
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini не зміг дати відповідь.";

      return new Response(JSON.stringify({ result: aiText }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: "Некоректний JSON або помилка сервера" }), {
        status: 400,
        headers: corsHeaders
      });
    }
  }
};