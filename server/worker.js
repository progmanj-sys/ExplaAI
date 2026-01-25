// server/worker.js
export default {
    async fetch(request, env) {
        // Дозволяємо запити лише від вашого розширення (CORS)
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

        try {
            const { text, level } = await request.json();

            // Формуємо промпт залежно від обраного рівня
            const prompt = `Rewrite this text for a ${level}: "${text}"`;

            // Запит до Google Gemini API
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            const simplifiedText = data.candidates[0].content.parts[0].text;

            return new Response(JSON.stringify({ result: simplifiedText }), { headers: corsHeaders });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
        }
    }
};
