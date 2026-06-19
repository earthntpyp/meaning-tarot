const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

/* --- Minimal modern tarot symbols (geometric / abstract) --- */
const CARD_SYMBOLS = {
  M0:  'single feather floating, open horizon line, small circle sun',
  M1:  'infinity symbol ∞, four geometric shapes arranged symmetrically, single wand',
  M2:  'crescent moon silhouette, two vertical lines as pillars, scroll',
  M3:  'twelve-pointed star, wheat stalks, flowing water line',
  M4:  'solid square geometry, mountain outline, scepter line',
  M5:  'two crossed keys, triple horizontal lines, open hands',
  M6:  'two human silhouettes, radiating lines from above, apple',
  M7:  'two opposing arrows pointing forward, star canopy, shield',
  M8:  'infinity symbol above open hands, lion outline, floral wreath',
  M9:  'solitary lantern glow, single footpath line, star inside',
  M10: 'spinning circle with four symbols at corners, wheel spokes',
  M11: 'balanced scale silhouette, double-edged sword vertical, pillar lines',
  M12: 'inverted figure outline, halo ring, single tree branch',
  M13: 'white rose, horizon line, setting and rising sun, river bend',
  M14: 'two cups, flowing water arc between them, triangle in square',
  M15: 'two loosely linked chains, broken chain link, ascending arrow',
  M16: 'lightning bolt, crown falling, two figures in free fall, open sky',
  M17: 'eight-pointed star, water ripple circles, pouring vessel silhouette',
  M18: 'full moon circle, twin towers outline, still water reflection',
  M19: 'large sun circle, sunflower outline, child silhouette, radiant lines',
  M20: 'trumpet blowing, rising figure silhouette, cross inside circle',
  M21: 'wreath circle, dancing figure inside, four corner icons',
};

/* --- Modern minimal color palettes per element --- */
const EL_PALETTE = {
  fire:  'warm terracotta #C1440E, sand beige #F0DEC4, charcoal #1C1C1C, ember orange accent',
  water: 'deep navy #0F2340, pale seafoam #C8E6E0, slate blue #4A6FA5, silver white accent',
  air:   'soft lavender #C9C0D3, warm white #F5F2EE, sage #8FAF8A, gold line accent',
  earth: 'forest green #2D4A2F, warm stone #C4A882, cream #F4EDE4, matte black accent',
  spirit:'deep indigo #1A1040, soft violet #9B8EC4, pearl #F0EDFF, silver accent',
};

/* --- Minimal style base --- */
const MINIMAL_STYLE = `Modern minimalist art poster for iPhone wallpaper, 9:16 portrait orientation. Clean geometric composition, generous negative space, flat design with subtle depth. Premium design aesthetic — think Dieter Rams meets Japanese wabi-sabi. Muted sophisticated color palette, maximum 3 colors. Thin crisp elegant line art, simple abstract shapes. Ultra sharp edges, crystal clear, no blur, no noise. No clutter, no gradients, no ornate decorations. Gallery-quality, vector-like precision, professional print quality.`;

/* --- Quality suffix appended to every prompt --- */
const QUALITY_SUFFIX = ', ultra sharp, crystal clear, 4K resolution, crisp edges, high contrast, professional quality, no blur, no noise, no artifacts';

/* --- Build card lines for prompt --- */
function describeCards(cards) {
  return cards.map(c => {
    const symbol = CARD_SYMBOLS[c.id] || `${c.name} abstract symbol`;
    const kws = (c.keywords || []).slice(0, 3).join(', ');
    const meaning = c.positiveMeaning || '';
    return `• ${c.name}: geometric symbol — ${symbol} | energy: ${kws} | ${meaning}`;
  }).join('\n');
}

