const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

/* --- Tarot card visual descriptions for 3D render --- */
const CARD_VISUALS = {
  M0: 'The Fool card — young adventurer stepping forward joyfully, white dog, bright sun, flower',
  M1: 'The Magician card — robed figure with wand raised, roses and lilies, infinity halo',
  M2: 'The High Priestess card — mysterious woman between two pillars, crescent moon crown, veil',
  M3: 'The Empress card — radiant queen on floral throne, crown of stars, wheat fields, waterfall',
  M4: 'The Emperor card — powerful king on stone throne, golden scepter, mountain peaks',
  M5: 'The Hierophant card — wise teacher with two acolytes, golden keys, triple crown',
  M6: 'The Lovers card — two figures beneath blessing angel, garden, glowing sun',
  M7: 'The Chariot card — armored warrior with two sphinxes, star canopy, golden armor',
  M8: 'Strength card — woman gently closing lion mouth, flower garland, infinity above',
  M9: 'The Hermit card — wise elder with lantern on mountain peak, shining star inside',
  M10: 'Wheel of Fortune card — golden spinning wheel, sphinx on top, serpent and jackal, four winged creatures',
  M11: 'Justice card — robed judge with balanced golden scales and upright sword',
  M12: 'The Hanged Man card — figure peacefully suspended from tree, golden halo glow',
  M13: 'Death card — white rose, sunrise over river, transformation and renewal energy',
  M14: 'Temperance card — angel pouring glowing water between golden cups, mountain sunrise',
  M15: 'The Devil card — broken chains, liberation energy, torch of truth',
  M16: 'The Tower card — lightning bolt of enlightenment, awakening, breakthrough',
  M17: 'The Star card — serene figure pouring starlight water, eight-pointed star, seven stars',
  M18: 'The Moon card — full moon over still water, two towers, mystical reflection',
  M19: 'The Sun card — radiant golden sun, joyful child on white horse, sunflower field',
  M20: 'Judgement card — angel blowing trumpet, figures rising in golden light, rebirth',
  M21: 'The World card — triumphant dancer in laurel wreath, four corner creatures, completion',
};

/* --- Rich vibrant color palettes per element --- */
const EL_PALETTE = {
  fire:  'warm golden amber, crimson red, bright copper, glowing ember light',
  water: 'crystal aquamarine blue, silver moonlight, turquoise, pearl shimmer',
  air:   'golden yellow, sky blue, lavender, radiant bright white',
  earth: 'lush emerald green, warm gold, jade crystal, rich amber',
  spirit:'royal deep purple, violet, divine gold, radiant white light',
};

/* --- Base style direction (matches reference image feel) --- */
const BASE_STYLE = `Photorealistic 3D digital art, vertical 9:16 full bleed background, no device frame, no phone, no border. Tarot cards displayed as physical 3D cards with classic Rider-Waite illustrations, floating and beautifully arranged in scene. Surrounded by scattered gold coins, glowing crystal gems, and lotus flowers. Rich vibrant colors, dramatic cinematic lighting, depth of field bokeh background. Abundant, lucky, prosperous atmosphere. Ultra detailed, professional 3D render, 8K.`;

/* --- Negative prompt --- */
const NEGATIVE = encodeURIComponent('phone, smartphone, iPhone, device, frame, border, screen, mockup, cartoon, flat, 2D, low quality, blurry');

/* --- Quality suffix --- */
const QUALITY_SUFFIX = ', ultra detailed, photorealistic, 8K, sharp focus, cinematic lighting, professional render, no blur, no artifacts';

/* --- Describe cards for prompt --- */
function describeCards(cards) {
  return cards.map(c => {
    const visual = CARD_VISUALS[c.id] || `${c.name} tarot card`;
    const kws = (c.keywords || []).slice(0, 3).join(', ');
    const meaning = c.positiveMeaning || '';
    return `• ${visual} — energy: ${kws}${meaning ? ', ' + meaning : ''}`;
  }).join('\n');
}

