import { GoogleGenerativeAI } from '@google/generative-ai';

function trimContext(context) {
  if (!context) return {};
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const getRecent = (obj, days = 7) => {
    const result = {};
    const keys = Object.keys(obj || {}).sort().reverse();
    let count = 0;
    for (const k of keys) {
      result[k] = obj[k];
      count++;
      if (count >= days) break;
    }
    return result;
  };

  return {
    goals: context.goals || {},
    todos: (context.todos || []).filter(t => t.progress < 100),
    dailyChecklist: {
      today: (context.dailyChecklist?.logs || {})[todayKey] || [],
      presets: context.dailyChecklist?.presets || [],
    },
    workouts: {
      recent: getRecent(context.workouts?.logs, 7),
      challenges: (context.workouts?.challenges || []).filter(c => c.active),
    },
    sleep: { recent: getRecent(context.sleep?.logs, 7) },
    settings: { sleepTarget: context.settings?.sleepTarget || 6 },
  };
}

async function callAI(model, systemPrompt, message, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const result = await model.generateContent(
        [{ text: systemPrompt }, { text: message }],
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      return result.response.text();
    } catch (error) {
      if (error.name === 'AbortError') {
        error.message = '503 Request timed out';
      }
      const isRetryable = error.message?.includes('429') || error.message?.includes('503') || error.message?.includes('quota');
      if (isRetryable && i < retries - 1) {
        const delays = [1000, 1000, 2000, 3000, 5000];
        const delay = delays[Math.min(i, delays.length - 1)];
        console.log(`API busy (attempt ${i + 1}/${retries}). Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method not allowed' });
  }

  try {
    const { message, context } = req.body;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.json({
        reply: "⚠️ **Gemini API key not configured.**\n\nSet `GEMINI_API_KEY` in your Vercel environment variables.\n\nGet a free key at: https://aistudio.google.com/apikey"
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const trimmed = trimContext(context);

    const systemPrompt = `You are a relentless personal coach. NEVER suggest — TELL.

User data:
${JSON.stringify(trimmed)}

Rules:
- Direct commands. "Run 5km tomorrow 6AM." not "maybe try"
- Call out inconsistency. "3 days no workout. Fix it."
- Celebrate wins. "AMC done. Beast."
- Negotiate schedule if they push back, never drop the requirement.
- Under 100 words unless deep planning needed.
- Bold for commands.
- If asked about goals they haven't set, tell them to set them first.`;

    const reply = await callAI(model, systemPrompt, message);
    res.json({ reply });
  } catch (error) {
    console.error('AI chat error:', error);
    const msg = error.message || '';
    let friendly = msg;
    if (msg.includes('429') || msg.includes('quota')) friendly = 'Free tier quota exceeded. Wait a minute and try again, or check your Gemini API usage.';
    else if (msg.includes('503') || msg.includes('timed out')) friendly = 'Gemini is under high demand. Retrying automatically... try again in a few seconds.';
    res.status(500).json({ reply: `⚠️ **AI error:** ${friendly}` });
  }
}
