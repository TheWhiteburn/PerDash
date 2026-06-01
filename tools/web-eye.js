import { chromium } from 'playwright';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
const envPath = resolve(__dirname, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([^=]+)=(.+)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('❌ GEMINI_API_KEY not set in tools/.env'); process.exit(1); }

const TARGET = process.argv[2] || 'https://perdash-psi.vercel.app';

const FALLBACK_ROUTES = ['/overview', '/goals', '/checklist', '/todos', '/workout', '/sleep'];
const DESKTOP = { width: 1920, height: 1080 };
const MOBILE = { width: 375, height: 812 };

const PROMPT = `You are a UI critic specialized in dark minimalist design (Linear/Vercel style).
Analyze these screenshots of a personal dashboard and identify ONLY visual issues.

Design rules:
- Background: pure black (#000), card bg: #0a0a0a
- Borders: blue #1e3a5f, red #ef4444 for urgent
- Text: blue #3b82f6 accents, font: JetBrains Mono (monospace)
- Dark Minimalist style: clean, spaced, no glassmorphism

Categories to check (list ALL that apply):
- SPACING: margins, padding, gaps between/within cards
- ALIGNMENT: elements not vertically/horizontally aligned
- CONTRAST: text too dim, bg too close to text color
- HIERARCHY: wrong element draws attention first
- CONSISTENCY: mismatched sizes, radii, colors
- DENSITY: too crowded or too empty sections
- OVERFLOW: text or elements clipped

Return ONLY valid JSON — no markdown, no code fences, no wrapper text:
{"issues":[{"route":"...","element":"...","problem":"...","fix":"specific CSS change","severity":"high|medium|low","category":"..."}]}`;

async function screenshot(page, label, buf) {
  if (!buf) buf = await page.screenshot({ fullPage: false });
  console.log(`  📸 ${label}`);
  return { route: label, data: buf.toString('base64') };
}

async function main() {
  console.log(`\n  🔍 Web Eye — ${TARGET}\n`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: DESKTOP });
  const page = await ctx.newPage();
  const shots = [];

  // --- Desktop: discover routes ---
  await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000); // let SPA hydrate fully

  let routes = await page.evaluate(() => {
    const s = new Set();
    for (const a of document.querySelectorAll('a[href]')) {
      const h = a.getAttribute('href');
      if (h && h.startsWith('/') && h.length > 1 && !h.startsWith('/#')) s.add(h);
    }
    return [...s];
  });

  if (routes.length === 0) {
    console.log('  ⚠️ No routes detected, using fallback routes');
    routes = FALLBACK_ROUTES;
  }

  console.log(`  Desktop routes: ${routes.join(', ')}\n`);

  // --- Desktop: each route ---
  for (const route of routes) {
    try {
      await page.goto(`${TARGET}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);
      shots.push(await screenshot(page, `desktop:${route}`));
    } catch (e) {
      console.log(`  ⚠️ Failed to load ${route}: ${e.message}`);
    }
  }

  // --- Desktop: interactions ---
  await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  const hoverTargets = [
    { sel: '[class*="card"i]', label: 'hover-card' },
    { sel: 'aside a, [class*="sidebar"i] a, [class*="nav"] a', label: 'hover-sidebar' },
  ];
  for (const { sel, label } of hoverTargets) {
    const el = await page.$(sel);
    if (el) { await el.hover(); await page.waitForTimeout(400); shots.push(await screenshot(page, `desktop:${label}`)); }
    else console.log(`  ⚠️ No element for ${sel}`);
  }

  // --- Desktop: Coach panel ---
  const coachBtn = await page.$('button:has-text("Coach")');
  if (coachBtn) { await coachBtn.click(); await page.waitForTimeout(800); shots.push(await screenshot(page, 'desktop:coach-panel')); }

  // --- Mobile: main page ---
  await page.setViewportSize(MOBILE);
  await page.waitForTimeout(800);
  shots.push(await screenshot(page, 'mobile:overview'));

  await browser.close();

  // --- Gemini ---
  console.log('\n  🤖 Gemini analyzing...\n');
  const genAI = new GoogleGenerativeAI(KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const parts = [{ text: PROMPT }, ...shots.map(s => ({ inlineData: { mimeType: 'image/png', data: s.data } }))];

  const res = await model.generateContent({ contents: [{ role: 'user', parts }] });
  let raw = res.response.text().trim();

  let data;
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) { try { data = JSON.parse(jsonMatch[0]); } catch {} }
  if (!data || !data.issues) {
    console.error('❌ Could not parse Gemini response. Raw:');
    console.error(raw);
    process.exit(1);
  }

  // --- Report ---
  const groups = { high: [], medium: [], low: [] };
  for (const i of data.issues) groups[i.severity]?.push(i);

  console.log('═══════════════════════════════════════════');
  console.log('              Web Eye Report');
  console.log('═══════════════════════════════════════════\n');

  for (const sev of ['high', 'medium', 'low']) {
    if (!groups[sev].length) continue;
    console.log(`  ${sev.toUpperCase()} (${groups[sev].length})\n`);
    for (const i of groups[sev]) {
      console.log(`    [${i.route}] ${i.element}`);
      console.log(`    ● ${i.problem}`);
      console.log(`    → ${i.fix}\n`);
    }
  }

  console.log('═══════════════════════════════════════════');
  console.log(`  Total: ${data.issues.length} (high: ${groups.high.length}, med: ${groups.medium.length}, low: ${groups.low.length})`);
  console.log();
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