/* --- Built-in prompt --- */
function builtInPrompt(cards, element, isBirthCard = false) {
  const palette = EL_PALETTE[element] || 'royal purple, gold, crystal white';
  const cardLines = cards.map(c => {
    const visual = CARD_VISUALS[c.id] || `${c.name} tarot card`;
    return visual;
  }).join('; ');

  const intent = isBirthCard
    ? 'soul purpose and destiny energy, timeless personal power'
    : 'good luck, abundance and prosperity, positive manifestation';

  return `${BASE_STYLE} Featured tarot cards as 3D physical objects: ${cardLines}. Color palette: ${palette}. Theme: ${intent}. Lotus flowers, gold coins, glowing gems scattered throughout. Majestic nature background — mountains, celestial sky, or serene lake. Warm golden hour light rays${QUALITY_SUFFIX}.`;
}

/* --- Claude prompt --- */
async function promptViaClaude(cards, element, isBirthCard = false) {
  const palette = EL_PALETTE[element] || 'royal purple, gold, crystal white';
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
      system: 'You are a creative director for luxury 3D digital art. Write vivid, detailed prompts for photorealistic wallpaper renders.',
      messages: [{
        role: 'user',
        content: `Create an image generation prompt for a photorealistic 3D vertical wallpaper (9:16, full bleed, NO phone or device frame).

Look inspired by: abundance wallpapers with physical tarot cards floating in a rich 3D scene, surrounded by gold coins, crystals, lotus flowers, with a majestic nature or celestial background. Think premium, lush, detailed — NOT minimal.

${isBirthCard ? 'Theme: BIRTH CARD / SOUL CARD — timeless personal power, destiny, identity. Regal, empowering, majestic.' : 'Theme: LUCKY TAROT READING — abundance, good fortune, prosperity, positive energy manifesting.'}

Cards to feature as 3D physical objects floating in the scene:
${cardDesc}

Direction:
- Show each tarot card as a REAL PHYSICAL 3D CARD with classic illustrated art, slightly tilted and floating
- Surround with: scattered gold coins, glowing crystal gems, lotus flowers, light rays
- Background: majestic mountains, celestial sky, or serene water — rich and colorful
- Color palette: ${palette}
- Dramatic cinematic lighting, depth of field, volumetric light rays
- Ultra detailed, photorealistic 3D render, 8K quality
- Full bleed — no border, no frame, no device

Write ONLY the image generation prompt in English. Max 180 words.`
      }]
    })
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || 'Claude API error');
  return data.content[0].text.trim();
}

/* --- Gemini prompt --- */
async function promptViaGemini(cards, element, isBirthCard = false) {
  const palette = EL_PALETTE[element] || 'royal purple, gold, crystal white';
  const cardDesc = describeCards(cards);

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create an image prompt for a photorealistic 3D vertical wallpaper (9:16, full bleed, no phone frame).
Style: lush abundant 3D scene with physical tarot cards floating, gold coins, crystal gems, lotus flowers, majestic nature background.
${isBirthCard ? 'Theme: soul power and destiny.' : 'Theme: abundance, good luck, prosperity.'}
Cards (as 3D physical objects):
${cardDesc}
Palette: ${palette}. Cinematic lighting, 8K photorealistic. No device, no border. English only, max 180 words, prompt only.`
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
  const { cards, element, context } = req.body;
  if (!cards || !cards.length) return res.status(400).json({ error: 'cards required' });
  const isBirthCard = context === 'birthcard';

  try {
    let imagePrompt, promptSource;
    if (ANTHROPIC_KEY) {
      imagePrompt = await promptViaClaude(cards, element, isBirthCard);
      promptSource = 'Claude';
    } else if (GEMINI_KEY) {
      imagePrompt = await promptViaGemini(cards, element, isBirthCard);
      promptSource = 'Gemini';
    } else {
      imagePrompt = builtInPrompt(cards, element, isBirthCard);
      promptSource = 'Built-in';
    }

    // Pollinations.AI — iPhone native resolution, FLUX model
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1170&height=2532&model=flux&nologo=true&seed=${seed}&negative_prompt=${NEGATIVE}`;

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
