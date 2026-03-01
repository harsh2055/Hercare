// server/controllers/chatController.js
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// HerCare AI Assistant — Backend Controller
//
// Supports two LLM providers (set CHAT_PROVIDER=openai or gemini in .env):
//   • OpenAI  — uses gpt-4o-mini  (fast, cheap, great for this use-case)
//   • Gemini  — uses gemini-1.5-flash
//
// System prompt is:
//   1. Strictly scoped to women's health topics only
//   2. Dynamically localised to the user's language (en / hi / mr)
//   3. Always appends a medical disclaimer
// ─────────────────────────────────────────────────────────────────────────────

const https = require('https');

// ── Language display names (used inside the system prompt) ───────────────────
const LANG_NAMES = {
  en: 'English',
  hi: 'Hindi (हिंदी)',
  mr: 'Marathi (मराठी)',
};

// ── Allowed topic list (injected into system prompt) ─────────────────────────
const ALLOWED_TOPICS = `
- Menstrual cycle tracking, phases, period pain, flow, irregularities
- Ovulation, fertility windows, cycle predictions
- Pregnancy symptoms, trimester guidance, prenatal care, foetal development
- Postpartum recovery and care
- Women's nutrition and diet tailored to cycle phases or pregnancy trimesters
- Exercise and yoga poses safe for menstruation and pregnancy
- Specific symptoms: sleep disruption, acne, irritability, fatigue, food cravings,
  difficulty concentrating, skin changes, cramping, diarrhea, headache, bloating,
  breast soreness, low back pain, nausea, constipation, shortness of breath,
  dizziness, back pain, heartburn, breast changes, varicose veins,
  implantation bleeding, darkening of areola, and mood fluctuations
- General women's hormonal health and wellness
`.trim();

// ── Build the system prompt ───────────────────────────────────────────────────
function buildSystemPrompt(lang = 'en') {
  const langName = LANG_NAMES[lang] || LANG_NAMES.en;

  return `You are HerCare Assistant — a compassionate, knowledgeable women's health companion integrated into the HerCare app.

LANGUAGE RULE (NON-NEGOTIABLE):
You MUST respond ENTIRELY in ${langName}. Every word of your reply — including punctuation, units, and labels — must be in ${langName}. Do not mix languages under any circumstances.

SCOPE RULE (NON-NEGOTIABLE):
You may ONLY answer questions related to these topics:
${ALLOWED_TOPICS}

If the user asks about anything outside this list (politics, coding, general knowledge, relationships unrelated to health, etc.), politely decline in ${langName} and redirect them to ask a women's health question. Do not apologise excessively.

RESPONSE STYLE:
- Be warm, empathetic, and non-judgmental
- Give practical, actionable advice (e.g., specific foods, poses, remedies)
- Use bullet points for lists; keep paragraphs short and easy to scan
- Never diagnose conditions — you provide information, not diagnosis
- For serious symptoms (heavy bleeding, severe pain, chest tightness), always recommend consulting a doctor urgently

DISCLAIMER:
End EVERY response with this line translated into ${langName}:
"⚕ This information is for educational purposes only and is not a substitute for professional medical advice."

FORMATTING:
- Use **bold** for key terms
- Use emojis sparingly (1-2 per response max) for warmth
- Keep responses under 300 words unless a detailed explanation is genuinely needed`;
}

// ── Utility: HTTPS POST (no extra dependencies) ──────────────────────────────
function httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname, path, method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { reject(new Error(`JSON parse error: ${raw}`)); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── OpenAI call ───────────────────────────────────────────────────────────────
async function callOpenAI(systemPrompt, messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set in environment.');

  const payload = {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    max_tokens: 600,
    temperature: 0.7,
  };

  const res = await httpsPost(
    'api.openai.com',
    '/v1/chat/completions',
    {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    payload
  );

  if (res.status !== 200) {
    const errMsg = res.body?.error?.message || `OpenAI error ${res.status}`;
    throw new Error(errMsg);
  }

  return res.body.choices?.[0]?.message?.content?.trim() || 'No response received.';
}

// ── Gemini call ───────────────────────────────────────────────────────────────
async function callGemini(systemPrompt, messages) {
  // Add .trim() to ensure no hidden Windows characters break the API key
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY not set in environment.');

  // Add .trim() here as well!
  const model = 'gemini-2.5-flash';

  // Gemini uses a different message format
  const geminiContents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const payload = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: geminiContents,
    generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
  };

  const res = await httpsPost(
    'generativelanguage.googleapis.com',
    `/v1beta/models/${model}:generateContent?key=${apiKey}`,
    { 'Content-Type': 'application/json' },
    payload
  );

  if (res.status !== 200) {
    const errMsg = res.body?.error?.message || `Gemini error ${res.status}`;
    throw new Error(errMsg);
  }

  return res.body.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No response received.';
}
// ── Main controller ───────────────────────────────────────────────────────────

/**
 * POST /api/chat
 * Body: { messages: [{role, content}], language: 'en'|'hi'|'mr' }
 *
 * - `messages` is the FULL conversation history from the client
 *   (so context is maintained across turns without server-side sessions)
 * - `language` comes from the user's LanguageContext selection
 */
const chat = async (req, res) => {
  try {
    const { messages, language } = req.body;

    // ── Validation ────────────────────────────────────────────────────────
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'messages array is required.' });
    }
    if (messages.length > 40) {
      // Prevent runaway context costs — keep last 40 turns
      messages.splice(0, messages.length - 40);
    }

    const lang = ['en', 'hi', 'mr'].includes(language) ? language : 'en';
    const systemPrompt = buildSystemPrompt(lang);

    // ── Provider selection ────────────────────────────────────────────────
    const provider = (process.env.CHAT_PROVIDER || 'openai').toLowerCase();
    let reply;

    if (provider === 'gemini') {
      reply = await callGemini(systemPrompt, messages);
    } else {
      reply = await callOpenAI(systemPrompt, messages);
    }

    res.json({ reply, language: lang });
  } catch (error) {
    console.error('[ChatController]', error.message);

    // Surface a user-friendly error in all three languages
    const fallbacks = {
      en: 'I\'m having trouble connecting right now. Please try again in a moment.',
      hi: 'मुझे अभी कनेक्ट करने में समस्या हो रही है। कृपया एक पल में पुनः प्रयास करें।',
      mr: 'मला आत्ता कनेक्ट करण्यात अडचण येत आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.',
    };
    const lang = req.body?.language || 'en';

    res.status(500).json({
      message: error.message,
      reply: fallbacks[lang] || fallbacks.en,
    });
  }
};

module.exports = { chat };