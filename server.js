const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

/* --- Iconic tarot visuals for built-in prompt --- */
const CARD_VISUALS = {
  M0:'carefree traveler on cliff edge, white sun rising, little white dog, colorful bindle',
  M1:'magician with wand raised to sky, infinity lemniscate halo, roses and lilies altar, four suits',
  M2:'high priestess between two pillars, crescent moon crown, pomegranate veil, scroll of wisdom',
  M3:'empress on throne of nature, wheat fields, waterfall, crown of twelve stars, lush greenery',
  M4:'emperor on stone throne, mountain peaks, golden scepter and orb, red robe of power',
  M5:'hierophant with two acolytes, golden keys, triple crown, sacred scrolls',
  M6:'angel blessing two lovers, garden of eden, sun radiance, mountain behind them',
  M7:'charioteer in starry canopy, two sphinxes, city behind him, victorious golden armor',
  M8:'woman gently closing lion mouth with garland of flowers, infinity symbol above her head',
  M9:'hermit alone on snowy peak, lantern with glowing star, long staff of wisdom',
  M10:'wheel of fortune with sphinx on top, serpent descending, anubis ascending, four corner creatures',
  M11:'justice with balanced scales and upright sword, red robe, two stone pillars',
  M12:'hanged man suspended from living tree, halo of light around head, serene expression',
  M13:'skeleton knight on white horse, flag with white rose, sunrise over distant river',
  M14:'angel pouring water between two cups, one foot on land one in water, sun between mountains',
  M15:'baphomet figure, two human figures loosely chained, inverted pentagram, dark cave',
  M16:'lightning striking tower, two figures falling, crown blown off, chaos and sudden change',
  M17:'naked woman kneeling at pool, eight-pointed star, seven smaller stars, bird in tree',
  M18:'full moon over ocean path, lobster emerging from water, two towers, wolf and dog howling',
  M19:'radiant sun with child on white horse, sunflowers, red banner, wall of sunflowers',
  M20:'angel blowing trumpet, people rising from graves, red cross on white banner, mountain range',
  M21:'dancing woman wrapped in purple cloth, wreath of victory, four corner creatures, completion',
};

const EL_PALETTE = {
  fire:  'warm crimson, burnt orange, golden flame tones, ember glow',
  water: 'deep sapphire, silver moonlit blue, teal, pearl shimmer',
  air:   'violet, lavender, pale gold, whisps of silver cloud',
  earth: 'deep forest green, amber, rich brown, emerald crystal glow',
  spirit:'deep violet, cosmic purple, white divine light, aurora hues',
};

/* --- Build card description lines for prompt --- */
function describeCards(cards) {
  return cards.map(c => {
    const visual = CARD_VISUALS[c.id] || `${c.name} tarot card energy`;
    const kws = (c.keywords || []).join(', ');
    const meaning = c.positiveMeaning || '';
    const orientation = c.reversed
      ? 'energy turning inward, inner transformation'
      : 'radiant outward energy, positive manifestation';
    return `[${c.name}]: visuals — ${visual}; symbolizing ${kws}; ${meaning}; ${orientation}`;
  }).join('\n');
}

/* --- Built-in prompt (no API key needed) --- */
function builtInPrompt(cards, element) {
  const palette = EL_PALETTE[element] || 'deep purple, gold, cosmic silver';
  const cardLines = cards.map(c => {
    const visual = CARD_VISUALS[c.id] || `${c.name} sacred symbols`;
    const kws = (c.keywords || []).slice(0, 3).join(', ');
    return `${c.name} (${visual}, ${kws})`;
  }).join('; ');

  return `Mystical tarot iPhone wallpaper 9:16 portrait, featuring tarot imagery: ${cardLines}. Color palette: ${palette}, dark midnight background. Sacred geometry mandala center, celestial crescent moon and stars, golden auspicious symbols, lotus flowers blooming, radiant divine light beams. Positive energy, protection and good fortune. Ultra detailed magical art, ethereal cinematic lighting, 4K.`;
}

/* --- Claude (Co) prompt --- */
async function promptViaClaude(cards, element) {
  const palette = EL_PALETTE[element] || 'deep purple and gold';
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
      system: 'You are a master of mystical art and tarot symbolism. Write vivid, poetic image generation prompts that incorporate specific tarot card visual imagery.',
      messages: [{
        role: 'user',
        content: `Create an image generation prompt for a lucky iPhone wallpaper based on these tarot cards.

Cards drawn:
${cardDesc}

Requirements:
- Incorporate the SPECIFIC visual symbols from each card listed above into the scene
- Transform all symbolism into POSITIVE, lucky, protective energy (even reversed cards)
- Dominant element: ${element} — use palette: ${palette}
- Dark midnight purple/indigo background sky
- Golden sacred geometry mandalas and auspicious symbols
- Celestial moon and stars
- Vertical 9:16 portrait for iPhone wallpaper
- Ultra detailed, ethereal, magical art, cinematic 4K

Write ONLY the image generation prompt in English. Max 160 words.`
      }]
    })
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || 'Claude API error');
  return data.content[0].text.trim();
}

/* --- Gemini text prompt --- */
async function promptViaGemini(cards, element) {
  const palette = EL_PALETTE[element] || 'deep purple and gold';
  const cardDesc = describeCards(cards);

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create an image prompt for a lucky iPhone wallpaper (9:16) using these tarot cards:
${cardDesc}
Incorporate each card's specific visual symbols. Transform all into positive lucky energy. Palette: ${palette}, dark midnight background, gold mandalas, celestial moon and stars. English only, max 160 words, no explanation.`
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

    // Pollinations.AI — free, no key needed
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
