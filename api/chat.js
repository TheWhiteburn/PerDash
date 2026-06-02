import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const MODELS = [
  'deepseek/deepseek-v4-flash:free',
  'stepfun/step-3-5-flash:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
];

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

async function callWithFallback(systemPrompt, message) {
  let lastError = null;
  for (const model of MODELS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const result = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return result.choices[0].message.content;
    } catch (error) {
      clearTimeout(lastError?.timeout);
      lastError = { error, model };
      console.log(`Model ${model} failed:`, error.message);
    }
  }
  const err = lastError?.error || new Error('All models failed');
  err.message = err.message || 'All models failed';
  throw err;
}

function parseResponse(text) {
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      const reply = text.replace(/```json\n[\s\S]*?\n```/, '').trim();
      return { reply, mutations: parsed.mutations || [] };
    } catch (e) {
      // fall through
    }
  }
  return { reply: text, mutations: [] };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method not allowed', mutations: [] });
  }

  try {
    const { message, context } = req.body;

    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
      return res.json({
        reply: '⚠️ OpenRouter API key not configured.\n\nSet `OPENROUTER_API_KEY` in your Vercel environment variables.',
        mutations: [],
      });
    }

    const trimmed = trimContext(context);

    const systemPrompt = `You are a Coach. Short and direct.

User data:
${JSON.stringify(trimmed)}

Rules:
- Short replies. Daily check: 5 words max unless planning.
- Bold commands. "**Train legs tomorrow.**"
- Call out laziness. "6 days no legs. Fix it."

If user has 5-year goals with no yearly/monthly breakdown, create them. Break each 5-year goal → 1-2 yearly goals (parentId = 5-year goal id). Break each yearly → monthly goals.

When user asks "how to achieve X", give phases + milestones + weekly actions. Add milestones as todos.

When user reports doing something, output mutation JSON after text:

\`\`\`json
{
  "mutations": [
    { "action": "toggleChecklist", "id": "<id>" },
    { "action": "logWorkout", "text": "..." },
    { "action": "logSleep", "hours": 7 },
    { "action": "updateGoal", "level": "yearly", "id": "<id>", "progress": 50 },
    { "action": "addGoal", "level": "yearly", "text": "...", "year": 2026, "parentId": "<5y id>" },
    { "action": "addGoal", "level": "monthly", "text": "...", "month": "June", "year": 2026, "parentId": "<yearly id>" },
    { "action": "toggleChallengeStep", "challengeId": "<id>", "stepId": "<id>" },
    { "action": "addTodo", "text": "..." },
    { "action": "updateChecklistProgress", "id": "<id>", "active": true }
  ]
}
\`\`\`

No JSON if no action needed. Don't tell user to set goals they haven't made — tell them to do it.`;

    const raw = await callWithFallback(systemPrompt, message);
    const { reply, mutations } = parseResponse(raw);
    res.json({ reply, mutations });
  } catch (error) {
    console.error('AI chat error:', error);
    const msg = error.message || '';
    let friendly = msg;
    if (msg.includes('429') || msg.includes('quota')) friendly = 'Rate limit exceeded. Wait a minute and try again.';
    else if (msg.includes('timed out')) friendly = 'All models timed out. Try again in a few seconds.';
    res.status(500).json({ reply: `⚠️ AI error: ${friendly}`, mutations: [] });
  }
}
