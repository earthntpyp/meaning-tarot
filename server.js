const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

async function buildImagePrompt(cards, element) {
  const instruction = `Create a detailed image generation prompt for an iPhone wallpaper that brings good luck.

Tarot cards from this reading: ${cards.join(', ')}
Dominant element: ${element || 'spirit'}

Requirements:
- Vertical portrait orientation (9:16 aspect ratio for iPhone)
- Dark mystical atmosphere, deep purple and midnight blue sky
- Gold and celestial light accents, shimmering aura
- Sacred geometry patterns (mandalas, stars, sacred symbols)
- Flowing energy waves in colors matching the element: ${element}
- Flowers of good fortune: lotus, chrysanthemum, or peonies
- Glowing celestial objects: crescent moon, stars, cosmic nebula
- Auspicious golden patterns, protective light beams
- Ultra-detailed, ethereal, magical, photorealistic digital art
- Feeling: protective, lucky, abundant, mystical

Write ONLY the image generation prompt in English. No explanations.`;

  if (ANTHROPIC_KEY) {
    // Use Claude (Co) for prompt generation
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 600,
        system: 'You are a master of mystical art and tarot. Create vivid, detailed image generation prompts.',
        messages: [{ role: 'user', content: instruction }],
      })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || JSON.stringify(data));
    return { prompt: data.content[0].text.trim(), source: 'claude' };
  } else {
    // Fallback: use Gemini text
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: instruction }] }] })
      }
    );
    const data = await resp.json();
    if (!resp.ok) throw new Error(JSON.stringify(data));
    return { prompt: data.candidates[0].content.parts[0].text.trim(), source: 'gemini' };
  }
}

app.post('/api/wallpaper', async (req, res) => {
  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }
  const { cards, element } = req.body;
  if (!cards || !cards.length) return res.status(400).json({ error: 'cards required' });

  try {
    // Step 1: Generate image prompt (Claude if key available, else Gemini)
    const { prompt: imagePrompt, source: promptSource } = await buildImagePrompt(cards, element);

    // Step 2: Generate image with Imagen 3
    const imgResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: imagePrompt }],
          parameters: { aspectRatio: '9:16', sampleCount: 1 }
        })
      }
    );

    const imgData = await imgResp.json();
    if (!imgResp.ok) {
      throw new Error(imgData.error?.message || JSON.stringify(imgData));
    }
    if (!imgData.predictions || !imgData.predictions[0]) {
      throw new Error('No image generated. Check Imagen API access.');
    }

    const b64 = imgData.predictions[0].bytesBase64Encoded;
    const mimeType = imgData.predictions[0].mimeType || 'image/png';
    res.json({ image: b64, mimeType, prompt: imagePrompt, promptSource });

  } catch (err) {
    console.error('Wallpaper generation error:', err.message);
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

app.listen(PORT, () => console.log(`Meaning Tarot server on port ${PORT}`));