/* --- Built-in prompt (no API key) --- */
function builtInPrompt(cards, element) {
  const palette = EL_PALETTE[element] || 'deep indigo, pearl white, silver';
  const symbols = cards.map(c => {
    const sym = CARD_SYMBOLS[c.id] || `${c.name} minimal symbol`;
    const kw = (c.keywords || []).slice(0, 2).join(', ');
    return `${sym} representing ${kw}`;
  }).join('; ');

  return `${MINIMAL_STYLE} Color palette: ${palette}. Centered composition featuring minimalist tarot symbols: ${symbols}. Single focal point, thin line icons, clean typography space, ample breathing room. Positive affirming energy. Ultra clean modern design, no noise, no texture${QUALITY_SUFFIX}.`;
}

/* --- Claude prompt --- */
async function promptViaClaude(cards, element) {
  const palette = EL_PALETTE[element] || 'deep indigo and pearl white';
  const cardDesc = describeCards(cards);

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 500,
      system: 'You are a top creative director specializing in minimal modern design. Write precise image generation prompts for premium wallpapers.',
      messages: [{
        role: 'user',
        content: `Create an image generation prompt for a modern minimalist iPhone wallpaper (9:16) inspired by these tarot cards.

Cards and their minimal symbols:
${cardDesc}

Design direction:
- MINIMAL and MODERN — clean, contemporary, gallery-quality art poster style
- Incorporate the tarot card symbols as SIMPLE GEOMETRIC SHAPES or THIN CRISP LINE ART
- Color palette: ${palette} (maximum 3 colors, muted and sophisticated)
- Large negative space, single clear focal point, absolutely no clutter
- Aesthetic: Dieter Rams / Bauhaus / Japanese minimalism / premium Apple wallpaper
- Positive, uplifting energy expressed through clean design — not mystical ornate
- No gradients, no ornate details, no heavy textures, no noise
- End prompt with: ultra sharp, crystal clear, 4K, crisp edges, vector precision

Write ONLY the image generation prompt in English. Max 160 words.`
      }]
    })
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || 'Claude API error');
  return data.content[0].text.trim();
}

/* --- Gemini prompt --- */
async function promptViaGemini(cards, element) {
  const palette = EL_PALETTE[element] || 'deep indigo and pearl white';
  const cardDesc = describeCards(cards);

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a minimal modern art image prompt for iPhone wallpaper (9:16).
Tarot cards:
${cardDesc}
Style: minimalist, modern, Bauhaus-inspired, premium design. Palette: ${palette}, max 3 colors. Simple geometric tarot symbols, large negative space, no clutter, ultra sharp crisp edges, 4K quality. English only, max 160 words, prompt only.`
          }]
        }]
      })
    }
  );
  const data = await resp.json();
  if (!resp.ok) throw new Error(JSON.stringify(data));
  return data.candidates[0].content.parts[0].text.trim();
}

/* --- /api/wallpaper --- */
app.post('/api/wallpaper', async (req, res) => {
  const { cards, element } = req.body;
  if (!cards || !cards.length) return res.status(400).json({ error: 'cards required' });

  try {
    let imagePrompt, promptSource;
    if (ANTHROPIC_KEY) {
      imagePrompt = await promptViaClaude(cards, element);
      promptSource = 'Claude';
    } else if (GEMINI_KEY) {
      imagePrompt = await promptViaGemini(cards, element);
      promptSource = 'Gemini';
    } else {
      imagePrompt = builtInPrompt(cards, element);
      promptSource = 'Built-in';
    }

    // Pollinations.AI — 1170×2532 matches iPhone 14/15 native resolution
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1170&height=2532&model=flux&nologo=true&enhance=true&seed=${seed}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    let imgResp;
    try {
      imgResp = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!imgResp.ok) throw new Error(`Pollinations returned ${imgResp.status}`);

    const buffer = await imgResp.arrayBuffer();
    const b64 = Buffer.from(buffer).toString('base64');
    const mimeType = imgResp.headers.get('content-type') || 'image/jpeg';

    res.json({ image: b64, mimeType, prompt: imagePrompt, promptSource });

  } catch (err) {
    console.error('Wallpaper error:', err.message);
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

app.listen(PORT, () => console.log(`Meaning Tarot server on port ${PORT}`));
