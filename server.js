const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

/* ================= AI INTERPRETATION ================= */
app.post('/api/interpret', async (req, res) => {
  if (!ANTHROPIC_KEY) {
    return res.status(503).json({ error: 'ฟีเจอร์นี้ยังไม่เปิดใช้ — ต้องตั้งค่า ANTHROPIC_API_KEY บน Railway ก่อน' });
  }
  const { cards, question, type } = req.body;
  if (!cards || !cards.length) return res.status(400).json({ error: 'cards required' });

  const cardLines = cards.map(c =>
    `- ตำแหน่ง "${c.position}": ${c.name} (${c.nameEn})${c.reversed ? ' กลับหัว' : ' ตั้งตรง'} | คีย์เวิร์ด: ${(c.keywords || []).join(', ')} | ความหมาย: ${c.meaning}`
  ).join('\n');

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-8',
        max_tokens: 1500,
        thinking: { type: 'adaptive' },
        system: 'คุณคือนักอ่านไพ่ทาโรต์มืออาชีพที่พูดภาษาไทยอบอุ่น จริงใจ ตรงประเด็น ให้กำลังใจแต่ไม่หลอกให้ฝันหวาน ตีความไพ่แบบเชื่อมโยงทุกใบเป็นเรื่องเดียวกัน ไม่ใช่ไล่อ่านทีละใบ ความยาว 3-5 ย่อหน้า ปิดท้ายด้วยคำแนะนำที่ทำได้จริง 1-2 ข้อ',
        messages: [{
          role: 'user',
          content: `ประเภทการอ่าน: ${type}\n${question ? 'คำถามของผู้ถาม: "' + question + '"\n' : 'ผู้ถามตั้งจิตถามในใจ (ไม่ได้พิมพ์คำถาม)\n'}\nไพ่ที่เปิดได้:\n${cardLines}\n\nช่วยตีความไพ่ทั้งหมดนี้ให้ผมแบบเฉพาะเจาะจง เชื่อมโยงเป็นเรื่องเดียวกัน`
        }]
      })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || 'Claude API error');
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    if (!text) throw new Error('empty response');
    res.json({ text });
  } catch (err) {
    console.error('Interpret error:', err.message);
    res.status(500).json({ error: 'ตีความไม่สำเร็จ กรุณาลองใหม่' });
  }
});

/* ================= DAILY PUSH NOTIFICATIONS ================= */
let webpush = null;
const SUBS_FILE = path.join(__dirname, 'subscriptions.json');

function loadSubs() {
  try { return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8')); } catch (e) { return []; }
}
function saveSubs(subs) {
  try { fs.writeFileSync(SUBS_FILE, JSON.stringify(subs)); } catch (e) {}
}

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush = require('web-push');
  webpush.setVapidDetails('mailto:natthaphat.bot@hotmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

  const cron = require('node-cron');
  // 09:00 Asia/Bangkok every day
  cron.schedule('0 9 * * *', async () => {
    const subs = loadSubs();
    const alive = [];
    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, JSON.stringify({
          title: '🔮 ไพ่ประจำวันของคุณ',
          body: 'พลังงานวันนี้รออยู่ — แตะเพื่อเปิดไพ่เลย',
        }));
        alive.push(sub);
      } catch (e) {
        if (e.statusCode !== 404 && e.statusCode !== 410) alive.push(sub);
      }
    }
    saveSubs(alive);
    console.log(`Daily push sent to ${alive.length} subscribers`);
  }, { timezone: 'Asia/Bangkok' });
}

app.get('/api/vapid-key', (req, res) => {
  if (!VAPID_PUBLIC) return res.status(503).json({ error: 'push not configured' });
  res.json({ key: VAPID_PUBLIC });
});

app.post('/api/subscribe', (req, res) => {
  if (!webpush) return res.status(503).json({ error: 'push not configured' });
  const sub = req.body;
  if (!sub || !sub.endpoint) return res.status(400).json({ error: 'invalid subscription' });
  const subs = loadSubs();
  if (!subs.find(s => s.endpoint === sub.endpoint)) {
    subs.push(sub);
    saveSubs(subs);
  }
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Meaning Tarot server on port ${PORT}`));
