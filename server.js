const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY; // optional — for better prompts
const GEMINI_KEY = process.env.GEMINI_API_KEY;       // optional — fallback prompt

app.use(express.json());
app.use(express.static(path.join(__dirname)));

/* --- Built-in prompt (no API key needed) --- */
function builtInPrompt(cards, element) {
  const elStyle = {
    fire:   'fiery crimson and gold flames, phoenix rising, burning sacred stars',
    water:  'deep ocean blue, silver moonlight reflections, lotus on still water',
    air:    'golden wind swirls, floating feathers, lightning through ethereal clouds',
    earth:  'emerald lotus flowers, golden leaves, crystal cave with glowing gems',
    spirit: 'violet cosmic energy, divine white light rays, celestial portal opening',
  }[element] || 'golden mystical light, sacred geometry, cosmic energy swirls';

  return `Mystical tarot lucky wallpaper, vertical portrait 9:16 for iPhone, deep midnight purple and indigo background, ${elStyle}, ${cards.slice(0, 3).join(' and ')} tarot card energy, ornate gold mandala sacred geometry, crescent moon and stars, glowing auspicious golden symbols, protective divine light beams, ultra detailed magical art, cinematic ethereal atmosphere, 4K`;
}

/* --- Claude (Co) prompt generation --- */
async function promptViaClaude(cards, element) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Create a vivid image generation prompt (max 120 words) for a mystical lucky iPhone wallpaper.
Tarot cards: ${cards.join(', ')}
Dominant element: ${element}
Style: dark midnight purple background, shimmering gold accents, sacred geometry mandala, celestial moon and stars, auspicious protective symbols, vertical 9:16 portrait for iPhone, ultra detailed ethereal magical art.
Write ONLY the image prompt in English, no explanation.`
      }]
    })
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || 'Claude API error');
  return data.content[0].text.trim();
}

/* --- Gemini text prompt generation --- */
async function promptViaGemini(cards, element) {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a vivid image prompt (max 120 words) for a mystical lucky iPhone wallpaper. Cards: ${cards.join(', ')}. Element: ${element}. Style: dark purple, gold sacred geometry, celestial, 9:16 portrait. English only, no explanation.`
          }]
        }]
      })
    }
  );
  const data = await resp.json();
  if (!resp.ok) throw new Error(JSON.stringify(data));
  return data.candidates[0].content.parts[0].text.trim();
}

/* --- /api/wallpaper endpoint --- */
app.post('/api/wallpaper', async (req, res) => {
  const { cards, element } = req.body;
  if (!cards || !cards.length) return res.status(400).json({ error: 'cards required' });

  try {
    // Step 1: Generate image prompt (best available source)
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

    // Step 2: Generate image via Pollinations.AI (free, no API key needed)
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=576&height=1024&model=flux&nologo=true&seed=${seed}`;

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
