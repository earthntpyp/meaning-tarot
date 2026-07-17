/* ===================================================================
   APP LOGIC — Meaning Tarot · Antiqued RWS Edition
   =================================================================== */

/* ---------- Starfield background ---------- */
(function stars(){
  const cv=document.getElementById('stars'), cx=cv.getContext('2d');
  let w,h,st=[];
  function size(){
    w=cv.width=innerWidth; h=cv.height=innerHeight;
    st=Array.from({length:Math.min(180,Math.floor(w*h/8000))},()=>({
      x:Math.random()*w, y:Math.random()*h,
      r:Math.random()*1.5+.3,
      a:Math.random(), sp:Math.random()*.018+.004
    }));
  }
  function loop(){
    cx.clearRect(0,0,w,h);
    for(const s of st){
      s.a+=s.sp;
      const o=.25+Math.abs(Math.sin(s.a))*.75;
      cx.beginPath(); cx.arc(s.x,s.y,s.r,0,7);
      cx.fillStyle=`rgba(244,224,140,${o})`; cx.fill();
    }
    requestAnimationFrame(loop);
  }
  addEventListener('resize',size); size(); loop();
})();

/* ---------- Card images — local cards/ folder (Figma export) with Wikimedia fallback ---------- */
const CARD_FALLBACK={
  M0:"https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg",
  M1:"https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg",
  M2:"https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg",
  M3:"https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg",
  M4:"https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg",
  M5:"https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg",
  M6:"https://upload.wikimedia.org/wikipedia/commons/3/3a/TheLovers.jpg",
  M7:"https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg",
  M8:"https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg",
  M9:"https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg",
  M10:"https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg",
  M11:"https://upload.wikimedia.org/wikipedia/commons/e/e0/RWS_Tarot_11_Justice.jpg",
  M12:"https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg",
  M13:"https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg",
  M14:"https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg",
  M15:"https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg",
  M16:"https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg",
  M17:"https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg",
  M18:"https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg",
  M19:"https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg",
  M20:"https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg",
  M21:"https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg",
};
// Local Figma exports take priority — cards/M0.jpg, cards/W1.jpg, etc.
window.CARD_FALLBACK=CARD_FALLBACK; // expose for onerror handlers
const CARD_IMG=new Proxy({},{
  get(_, id){ return `cards/${id}.jpg`; }
});

/* ---------- Site meanings (ref: thestreetratchada.com) ---------- */
const SITE_HEADLINE={
  M0: {up:"การเริ่มต้นใหม่ เส้นทางใหม่ๆ และโอกาสที่กำลังเปิดกว้าง",            rev:"ระวังการตัดสินใจที่ยังไม่พร้อม จังหวะยังไม่ถึง"},
  M1: {up:"ถึงเวลาลงมือทำแล้ว คุณมีทุกอย่างพร้อมอยู่ในมือ",                    rev:"ลังเลหรือใช้ความสามารถผิดทาง"},
  M2: {up:"ความเก่ง ความสามารถสูง และความเฉลียวฉลาดของคุณกำลังโดดเด่น",        rev:"ขาดความชัดเจนหรือถูกปิดกั้นจากข้อมูลสำคัญ"},
  M3: {up:"ความอุดมสมบูรณ์ ความมั่งมี และสิ่งดีๆ กำลังเบ่งบาน",                rev:"ความซบเซาหรือขาดแรงบันดาลใจ ต้องหล่อเลี้ยงตัวเองก่อน"},
  M4: {up:"อำนาจ ความมั่นคง และการควบคุมที่แข็งแกร่ง",                          rev:"ใช้อำนาจผิดทางหรือถูกกดดันจากผู้มีอำนาจเหนือ"},
  M5: {up:"ความรับผิดชอบ การเป็นที่พึ่งของคนอื่น และการยึดมั่นในหลักการ",       rev:"ปฏิเสธคำแนะนำหรือไม่ยอมรับกฎที่ควรปฏิบัติ"},
  M6: {up:"ความรักที่ดีงามหรือการตัดสินใจครั้งสำคัญที่ต้องใช้หัวใจ",           rev:"ความไม่ลงรอยในความสัมพันธ์หรือค่านิยมที่ขัดแย้งกัน"},
  M7: {up:"ความมุ่งมั่นและความพยายามที่กำลังนำไปสู่ความสำเร็จ",                 rev:"ขาดทิศทางหรือสูญเสียแรงจูงใจกลางทาง"},
  M8: {up:"ความเข้มแข็ง ความอดทน และการจัดการปัญหาได้อย่างชาญฉลาด",            rev:"ความอ่อนแอหรือขาดความมั่นใจในการรับมือกับอุปสรรค"},
  M9: {up:"ต้องการเวลาสำหรับตัวเอง ทบทวนชีวิตก่อนก้าวต่อ",                     rev:"โดดเดี่ยวมากเกินไปหรือหลีกเลี่ยงการเผชิญความจริง"},
  M10:{up:"การเปลี่ยนแปลงครั้งสำคัญกำลังมาถึง โชคชะตากำลังหมุน",               rev:"ต่อต้านการเปลี่ยนแปลงหรือดวงยังไม่เอื้ออำนวย"},
  M11:{up:"ความยุติธรรมและผลลัพธ์ที่สมเหตุสมผลกำลังจะปรากฏ",                    rev:"การตัดสินที่ไม่เป็นธรรมหรือผลลัพธ์ที่ไม่คาดหวัง"},
  M12:{up:"ต้องรอคอยก่อน หยุดพักและมองจากมุมใหม่จะพบคำตอบ",                     rev:"ละทิ้งความอดทนเร็วเกินไปหรือยึดติดกับมุมมองเดิม"},
  M13:{up:"ปิดฉากบทเก่าเพื่อเริ่มบทใหม่ที่ดีกว่า การเปลี่ยนแปลงนี้จำเป็น",   rev:"ยึดติดกับสิ่งเก่าและต่อต้านการเปลี่ยนแปลงที่จำเป็น"},
  M14:{up:"ต้องหาจุดสมดุล ประนีประนอม และดำเนินการอย่างค่อยเป็นค่อยไป",         rev:"ความไม่สมดุลหรือความสุดโต่งที่กำลังสร้างปัญหา"},
  M15:{up:"ถูกผูกมัดด้วยความกลัวหรือนิสัยที่ดึงคุณไว้จากอิสรภาพที่แท้จริง",  rev:"กำลังหลุดพ้นจากสิ่งที่ผูกมัด เริ่มมองเห็นทางออก"},
  M16:{up:"การเปลี่ยนแปลงฉับพลันที่หลีกเลี่ยงไม่ได้ ต้องเตรียมรับมือ",        rev:"หลีกเลี่ยงวิกฤตได้หรือผลกระทบน้อยกว่าที่กลัว"},
  M17:{up:"ความสมหวัง ความหวัง และสิ่งที่ต้องการกำลังจะเป็นจริง",              rev:"สูญเสียความหวังหรือผิดหวังจากสิ่งที่คาดหวังไว้"},
  M18:{up:"ระวังสิ่งที่ซ่อนเร้น ปัญหาหรือการหลอกลวงที่กำลังใกล้เข้ามา",      rev:"ความจริงกำลังถูกเปิดเผย สิ่งที่ซ่อนอยู่กำลังกระจ่าง"},
  M19:{up:"ข่าวดีและความสำเร็จกำลังมาถึง ความพยายามที่ผ่านมากำลังออกผล",       rev:"อุปสรรคชั่วคราวหรือต้องรอนานกว่าที่คาด"},
  M20:{up:"การตัดสินใจสำคัญที่จะส่งผลต่อชีวิต ถึงเวลาลุกขึ้นและตอบรับเสียงเรียก",rev:"ผัดวันประกันพรุ่งหรือพลาดโอกาสสำคัญที่ควรคว้า"},
  M21:{up:"ความสำเร็จสมบูรณ์ ทุกอย่างราบรื่น สิ่งที่ต้องการกำลังสำเร็จ",       rev:"สิ่งที่ทำยังไม่สมบูรณ์หรือมีงานค้างคาที่ต้องจัดการก่อน"},
};

/* ---------- Element significance ---------- */
const EL_INFO={
  fire:{
    icon:"🔥", name:"ธาตุไฟ",
    meaning:"พลังงานแห่งการลงมือทำ ความกล้าหาญ และความปรารถนา",
    inReading:"ไพ่ธาตุไฟขึ้นในตำแหน่งนี้ — บอกว่าพลังขับเคลื่อนและแรงปรารถนาของคุณกำลังทำงาน ถ้าตั้งตรงคือพลังงานไหล ถ้ากลับหัวคือพลังถูกดับหรือหันผิดทาง",
    color:"var(--fire-l)",
  },
  water:{
    icon:"💧", name:"ธาตุน้ำ",
    meaning:"พลังงานแห่งอารมณ์ ความรัก และสัญชาตญาณ",
    inReading:"ไพ่ธาตุน้ำขึ้นในตำแหน่งนี้ — เรื่องที่เกี่ยวข้องกับความรู้สึก ความสัมพันธ์ และเสียงข้างในของคุณกำลังสำคัญมาก ฟังหัวใจให้มากกว่าเหตุผล",
    color:"var(--water-l)",
  },
  air:{
    icon:"🌬️", name:"ธาตุลม",
    meaning:"พลังงานแห่งความคิด การสื่อสาร และการตัดสินใจ",
    inReading:"ไพ่ธาตุลมขึ้นในตำแหน่งนี้ — บอกว่าความคิด คำพูด และการตัดสินใจคือหัวใจของเรื่องนี้ ใช้เหตุผลให้คมชัด และระวังคำพูดที่อาจสร้างความเสียหาย",
    color:"var(--air-l)",
  },
  earth:{
    icon:"🌱", name:"ธาตุดิน",
    meaning:"พลังงานแห่งความมั่นคง การเงิน และสิ่งที่จับต้องได้",
    inReading:"ไพ่ธาตุดินขึ้นในตำแหน่งนี้ — เรื่องวัตถุ เงินทอง งาน และความมั่นคงในชีวิตกำลังถูกเน้น ลงมือสร้างอย่างเป็นรูปธรรม อย่าแค่วางแผนในหัว",
    color:"var(--earth-l)",
  },
  spirit:{
    icon:"✨", name:"ธาตุจิต",
    meaning:"พลังงานแห่งจิตวิญญาณ การเปลี่ยนแปลงใหญ่ และโชคชะตา",
    inReading:"ไพ่ธาตุจิตขึ้นในตำแหน่งนี้ — มีพลังงานที่ใหญ่กว่าตัวเองกำลังทำงาน บทเรียนสำคัญหรือการเปลี่ยนแปลงระดับชีวิตกำลังเคลื่อนเข้ามา",
    color:"var(--spirit-l)",
  },
};

/* ---------- Elemental Dignities ---------- */
// fire+air=เสริม, water+earth=เสริม, fire+water=ต้าน, air+earth=ต้าน, same=เพิ่มพลัง
const EL_DIGNITY={
  fire: {fire:'amplify',water:'oppose',air:'support',earth:'oppose',spirit:'support'},
  water:{fire:'oppose', water:'amplify',air:'oppose', earth:'support',spirit:'support'},
  air:  {fire:'support',water:'oppose', air:'amplify',earth:'oppose', spirit:'support'},
  earth:{fire:'oppose', water:'support',air:'oppose', earth:'amplify',spirit:'support'},
  spirit:{fire:'support',water:'support',air:'support',earth:'support',spirit:'amplify'},
};
const DIGNITY_LABEL={
  amplify:"⚡ เพิ่มพลัง — ธาตุเดียวกัน ความหมายถูกขยายแรงขึ้น",
  support:"✨ เสริมกัน — ธาตุทั้งสองส่งแรงหนุนซึ่งกันและกัน",
  oppose: "⚔️ ต้านกัน — ธาตุทั้งสองลดทอนกัน ความหมายถูกทำให้อ่อนลง",
};

/* ---------- Rank meanings (Minor Arcana numerology) ---------- */
const RANK_MEANING={
  1: "Ace — จุดเริ่มต้น พลังบริสุทธิ์ที่ยังไม่ถูกกำหนดทิศทาง เมล็ดพันธุ์แห่งบทใหม่",
  2: "สอง — จุดตัดสินใจ สมดุลระหว่างสองทาง ความเป็นคู่ที่ต้องเลือก",
  3: "สาม — การขยายและการสร้าง ผลแรกๆ จากการลงมือทำเริ่มปรากฏ",
  4: "สี่ — ฐานรากและความมั่นคง เวลาพักหรือรวบรวมพลังก่อนก้าวต่อ",
  5: "ห้า — ความขัดแย้งและการทดสอบ แรงเสียดทานที่บังคับให้เติบโตและปรับตัว",
  6: "หก — ความกลมกลืนและการไหลลื่น ช่วงแห่งการแบ่งปันและความร่วมมือ",
  7: "เจ็ด — การประเมินและการทดสอบภายใน จุดที่ต้องหันมองตัวเองตามความจริง",
  8: "แปด — การเคลื่อนที่และความก้าวหน้า พลังงานไหลลื่น การกระทำนำผล",
  9: "เก้า — ปัญญาที่สั่งสมและใกล้สมบูรณ์ แต่ยังมีบทเรียนสุดท้ายรออยู่",
  10:"สิบ — วงจรสิ้นสุด บทหนึ่งจบลงอย่างสมบูรณ์เพื่อเปิดทางสู่บทใหม่",
  11:"Page — สารหรือโอกาสใหม่ พลังงานของนักเรียนผู้เริ่มต้น อยากรู้อยากเห็น",
  12:"Knight — การลงมือทำและการเดินหน้า พลังงานที่ต้องการทิศทางและการควบคุม",
  13:"Queen — อำนาจที่หล่อเลี้ยงจากภายใน รับรู้อย่างลึกซึ้ง บ่มเพาะด้วยความใส่ใจ",
  14:"King — อำนาจที่สุกงอมแสดงออกสู่ภายนอก ความเป็นผู้นำและความเชี่ยวชาญ",
};

/* ---------- Reversed philosophy (not just "bad" — energy turned inward) ---------- */
const REV_LAYER={
  fire: "พลังไฟที่กลับหัวคือพลังที่ถูกกดข่ม ความโกรธที่ซ่อนไว้ หรือแรงปรารถนาที่ยังหาทางออกไม่ได้",
  water:"พลังน้ำที่กลับหัวคืออารมณ์ที่ถูกกดทับ ความรู้สึกที่ยังพูดไม่ออก หรือสัญชาตญาณที่ถูกเพิกเฉย",
  air:  "พลังลมที่กลับหัวคือความคิดวนซ้ำ การสื่อสารที่ติดขัด หรือการตัดสินใจที่ยังไม่พร้อม",
  earth:"พลังดินที่กลับหัวคือความมั่นคงที่สั่นคลอน การยึดติดกับวัตถุ หรือความกลัวการสูญเสียที่บล็อกการเติบโต",
  spirit:"พลังจิตที่กลับหัวคือบทเรียนที่ยังไม่ยอมรับ หรือพลังงานชะตากรรมที่กำลังถูกขัดขืน",
};

/* ---------- Spread definitions ---------- */
const SPREADS={
  daily:{
    title:"ดวงรายวัน", icon:"☀️", count:1, layout:"layout-1",
    focus:"ตั้งจิตถามถึงพลังงานและสิ่งที่ควรโฟกัสสำหรับวันนี้",
    positions:[{name:"พลังงานของวันนี้",hint:"สิ่งที่จักรวาลต้องการบอกคุณวันนี้"}]
  },
  weekly:{
    title:"ดวงรายสัปดาห์", icon:"🌓", count:3, layout:"layout-3",
    focus:"ตั้งจิตถามถึงภาพรวมและทิศทางของสัปดาห์นี้",
    positions:[
      {name:"อดีต / ต้นสัปดาห์",hint:"พลังงานที่ผ่านมาและรากฐานของสถานการณ์"},
      {name:"ปัจจุบัน / กลางสัปดาห์",hint:"สิ่งที่กำลังเกิดขึ้นและจุดที่ควรใส่ใจ"},
      {name:"อนาคต / ปลายสัปดาห์",hint:"แนวโน้มและผลลัพธ์ที่กำลังจะมาถึง"}
    ]
  },
  monthly:{
    title:"ดวงรายเดือน", icon:"🌕", count:5, layout:"layout-5",
    focus:"ตั้งจิตถามถึงบทเรียนและเส้นทางตลอดเดือนนี้",
    positions:[
      {name:"ภาพรวมของเดือน",hint:"ธีมหลักและพลังงานโดยรวม"},
      {name:"อุปสรรค / สิ่งท้าทาย",hint:"สิ่งที่ต้องระวังหรือเผชิญ"},
      {name:"โอกาส / สิ่งสนับสนุน",hint:"พลังบวกและประตูที่กำลังเปิด"},
      {name:"คำแนะนำ",hint:"สิ่งที่ควรทำเพื่อก้าวผ่าน"},
      {name:"ผลลัพธ์",hint:"แนวโน้มปลายทางหากเดินตามเส้นทางนี้"}
    ]
  },
  question:{
    title:"ถามไพ่", icon:"🎯", count:3, layout:"layout-3",
    focus:"ตั้งจิตให้นิ่ง นึกถึงคำถามของคุณ แล้วพลิกไพ่ทีละใบ",
    positions:[
      {name:"แก่นของคำถาม",    hint:"พลังงานหลักที่ซ่อนอยู่เบื้องหลังคำถามนี้ — ส่วนที่คุณอาจยังไม่เห็น"},
      {name:"สิ่งที่ต้องรู้",   hint:"ปัจจัยสำคัญที่ควรนำมาพิจารณา อาจเป็นสิ่งที่มองข้ามหรือกำลังกดข่มไว้"},
      {name:"คำตอบ / แนวทาง",  hint:"ทิศทางที่ไพ่แนะนำสำหรับคำถามของคุณโดยตรง"},
    ]
  },
};

/* ---------- State ---------- */
let state={type:null,spread:null,cards:[],flipped:0,question:''};

/* ---------- Utilities ---------- */
function shuffle(a){
  a=a.slice();
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  scrollTo(0,0);
}
function elLabel(el){return(ELEMENT_TH[el]||el);}

/* ---------- Start a reading ---------- */
function startReading(type){
  state.type=type;
  state.spread=SPREADS[type];
  const picked=shuffle(DECK).slice(0,state.spread.count)
    .map(c=>({...c, reversed:Math.random()<0.42}));
  state.cards=picked;
  state.flipped=0;
  renderDraw();
  show('screen-draw');
}

/* ---------- Render draw screen ---------- */
function renderDraw(){
  const sp=state.spread;
  document.getElementById('draw-title').textContent=`${sp.icon} ${sp.title}`;
  document.getElementById('draw-focus').textContent=sp.focus;
  document.getElementById('shuffle-note').style.display='';
  document.getElementById('btn-reveal').style.display='none';

  const wrap=document.getElementById('spread');
  wrap.className='spread '+sp.layout;
  wrap.innerHTML='';
  state.flipped=0;

  state.cards.forEach((c,i)=>{
    const numLabel=c.type==='major'?'★ '+c.number:c.number;
    const elTxt=elLabel(c.el).split(' ')[0];
    const kwsHtml=c.kw.slice(0,3).map(k=>`<span class="card-kw">${k}</span>`).join('');

    const slot=document.createElement('div');
    slot.className='card-slot';
    slot.innerHTML=`
      <div class="card dealing" style="animation-delay:${i*0.13}s" data-i="${i}">
        <div class="face back">
          <div class="back-inner">✦</div>
        </div>
        <div class="face front el-${c.el}${c.reversed?' reversed':''}">
          <div class="card-header">
            <span class="card-num">${numLabel}</span>
            <span class="card-el">${elTxt}</span>
          </div>
          <div class="card-art">
            <img class="card-img" src="cards/${c.id}.jpg" alt="${c.name_th}"
              onerror="var fb=window.CARD_FALLBACK&&window.CARD_FALLBACK['${c.id}'];if(fb&&this.src.indexOf('cards/')>=0){this.src=fb;this.onerror=null}else{this.style.display='none'}">
          </div>
          <div class="card-footer">
            <span class="card-name">${c.name_th}</span>
            <div class="card-kws">${kwsHtml}</div>
            ${c.reversed?'<span class="rev-tag">↺ กลับหัว</span>':''}
          </div>
        </div>
      </div>
      <div class="slot-label">${sp.positions[i].name}</div>`;
    wrap.appendChild(slot);
    slot.querySelector('.card').addEventListener('click',function(){flipCard(this);});
  });
}

function flipCard(card){
  if(card.classList.contains('flipped')) return;
  card.classList.remove('dealing');
  card.classList.add('flipped');
  state.flipped++;
  if(state.flipped===state.cards.length){
    document.getElementById('shuffle-note').style.display='none';
    const b=document.getElementById('btn-reveal');
    b.style.display='';
    b.scrollIntoView({behavior:'smooth',block:'center'});
  }
}

/* ---------- Tab switching ---------- */
function switchTab(btn, tabName){
  const item=btn.closest('.read-item');
  item.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  item.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  item.querySelector(`.tab-pane[data-tab="${tabName}"]`).classList.add('active');
}

/* ---------- Get first meaningful sentence ---------- */
function firstSent(text){
  if(!text) return '';
  const parts=text.split(/\s+—\s+|\s*,\s*(?=[ก-๙A-Z])/);
  return parts[0].trim();
}

/* ---------- Elemental dignity between two cards ---------- */
function dignityBetween(c1, c2){
  const rel=(EL_DIGNITY[c1.el]||{})[c2.el]||'neutral';
  return {rel, label:DIGNITY_LABEL[rel]||''};
}

/* ---------- Rank note for Minor Arcana ---------- */
function rankNote(card){
  if(card.type==='major') return '';
  const n=Number(card.number);
  return RANK_MEANING[n]||'';
}

/* ---------- Court card role interpretation ---------- */
function courtNote(card, rv){
  const n=Number(card.number);
  if(n<11||n>14) return '';
  const roles={
    11: rv?'Page กลับหัว — ข่าวสารล่าช้า หรือคุณกำลังอยู่ในช่วงเรียนรู้แต่ยังลังเล':'Page — อาจหมายถึงคนอายุน้อยในชีวิต หรือคุณกำลังเริ่มบทใหม่ในฐานะผู้เรียนรู้',
    12: rv?'Knight กลับหัว — พลังที่หุนหันพลันแล่นหรือหยุดชะงักกลางทาง ตรวจสอบทิศทางก่อน':'Knight — พลังงานเดินหน้าแรง อาจหมายถึงคนที่ชอบลงมือทำ หรือช่วงที่ต้องเคลื่อนไหว',
    13: rv?'Queen กลับหัว — พลังหล่อเลี้ยงถูกกดข่ม หรือการดูแลตัวเองที่ขาดหาย':'Queen — อาจหมายถึงผู้หญิงที่มีอิทธิพล หรือพลังงานที่ต้องบ่มเพาะและดูแลอย่างใจเย็น',
    14: rv?'King กลับหัว — ผู้มีอำนาจที่ใช้อำนาจผิดทาง หรือความเป็นผู้นำที่สั่นคลอน':'King — อาจหมายถึงผู้มีอำนาจในชีวิต หรือพลังงานที่ต้องการความชัดเจนและการตัดสินใจ',
  };
  return roles[n]||'';
}

/* ---------- Main fortune-teller paragraph (position + card meaning) ---------- */
function buildMainReading(card, pos, rv){
  const name=`<b>${card.name_th}</b>`;
  // Use site headline (thestreetratchada.com) for Major Arcana, fallback to deck.js
  const siteKW=SITE_HEADLINE[card.id];
  const headline=siteKW?(rv?siteKW.rev:siteKW.up):firstSent(rv?card.rev:card.up);

  const q=state.question?`"${state.question}"`:null;
  const tpl={
    "พลังงานของวันนี้":
      `วันนี้ไพ่${name}ขึ้นมาเพื่อบอกคุณว่า — ${headline}`,
    "อดีต / ต้นสัปดาห์":
      `ไพ่${name}สะท้อนให้เห็นช่วงที่ผ่านมา — ${headline} นี่คือรากของสิ่งที่กำลังเกิดขึ้น`,
    "ปัจจุบัน / กลางสัปดาห์":
      `ตอนนี้ไพ่${name}บอกตรงๆ ว่า ${headline} — นี่คือสิ่งที่คุณกำลังเผชิญอยู่`,
    "อนาคต / ปลายสัปดาห์":
      `ไพ่${name}ชี้ให้เห็นแนวโน้มว่า ${headline} — เตรียมตัวรับสิ่งนี้ไว้`,
    "ภาพรวมของเดือน":
      `ธีมหลักของเดือนนี้ ไพ่${name}บอกว่า ${headline}`,
    "อุปสรรค / สิ่งท้าทาย":
      `ไพ่${name}เผยให้เห็นอุปสรรคที่ต้องระวัง — ${headline}`,
    "โอกาส / สิ่งสนับสนุน":
      `ไพ่${name}บอกว่าโอกาสของคุณคือ ${headline} — อย่าปล่อยให้ผ่านไป`,
    "คำแนะนำ":
      `ไพ่${name}แนะนำชัดเจนว่า ${headline}`,
    "ผลลัพธ์":
      `ถ้าเดินทางนี้ต่อ ไพ่${name}บอกว่า ${headline}`,
    // Question spread positions
    "แก่นของคำถาม":
      q?`เบื้องหลังคำถาม ${q} ไพ่${name}บอกว่า — ${headline} นี่คือแก่นแท้ที่คำถามนี้ซ่อนอยู่`
       :`ไพ่${name}เผยแก่นของเรื่องนี้ว่า — ${headline}`,
    "สิ่งที่ต้องรู้":
      `ก่อนตัดสินใจ ไพ่${name}บอกให้รู้ว่า — ${headline}${rv?' สิ่งนี้อาจถูกกดข่มไว้ ลองมองให้ลึกขึ้น':''}`,
    "คำตอบ / แนวทาง":
      `ไพ่${name}ชี้แนวทางว่า ${headline}`,
    "คำตอบ":
      `ไพ่${name}ตอบตรงๆ ว่า — ${headline}`,
  };
  return tpl[pos.name]||`ไพ่${name}บอกว่า ${headline}`;
}

/* ---------- Tab content in fortune-teller voice ---------- */
function buildTabText(card, domain, rv){
  const raw=rv?(card[domain]&&card[domain][1]):(card[domain]&&card[domain][0]);
  const spirit=card.spirit||'';
  if(domain==='spirit'){
    const s=firstSent(spirit);
    return s?`${s}${card.action?' — '+card.action:''}`:'';
  }
  if(!raw) return '';
  const core=firstSent(raw);
  const prefixes={
    love: rv?`ด้านความรัก — ${core}`:`ด้านความรัก — ${core}`,
    work: rv?`การงานและการเงิน — ${core}`:`การงานและการเงิน — ${core}`,
    health:`สุขภาพ — ${core}`,
  };
  return prefixes[domain]||core;
}

/* ---------- Build reading item HTML ---------- */
function buildReadItem(c, pos, idx){
  const rv=c.reversed;
  const numLabel=c.type==='major'?'★':c.number;
  const elTxt=elLabel(c.el).split(' ')[0];

  // Mini card — local image with simple fallback (no complex onerror to avoid template-literal escaping bugs)
  const fallbackUrl=CARD_FALLBACK[c.id]||'';
  const onErr=fallbackUrl
    ? `if(this.src.indexOf('cards/')>=0){this.src='${fallbackUrl}'}else{this.style.display='none'};this.onerror=null`
    : `this.style.display='none';this.onerror=null`;
  const miniHtml=`<div class="mini-card-img${rv?' rev':''}">
      <img src="cards/${c.id}.jpg" alt="${c.name_th}" loading="lazy" onerror="${onErr}">
      <span class="mc-name-overlay">${c.name_th}${rv?' ↺':''}</span>
    </div>`;

  // Main reading paragraph
  const mainPara=buildMainReading(c, pos, rv);

  // Element block
  const el=EL_INFO[c.el]||{icon:'',name:c.el,meaning:'',inReading:'',color:'var(--gold)'};
  const elHtml=`
    <div class="el-block" style="border-color:${el.color}22;background:${el.color}0d">
      <span class="el-block-title" style="color:${el.color}">${el.icon} ${el.name} — ${el.meaning}</span>
      <span class="el-block-body">${el.inReading}</span>
    </div>`;

  // Rank note (Minor Arcana) + court note
  const rn=rankNote(c);
  const cn=courtNote(c,rv);
  const rankHtml=rn?`<div class="rank-note">🔢 ${rn}</div>`:'';
  const courtHtml=cn?`<div class="court-note">👤 ${cn}</div>`:'';

  // Reversed layer note
  const revLayerHtml=rv&&REV_LAYER[c.el]
    ?`<div class="rev-layer">↺ ${REV_LAYER[c.el]}</div>`:'';

  // Keywords
  const kwsHtml=c.kw.map(k=>`<span class="kw">${k}</span>`).join('');

  // Timing hint (major arcana only)
  const timingHint=c.attrs&&c.attrs['เวลา']
    ?`<span class="timing-hint">⏱ จังหวะเวลา: ${c.attrs['เวลา']}${c.attrs['ดาว / ราศี']?' · ♈ '+c.attrs['ดาว / ราศี'].split('·')[0].trim():''}</span>`:'';

  // Action box
  const actionHtml=c.action
    ?`<div class="action-box"><strong>⚡ สิ่งที่ควรทำตอนนี้:</strong> ${c.action}</div>`:'';

  return `
    <div class="read-item">
      <div class="read-item-top">
        ${miniHtml}
        <div class="read-info">
          <div class="pos-label">▸ ${pos.name}</div>
          <div class="card-title">${c.name_th}</div>
          <div class="card-title-en">${c.name_en}</div>
          <span class="orient ${rv?'rev':'up'}">${rv?'⤵ กลับหัว':'⤴ ตั้งตรง'}</span>
          <p class="synthesis">${mainPara}</p>
          ${rankHtml}${courtHtml}${revLayerHtml}
          ${elHtml}
          <div class="tab-bar">
            <button class="tab-btn active" onclick="switchTab(this,'love')">💞 ความรัก</button>
            <button class="tab-btn" onclick="switchTab(this,'work')">💼 การงาน</button>
            <button class="tab-btn" onclick="switchTab(this,'health')">🌿 สุขภาพ</button>
            <button class="tab-btn" onclick="switchTab(this,'spirit')">✨ คำแนะนำ</button>
          </div>
          <div class="tab-pane active" data-tab="love">${buildTabText(c,'love',rv)}</div>
          <div class="tab-pane" data-tab="work">${buildTabText(c,'work',rv)}</div>
          <div class="tab-pane" data-tab="health">${buildTabText(c,'health',rv)}</div>
          <div class="tab-pane" data-tab="spirit">${buildTabText(c,'spirit',rv)}</div>
          <div class="kws">${kwsHtml}</div>
          ${timingHint}
          ${actionHtml}
        </div>
      </div>
    </div>`;
}

/* ---------- Show reading screen ---------- */
function showReading(){
  const sp=state.spread;
  document.getElementById('reading-title').textContent=`${sp.icon} ${sp.title}`;
  document.getElementById('reading-date').textContent=thaiDate();

  // Show meditation note in question mode (no typed text — user meditates silently)
  const qDisplay=document.getElementById('question-display');
  if(state.type==='question'||state.type==='question1'){
    qDisplay.textContent='อ่านไพ่ด้วยจิตที่นิ่ง — ความหมายจะปรากฏตามคำถามในใจคุณเอง';
    qDisplay.style.display='block';
  } else {
    qDisplay.style.display='none';
  }

  const list=document.getElementById('reading-list');
  list.innerHTML=state.cards.map((c,i)=>buildReadItem(c,sp.positions[i],i)).join('');

  document.getElementById('summary').innerHTML=buildSummary();

  // Yes/No verdict — only for question spreads
  const yesnoEl=document.getElementById('yesno-verdict');
  const isQuestion=state.type==='question'||state.type==='question1';
  if(isQuestion){
    const v=yesNoVerdict(state.cards);
    yesnoEl.innerHTML=buildYesNoHTML(v,state.cards);
    yesnoEl.style.display='flex';
    yesnoEl.style.flexDirection='column';
    yesnoEl.style.alignItems='center';
  } else {
    yesnoEl.style.display='none';
    yesnoEl.innerHTML='';
  }

  // Quick Read — all spreads
  const qrEl=document.getElementById('quick-read');
  qrEl.innerHTML=buildQuickRead(state.cards);
  qrEl.style.display='flex';
  qrEl.style.flexDirection='column';
  qrEl.style.alignItems='center';

  // Domain summary — all spreads
  const domEl=document.getElementById('domain-summary');
  const domHTML=buildDomainSummary(state.cards);
  if(domHTML){
    domEl.innerHTML=domHTML;
    domEl.style.display='block';
  } else {
    domEl.style.display='none';
  }

  show('screen-reading');
}

/* ---------- Cross-card synthesis summary (real tarot methodology) ---------- */
function buildSummary(){
  const cs=state.cards;
  const EL_COLOR={fire:"#f06a2a",water:"#39a0d8",air:"#c0a050",earth:"#52a84e",spirit:"#9c3ce0"};
  const EL_NAME_SHORT={fire:"🔥ไฟ",water:"💧น้ำ",air:"🌬ลม",earth:"🌱ดิน",spirit:"✨จิต"};

  // ── 1. ธาตุ (Element analysis) ──────────────────────────
  const elc={};
  cs.forEach(c=>elc[c.el]=(elc[c.el]||0)+1);
  const elSorted=Object.entries(elc).sort((a,b)=>b[1]-a[1]);
  const domEl=elSorted[0];
  const domElText={
    fire:"ช่วงนี้พลังไฟครองการอ่าน — บอกว่าความปรารถนา ความกล้าหาญ และแรงผลักดันเป็นหัวใจหลัก ลงมือทำดีกว่ารอ",
    water:"ช่วงนี้พลังน้ำครองการอ่าน — อารมณ์ ความสัมพันธ์ และสัญชาตญาณกำลังนำทาง ฟังหัวใจมากกว่าเหตุผล",
    air:"ช่วงนี้พลังลมครองการอ่าน — ความคิด การสื่อสาร และการตัดสินใจคือหัวใจ ใช้เหตุผลให้คมชัด ระวังคำพูด",
    earth:"ช่วงนี้พลังดินครองการอ่าน — เรื่องการเงิน งาน และความมั่นคงกำลังถูกเน้น ลงมือสร้างอย่างเป็นรูปธรรม",
    spirit:"ช่วงนี้พลังจิตครองการอ่าน — พลังชะตากรรมกำลังทำงาน บทเรียนใหญ่กำลังมา เปิดรับการเปลี่ยนแปลงระดับชีวิต",
  }[domEl[0]]||"พลังงานหลากหลายธาตุผสมผสาน — ช่วงแห่งความสมดุลและการปรับตัว";

  // Check if single suit dominates (3+ out of 5, or 2+ out of 3)
  const suitThreshold=cs.length>=5?3:2;
  const domSuitEntry=elSorted.find(([,n])=>n>=suitThreshold);
  let suitWarning='';
  if(domSuitEntry&&cs.length>1){
    const sn=EL_NAME_SHORT[domSuitEntry[0]]||domSuitEntry[0];
    suitWarning=`<div class="methodology-note">📊 <b>สังเกต:</b> ไพ่${sn}ขึ้น ${domSuitEntry[1]} ใบจาก ${cs.length} ใบ — นักดูไพ่เรียกว่า "ธาตุเด่น" ซึ่งบอกว่าพลังงานด้านนี้กำลังถาโถมเข้ามาในชีวิตคุณแบบที่ปฏิเสธไม่ได้</div>`;
  }

  // ── 2. ศักดิ์ธาตุระหว่างไพ่ (Elemental dignities) ──────
  let dignityHtml='';
  if(cs.length>1){
    const pairs=[];
    for(let i=0;i<cs.length-1;i++){
      const d=dignityBetween(cs[i],cs[i+1]);
      const c1n=cs[i].name_th, c2n=cs[i+1].name_th;
      const col=d.rel==='support'?'#52c878':d.rel==='amplify'?'#f0c040':d.rel==='oppose'?'#e05050':'#888';
      pairs.push(`<div class="dignity-pair" style="border-left:3px solid ${col}22;padding-left:.6rem">
        <span style="color:${col}">${d.label}</span>
        <br><small style="opacity:.7">${c1n} + ${c2n}</small>
      </div>`);
    }
    dignityHtml=`<details class="adv">
      <summary>⚖️ พลังไพ่ข้างกัน เสริมหรือต้านกัน? <span class="adv-hint">แตะเพื่อดู</span></summary>
      <div class="adv-body">
        <p style="opacity:.75;font-size:.85rem;margin:.3rem 0 .6rem">ไพ่ที่อยู่ข้างกันส่งผลต่อกัน — ธาตุที่เสริมกันทำให้ความหมายแข็งแกร่งขึ้น ธาตุที่ต้านกันทำให้ความหมายอ่อนลงหรือซับซ้อนขึ้น</p>
        ${pairs.join('')}
      </div>
    </details>`;
  }

  // ── 3. ไพ่กลับหัว (Reversed analysis) ─────────────────
  const revCards=cs.filter(c=>c.reversed);
  const rev=revCards.length;
  let revText='';
  if(rev===0){
    revText='ไพ่ทุกใบตั้งตรง — พลังงานไหลออกสู่ภายนอกอย่างเปิดเผย คุณกำลังแสดงออกและรับสิ่งต่างๆ ได้เต็มที่';
  } else if(rev===cs.length){
    revText='ไพ่กลับหัวทุกใบ — สัญญาณชัดเจนให้หันมองภายใน พลังงานถูกกดข่มหรือยังติดขัด ช่วงนี้เหมาะสำหรับการทบทวนและปลดล็อกมากกว่าการเดินหน้า';
  } else {
    const revNames=revCards.map(c=>c.name_th).join(', ');
    revText=`มีไพ่กลับหัว ${rev} ใบ (${revNames}) — พลังงานเหล่านี้กำลังทำงานภายในมากกว่าภายนอก อาจมีสิ่งที่ยังไม่ได้พูดถึงหรือยังไม่ยอมรับ ควรหันมาสำรวจส่วนนั้นก่อน`;
  }

  // ── 4. ไพ่ชุดใหญ่ vs ชุดเล็ก (Major/Minor weight) ────
  const major=cs.filter(c=>c.type==='major').length;
  let majorText='';
  if(major===0){
    majorText='ไพ่ทั้งหมดเป็นชุดเล็ก (Minor Arcana) — เรื่องราวอยู่ในระดับชีวิตประจำวันที่คุณมีอำนาจควบคุมได้ ผลลัพธ์ขึ้นอยู่กับการกระทำของคุณโดยตรง';
  } else if(major===cs.length){
    majorText='ไพ่ทั้งหมดเป็นชุดใหญ่ (Major Arcana) — นี่ไม่ใช่เรื่องเล็กน้อย พลังงานระดับชะตากรรมและบทเรียนใหญ่ของชีวิตกำลังทำงานอยู่ ให้ความสนใจเป็นพิเศษ';
  } else {
    majorText=`มีไพ่ชุดใหญ่ ${major} ใบ — บทเรียนชะตากรรมผสานกับการกระทำในชีวิตประจำวัน บางส่วนเป็นเรื่องที่ควบคุมได้ บางส่วนเป็นพลังงานที่ใหญ่กว่าตัวคุณ`;
  }

  // ── 5. เลขศาสตร์ (Numerology) ────────────────────────
  let sum=cs.reduce((s,c)=>s+Number(c.number),0);
  let lifeNum=sum;
  while(lifeNum>22){ lifeNum=String(lifeNum).split('').reduce((a,d)=>a+ +d,0); }
  const lifeCard=(typeof MAJOR!=='undefined'&&MAJOR[lifeNum])?MAJOR[lifeNum]:null;
  const numText=lifeCard
    ?`ผลรวมพลังงานทุกใบ = ${sum} → แก่นแท้ <b>${lifeNum}</b> (${lifeCard.th}) — พลังงาน "${lifeCard.kw.slice(0,2).join(', ')}" เป็นด้ายเส้นหนึ่งที่ร้อยไพ่ทั้งหมดเข้าด้วยกัน`
    :`ผลรวมพลังงาน = ${sum} → แก่นแท้ <b>${lifeNum}</b>`;

  // ── 6. เรื่องราวของ Spread (Narrative arc) ────────────
  let narrativeHtml='';
  if((state.type==='question'||state.type==='question1')&&cs.length===3){
    const [root,need,ans]=cs;
    const d1=dignityBetween(root,ans);
    const alignment= d1.rel==='oppose'
      ?'แก่นของคำถามและคำตอบมีพลังงานขัดแย้งกัน — บอกว่าคุณอาจถามจากมุมที่ไม่ตรงกับทางออกจริงๆ ลองตั้งคำถามใหม่จากมุมที่ต่างออกไป'
      :d1.rel==='support'||d1.rel==='amplify'
      ?'แก่นของคำถามและคำตอบส่งเสริมกัน — ทิศทางที่ไพ่ชี้สอดคล้องกับสิ่งที่คุณรู้สึกอยู่ในใจแล้ว เชื่อมั่นในคำตอบนี้ได้'
      :'พลังงานทั้งสามใบสมดุล — ไพ่ไม่ได้บอกว่าใช่หรือไม่ใช่ตรงๆ แต่ชี้ให้เห็นว่าคำถามนี้ต้องการความเข้าใจมากกว่าการตัดสินใจ';
    const revAns=ans.reversed;
    const ansNote=revAns
      ?`ไพ่คำตอบขึ้นกลับหัว — บอกว่าคำตอบอาจยังไม่ชัดเจน หรือพลังงานที่ต้องการยังติดขัดอยู่ภายใน อาจต้องจัดการสิ่งที่ "${need.name_th}" ชี้ให้เห็นก่อน`
      :`ไพ่คำตอบตั้งตรง — พลังงานไหลออกมาชัดเจน ทิศทางที่ไพ่ชี้มีความเป็นไปได้สูงถ้าคุณลงมือตาม`;
    narrativeHtml=`<div class="methodology-section">
      <b style="color:#c080f0">🎯 คำตอบสำหรับ: "${state.question}"</b>
      <p style="opacity:.85;margin-top:.5rem">${alignment}</p>
      <p style="opacity:.85">${ansNote}</p>
      <p style="opacity:.75;font-size:.83rem;margin-top:.5rem">
        แก่น (<b>${root.name_th}</b>) → ต้องรู้ (<b>${need.name_th}</b>) → คำตอบ (<b>${ans.name_th}</b>)
      </p>
    </div>`;
  } else if(cs.length===3){
    const [past,pres,fut]=cs;
    const d1=dignityBetween(past,pres), d2=dignityBetween(pres,fut);
    const flowNote= d1.rel==='oppose'&&d2.rel==='oppose'
      ?'ทั้งสามใบต้านกัน — ช่วงนี้พลังงานซับซ้อนและขัดแย้ง ต้องการความอดทนในการคลี่คลาย'
      :d1.rel==='support'&&d2.rel==='support'
      ?'ทั้งสามใบไหลต่อเนื่อง — พลังงานเดินหน้าอย่างราบรื่น เส้นทางจากอดีตสู่อนาคตมีความสอดคล้องกัน'
      :'พลังงานมีการเปลี่ยนแปลงตลอดสัปดาห์ — สังเกตว่าจุดใดที่พลังงานเปลี่ยนทิศ แล้วปรับตัวตามนั้น';
    narrativeHtml=`<div class="methodology-section">
      <b style="color:var(--gold-l)">📖 เรื่องราวของสัปดาห์</b>
      <p><b>${past.name_th}</b>${past.reversed?' (กลับหัว)':''} → <b>${pres.name_th}</b>${pres.reversed?' (กลับหัว)':''} → <b>${fut.name_th}</b>${fut.reversed?' (กลับหัว)':''}</p>
      <p style="opacity:.85">${flowNote}</p>
    </div>`;
  } else if(cs.length===5){
    const [theme,challenge,support,advice,outcome]=cs;
    const tension=dignityBetween(challenge,support);
    const tensionNote=tension.rel==='oppose'
      ?`อุปสรรคและโอกาสขัดแย้งกันโดยธรรมชาติ — ต้องเลือกข้างให้ชัด ไม่สามารถเดินทั้งสองเส้นทางพร้อมกัน`
      :tension.rel==='support'||tension.rel==='amplify'
      ?`ดีมาก — โอกาสและสิ่งสนับสนุนเสริมแรงกัน ถ้าหันมาใช้โอกาสนี้จะช่วยลดอุปสรรคได้โดยตรง`
      :`อุปสรรคและโอกาสอยู่คนละทิศ — ต้องใช้ความชาญฉลาดในการนำทั้งสองมาทำงานร่วมกัน`;
    const outcomeDir=dignityBetween(advice,outcome);
    const outcomeNote=outcomeDir.rel==='support'||outcomeDir.rel==='amplify'
      ?`ถ้าทำตามคำแนะนำ ผลลัพธ์จะออกมาในทิศทางที่ดี — ไพ่คำแนะนำและผลลัพธ์ส่งเสริมกัน`
      :`ผลลัพธ์ไม่ได้รับประกันแม้จะทำตามคำแนะนำ — ต้องการความยืดหยุ่นและการปรับตัวเพิ่มเติม`;
    narrativeHtml=`<div class="methodology-section">
      <b style="color:var(--gold-l)">📖 ภาพรวมเรื่องราวของเดือน</b>
      <p style="opacity:.85">${tensionNote}</p>
      <p style="opacity:.85">${outcomeNote}</p>
    </div>`;
  }

  // ── Tags ─────────────────────────────────────────────
  const tags=Object.entries(elc).map(([el,n])=>{
    const col=EL_COLOR[el]||'#d4af37';
    return `<span class="etag" style="color:${col};border-color:${col}55;background:${col}1a">${EL_NAME_SHORT[el]||el} ×${n}</span>`;
  }).join('');

  return `
    <h3>🔮 บทสรุปคำทำนาย</h3>
    <p><b style="color:var(--gold-l)">ธาตุเด่นในการอ่านครั้งนี้:</b> ${domElText}</p>
    ${suitWarning}
    <div class="energy-tags">${tags}</div>
    ${narrativeHtml}
    <p style="font-size:.78rem;color:var(--dim);margin:.9rem 0 .3rem;letter-spacing:.5px">🔍 เจาะลึกด้วยศาสตร์ไพ่ทาโรต์ — แตะหัวข้อเพื่ออ่าน</p>
    ${dignityHtml}
    <details class="adv">
      <summary>↺ ไพ่กลับหัวบอกอะไร? <span class="adv-hint">แตะเพื่อดู</span></summary>
      <div class="adv-body"><p>${revText}</p></div>
    </details>
    <details class="adv">
      <summary>★ เรื่องนี้ใหญ่แค่ไหน? (Major vs Minor) <span class="adv-hint">แตะเพื่อดู</span></summary>
      <div class="adv-body"><p>${majorText}</p></div>
    </details>
    <details class="adv">
      <summary>🔢 เลขศาสตร์ของการอ่านครั้งนี้ <span class="adv-hint">แตะเพื่อดู</span></summary>
      <div class="adv-body"><p>${numText}</p></div>
    </details>`;
}

/* ---------- Helpers ---------- */
function thaiDate(){
  const d=new Date();
  const days=["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];
  const months=["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  return `วัน${days[d.getDay()]}ที่ ${d.getDate()} ${months[d.getMonth()]} พ.ศ. ${d.getFullYear()+543}`;
}

function goHome(){ show('screen-home'); }

/* ---------- Yes/No verdict (for ถามไพ่) ---------- */
const YESNO_SCORE={
  M0:1, M1:2, M2:0, M3:2, M4:1, M5:1, M6:2, M7:2,
  M8:2, M9:0, M10:1, M11:0, M12:-1, M13:-1, M14:0,
  M15:-2, M16:-2, M17:2, M18:-1, M19:2, M20:1, M21:2,
};

function yesNoVerdict(cards){
  let total=0, maxW=0;
  cards.forEach(c=>{
    const base=YESNO_SCORE[c.id]!==undefined ? YESNO_SCORE[c.id] : (c.type==='major'?1:0.5);
    const w=c.type==='major'?1.5:1;
    total+=base*(c.reversed?-1:1)*w;
    maxW+=Math.abs(base)*w;
  });
  const r=maxW>0?total/maxW:0;
  if(r>0.55)  return {verdict:'ใช่',    sub:'ไพ่บอกชัดว่า ใช่',           color:'#52a84e', bg:'rgba(82,168,78,.12)',  border:'rgba(82,168,78,.35)',  icon:'✅', ratio:r};
  if(r>0.18)  return {verdict:'น่าจะใช่', sub:'ไพ่โน้มเอียงไปทาง ใช่',      color:'#7ed87a', bg:'rgba(126,216,122,.1)', border:'rgba(126,216,122,.3)', icon:'🟢', ratio:r};
  if(r>=-0.18)return {verdict:'ยังไม่แน่', sub:'ไพ่บอกว่าจังหวะยังไม่ชัดเจน', color:'#d4af37', bg:'rgba(212,175,55,.1)',  border:'rgba(212,175,55,.35)', icon:'🟡', ratio:r};
  if(r>=-0.55)return {verdict:'น่าจะไม่', sub:'ไพ่โน้มเอียงไปทาง ยังไม่ใช่',  color:'#f08a6a', bg:'rgba(240,138,106,.1)', border:'rgba(240,138,106,.3)', icon:'🟠', ratio:r};
  return       {verdict:'ไม่ใช่',   sub:'ไพ่บอกชัดว่า ยังไม่ใช่',         color:'#c8341f', bg:'rgba(200,52,31,.1)',  border:'rgba(200,52,31,.3)',  icon:'❌', ratio:r};
}

function buildYesNoHTML(v, cards){
  const steps=5;
  const filled=Math.round(((v.ratio+1)/2)*steps);
  const dots=Array.from({length:steps},(_,i)=>
    `<div class="yesno-dot" style="${i<filled?'background:'+v.color+';border-color:'+v.color:''}"></div>`
  ).join('');
  const cardTags=cards.map(c=>
    `<span class="yesno-card-tag">${c.name_th}${c.reversed?' ↺':''}</span>`
  ).join('');
  return `<div class="yesno-box" style="background:${v.bg};border-color:${v.border}">
    <div style="font-size:1.8rem;margin-bottom:.2rem">${v.icon}</div>
    <div class="yesno-verdict" style="color:${v.color}">${v.verdict}</div>
    <p class="yesno-desc">${v.sub}</p>
    <div class="yesno-meter">${dots}</div>
    <div class="yesno-card-row">${cardTags}</div>
    <p style="font-size:.74rem;color:var(--dim);margin-top:.6rem;line-height:1.6">
      คำตอบนี้อ้างอิงจากพลังงานไพ่ทุกใบรวมกัน — อ่านความหมายแต่ละใบด้านล่างเพื่อความเข้าใจที่ลึกขึ้น
    </p>
  </div>`;
}

/* ---------- Quick Read — สรุปเข้าใจใน 30 วินาที ---------- */
const EL_LUCKY={
  fire:  {color:'แดง / ส้ม / ทอง',      swatch:'#f06a2a', day:'อังคาร'},
  water: {color:'ฟ้า / น้ำเงิน / เงิน',  swatch:'#39a0d8', day:'จันทร์'},
  air:   {color:'เหลือง / ครีม / ขาว',   swatch:'#c0a050', day:'พุธ'},
  earth: {color:'เขียว / น้ำตาล / ทอง',  swatch:'#52a84e', day:'พฤหัสบดี'},
  spirit:{color:'ม่วง / ทอง / ขาว',      swatch:'#9c3ce0', day:'เสาร์'},
};

function buildQuickRead(cards){
  // Overall energy from same scoring as yes/no
  const v=yesNoVerdict(cards);
  const energy= v.ratio>0.35 ? {text:'ดีมาก 🌟', color:'#7ed87a', border:'rgba(126,216,122,.4)', bg:'rgba(126,216,122,.12)'}
    : v.ratio>0 ?            {text:'ค่อนข้างดี ✨', color:'#c8e6a0', border:'rgba(200,230,160,.35)', bg:'rgba(200,230,160,.08)'}
    : v.ratio>-0.35 ?        {text:'ทรงตัว ⚖️', color:'#d4af37', border:'rgba(212,175,55,.4)', bg:'rgba(212,175,55,.1)'}
    :                        {text:'ต้องระวัง 🌧', color:'#f08a6a', border:'rgba(240,138,106,.35)', bg:'rgba(240,138,106,.1)'};

  // Dominant element
  const elc={};
  cards.forEach(c=>elc[c.el]=(elc[c.el]||0)+1);
  const domEl=Object.entries(elc).sort((a,b)=>b[1]-a[1])[0][0];
  const lucky=EL_LUCKY[domEl]||EL_LUCKY.spirit;
  const elInfo=EL_INFO[domEl]||{icon:'✨',name:domEl};

  // Lucky number via numerology (same reduction as buildSummary)
  let sum=cards.reduce((s,c)=>s+Number(c.number),0);
  let lifeNum=sum;
  while(lifeNum>22){ lifeNum=String(lifeNum).split('').reduce((a,d)=>a+ +d,0); }

  // One-sentence takeaway: strongest card (major first, upright first)
  const key=[...cards].sort((a,b)=>
    (b.type==='major')-(a.type==='major') || (a.reversed)-(b.reversed))[0];
  const siteKW=SITE_HEADLINE[key.id];
  const headline=siteKW?(key.reversed?siteKW.rev:siteKW.up):firstSent(key.reversed?key.rev:key.up);
  const takeaway=`ไพ่เด่นของคุณคือ <b style="color:var(--gold-l)">${key.name_th}</b>${key.reversed?' (กลับหัว)':''} — ${headline}`;

  const revCount=cards.filter(c=>c.reversed).length;

  return `<div class="quick-read">
    <div class="qr-head">
      <span class="qr-title">⚡ อ่านเร็วใน 30 วินาที</span>
      <span class="qr-energy" style="color:${energy.color};border-color:${energy.border};background:${energy.bg}">พลังงานรวม: ${energy.text}</span>
    </div>
    <p class="qr-takeaway">${takeaway}</p>
    <div class="qr-chips">
      <span class="qr-chip">${elInfo.icon} ธาตุเด่น <b>${elInfo.name.replace('ธาตุ','')}</b></span>
      <span class="qr-chip"><span class="qr-swatch" style="background:${lucky.swatch}"></span> สีนำโชค <b>${lucky.color}</b></span>
      <span class="qr-chip">🔢 เลขนำโชค <b>${lifeNum}</b></span>
      <span class="qr-chip">📅 วันดี <b>วัน${lucky.day}</b></span>
      ${revCount?`<span class="qr-chip">↺ กลับหัว <b>${revCount} ใบ</b></span>`:''}
    </div>
  </div>`;
}

/* ---------- Domain summary (สรุปรายด้าน) ---------- */
function buildDomainSummary(cards){
  const DOMAINS=[
    {key:'love',   icon:'💞', label:'ความรัก'},
    {key:'work',   icon:'💼', label:'การงาน & การเงิน'},
    {key:'health', icon:'🌿', label:'สุขภาพ'},
  ];
  const TONE_POS={text:'พลังงานดี',   color:'#7ed87a', bg:'rgba(126,216,122,.12)', border:'rgba(126,216,122,.3)'};
  const TONE_MIX={text:'ผสมผสาน',   color:'#d4af37', bg:'rgba(212,175,55,.1)',  border:'rgba(212,175,55,.3)'};
  const TONE_NEG={text:'ต้องใส่ใจ',  color:'#f08a6a', bg:'rgba(240,138,106,.1)', border:'rgba(240,138,106,.25)'};

  const cards_html=DOMAINS.map(({key, icon, label})=>{
    const entries=cards.map(c=>{
      const rv=c.reversed;
      const raw=rv?(c[key]&&c[key][1]):(c[key]&&c[key][0]);
      return raw?{name:c.name_th, text:firstSent(raw), rv}:null;
    }).filter(Boolean);
    if(!entries.length) return '';

    const posCount=entries.filter(e=>!e.rv).length;
    const ratio=posCount/entries.length;
    const tone=ratio>=0.67?TONE_POS:ratio>=0.34?TONE_MIX:TONE_NEG;

    // Build a flowing synthesis paragraph
    const parts=entries.map((e,i)=>{
      const prefix=i===0?'':(i===entries.length-1?' และ':' ');
      return `${prefix}${e.text.replace(/^(ด้าน[^ ]+ — |ด้าน[^ ]+|การงาน[^ ]* — |สุขภาพ — )/,'')}`;
    });
    const body=parts.join('');

    const ctags=entries.map(e=>
      `<span class="domain-sum-ctag">${e.name}${e.rv?' ↺':''}</span>`
    ).join('');

    return `<div class="domain-sum-card">
      <div class="domain-sum-head">
        <span class="domain-sum-label">${icon} ${label}</span>
        <span class="domain-tone" style="color:${tone.color};border-color:${tone.border};background:${tone.bg}">${tone.text}</span>
      </div>
      <p class="domain-sum-body">${body}</p>
      <div class="domain-sum-cards">${ctags}</div>
    </div>`;
  }).join('');

  if(!cards_html.trim()) return '';
  return `<h3>◎ สรุปรายด้าน — จากทุกใบที่เปิด</h3><div class="domain-sum-grid">${cards_html}</div>`;
}

/* ---------- Share Reading ---------- */
function loadImg(src){
  return new Promise(resolve=>{
    const img=new Image(); img.crossOrigin='anonymous';
    img.onload=()=>resolve(img);
    img.onerror=()=>resolve(null);
    img.src=src;
  });
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

function _firstSentence(text, max=200){
  if(!text) return '';
  // Thai rarely uses . between sentences — take full text up to max
  return text.length>max?text.slice(0,max)+'…':text;
}

function _wrapCanvasText(ctx, text, x, y, maxW, lineH, maxLines=2){
  const chars=[...text];
  let line='', linesDrawn=0;
  for(let k=0;k<chars.length;k++){
    const test=line+chars[k];
    if(ctx.measureText(test).width>maxW&&line){
      ctx.fillText(line,x,y); y+=lineH; line=chars[k]; linesDrawn++;
      if(linesDrawn>=maxLines-1){
        const rest=chars.slice(k+1).join('');
        let tail=rest;
        while(ctx.measureText(line+tail+'…').width>maxW&&tail.length) tail=tail.slice(0,-1);
        line=line+tail+(rest.length?'…':'');
        break;
      }
    } else { line=test; }
  }
  if(line){ ctx.fillText(line,x,y); y+=lineH; }
  return y;
}

async function buildShareCanvas(cards){
  if(!cards||!cards.length) return null;
  const CARD_W=100, CARD_H=172, PAD=24, GAP=12;
  const cols=Math.min(cards.length,3);
  const rows=Math.ceil(cards.length/cols);
  const W=Math.max(500, cols*(CARD_W+GAP)+PAD*2-GAP+2);
  const HEADER=130, LABEL=48, FOOTER=52;
  const SUMM_PER=100, SUMM_H=28+cards.length*SUMM_PER;
  const H=HEADER + rows*(CARD_H+LABEL+GAP) + PAD + SUMM_H + FOOTER;

  const cv=document.getElementById('share-canvas');
  const dpr=window.devicePixelRatio||1;
  cv.width=W*dpr; cv.height=H*dpr;
  cv.style.width=W+'px'; cv.style.height=H+'px';
  const ctx=cv.getContext('2d');
  ctx.scale(dpr,dpr);

  // Background
  const bg=ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0d0822'); bg.addColorStop(1,'#05050f');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // Stars
  ctx.fillStyle='rgba(244,224,140,0.45)';
  for(let i=0;i<70;i++){
    const sx=Math.random()*W,sy=Math.random()*H,sr=Math.random()*1.2+.2;
    ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2); ctx.fill();
  }

  // Header
  ctx.textAlign='center';
  ctx.font='bold 22px serif'; ctx.fillStyle='#f3d878';
  ctx.fillText('Meaning Tarot', W/2, 42);
  ctx.font='13px sans-serif'; ctx.fillStyle='#c3b48f';
  ctx.fillText(state.question?`◎  ${state.question}`:'◎  ผลการทำนาย', W/2, 68);
  ctx.fillText(thaiDate(), W/2, 90);
  ctx.strokeStyle='rgba(212,175,55,0.45)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(PAD,108); ctx.lineTo(W-PAD,108); ctx.stroke();

  // Load images
  const imgs=await Promise.all(cards.map(c=>{
    const fb=window.CARD_FALLBACK&&window.CARD_FALLBACK[c.id];
    return loadImg(`cards/${c.id}.jpg`).then(i=>i||loadImg(fb||''));
  }));

  // Draw card grid
  for(let i=0;i<cards.length;i++){
    const col=i%cols, row=Math.floor(i/cols);
    const cx=(cols===1)?((W-CARD_W)/2):PAD+(col*(CARD_W+GAP));
    const y=HEADER+row*(CARD_H+LABEL+GAP);

    ctx.shadowColor='rgba(0,0,0,0.6)'; ctx.shadowBlur=14; ctx.shadowOffsetY=4;
    roundRect(ctx,cx,y,CARD_W,CARD_H,6); ctx.fillStyle='#1a0f05'; ctx.fill();
    ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.shadowOffsetY=0;

    if(imgs[i]){
      ctx.save(); roundRect(ctx,cx,y,CARD_W,CARD_H,6); ctx.clip();
      if(cards[i].reversed){
        ctx.translate(cx+CARD_W/2,y+CARD_H/2); ctx.rotate(Math.PI);
        ctx.drawImage(imgs[i],-CARD_W/2,-CARD_H/2,CARD_W,CARD_H);
      } else { ctx.drawImage(imgs[i],cx,y,CARD_W,CARD_H); }
      ctx.restore();
    }
    ctx.strokeStyle='rgba(212,175,55,0.6)'; ctx.lineWidth=1.5;
    roundRect(ctx,cx,y,CARD_W,CARD_H,6); ctx.stroke();

    if(cards[i].reversed){
      ctx.fillStyle='rgba(180,40,20,0.85)';
      roundRect(ctx,cx+4,y+4,46,16,4); ctx.fill();
      ctx.font='bold 9px sans-serif'; ctx.fillStyle='#fff'; ctx.textAlign='left';
      ctx.fillText('กลับหัว',cx+8,y+15);
    }

    const posLabel=state.positions&&state.positions[i];
    ctx.textAlign='center';
    ctx.font='10px sans-serif'; ctx.fillStyle='#c3b48f';
    if(posLabel){ ctx.fillText(posLabel,cx+CARD_W/2,y+CARD_H+13); }
    ctx.font='bold 11px sans-serif'; ctx.fillStyle='#f3d878';
    ctx.fillText(cards[i].name_th,cx+CARD_W/2,y+CARD_H+(posLabel?27:16));
    const kws=(cards[i].kw||[]).slice(0,3).join(' · ');
    ctx.font='9px sans-serif'; ctx.fillStyle='rgba(195,175,120,0.7)';
    ctx.fillText(kws,cx+CARD_W/2,y+CARD_H+(posLabel?40:30));
  }

  // Summary section
  const summY=HEADER+rows*(CARD_H+LABEL+GAP)+PAD;
  ctx.strokeStyle='rgba(212,175,55,0.3)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(PAD,summY); ctx.lineTo(W-PAD,summY); ctx.stroke();
  ctx.font='bold 11px sans-serif'; ctx.fillStyle='rgba(212,175,55,0.6)'; ctx.textAlign='center';
  ctx.fillText('✦  สรุปผลทำนาย  ✦', W/2, summY+18);

  let sy=summY+36;
  for(let i=0;i<cards.length;i++){
    const c=cards[i];
    const posLabel=state.positions&&state.positions[i];
    const tag=posLabel?`[${posLabel}] `:' ';
    ctx.font='bold 11px sans-serif'; ctx.fillStyle='#f3d878'; ctx.textAlign='left';
    ctx.fillText(`${tag}${c.name_th}${c.reversed?' (กลับหัว)':''}`,PAD,sy);
    const kws=(c.kw||[]).slice(0,4).join(' · ');
    ctx.font='9.5px sans-serif'; ctx.fillStyle='rgba(195,175,120,0.75)';
    ctx.fillText(kws,PAD,sy+14);
    const meaning=c.reversed?c.rev:c.up;
    ctx.font='10.5px sans-serif'; ctx.fillStyle='rgba(240,232,216,0.82)';
    sy=_wrapCanvasText(ctx,_firstSentence(meaning),PAD,sy+27,W-PAD*2,15,4);
    sy+=10;
  }

  // Footer
  ctx.strokeStyle='rgba(212,175,55,0.25)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(PAD,H-FOOTER+10); ctx.lineTo(W-PAD,H-FOOTER+10); ctx.stroke();
  ctx.font='10px sans-serif'; ctx.fillStyle='rgba(163,145,100,0.6)'; ctx.textAlign='center';
  ctx.fillText('Meaning Tarot · ผลทำนายนี้ใช้เพื่อการพิจารณาตนเองเท่านั้น',W/2,H-FOOTER+28);

  return cv;
}

async function shareReading(){
  const btn=document.getElementById('btn-share');
  const prev=btn.textContent;
  btn.textContent='กำลังสร้างภาพ…'; btn.disabled=true;

  try{
    await buildShareCanvas(state.cards);
    document.getElementById('share-modal').style.display='flex';
  } catch(e){
    console.error(e);
    alert('ไม่สามารถสร้างภาพได้ กรุณาลองใหม่');
  }
  btn.textContent=prev; btn.disabled=false;
}

async function doShareAction(){
  const cv=document.getElementById('share-canvas');
  const filename=`tarot-${Date.now()}.png`;
  cv.toBlob(async blob=>{
    if(navigator.canShare&&navigator.canShare({files:[new File([blob],'tarot.png',{type:'image/png'})]})){
      try{
        await navigator.share({files:[new File([blob],'tarot.png',{type:'image/png'})],title:'ผลทำนายไพ่ทาโรต์'});
        return;
      }catch(e){ /* fall through to download */ }
    }
    // Desktop fallback: download
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  },'image/png');
}

function closeShareModal(){
  document.getElementById('share-modal').style.display='none';
}

/* ---------- Question modal ---------- */
let _qCount=3; // default 3 cards

function openQuestionModal(){
  document.getElementById('question-modal').style.display='flex';
  selectQCount(3); // default
}
function closeQuestionModal(){
  document.getElementById('question-modal').style.display='none';
}
function selectQCount(n){
  _qCount=n;
  document.getElementById('q-opt-1').classList.toggle('q-opt-selected', n===1);
  document.getElementById('q-opt-3').classList.toggle('q-opt-selected', n===3);
}
function submitQuestion(){
  state.question=''; // no text — user meditates silently
  closeQuestionModal();
  // Dynamically set spread based on chosen count
  if(_qCount===1){
    state.type='question1';
    state.spread={
      title:"ถามไพ่", icon:"🎯", count:1, layout:"layout-1",
      focus:"หลับตา ตั้งจิตกับคำถามในใจ แล้วพลิกไพ่",
      positions:[{name:"คำตอบ",hint:"ไพ่บอกตรงๆ สำหรับคำถามของคุณ"}]
    };
  } else {
    state.type='question';
    state.spread=SPREADS['question'];
  }
  const picked=shuffle(DECK).slice(0,state.spread.count)
    .map(c=>({...c, reversed:Math.random()<0.42}));
  state.cards=picked;
  state.flipped=0;
  renderDraw();
  show('screen-draw');
}

/* ===================================================================
   FEATURE 1 — BIRTH CARD (ไพ่ประจำตัว)
   =================================================================== */

function updateBCYearLabel(){
  // label is inline — no extra DOM needed
}

function calcBirthCard(){
  const dd=parseInt(document.getElementById('bc-day').value)||0;
  const mm=parseInt(document.getElementById('bc-month').value)||0;
  let yyyy=parseInt(document.getElementById('bc-year').value)||0;
  const isBCE=document.getElementById('bc-bce').checked;
  if(isBCE) yyyy-=543;

  if(!dd||!mm||!yyyy||dd<1||dd>31||mm<1||mm>12||yyyy<1){
    alert('กรุณากรอกวันเกิดให้ครบถ้วนและถูกต้อง'); return;
  }

  // Build digit string: pad DD→2, MM→2, YYYY→4
  const dateStr=String(dd).padStart(2,'0')+String(mm).padStart(2,'0')+String(Math.abs(yyyy)).padStart(4,'0');
  // Sum all digits (first reduction)
  const firstSum=dateStr.split('').reduce((s,d)=>s+ +d, 0);

  let primaryNum, secondaryNum=null;

  if(firstSum>=1&&firstSum<=22){
    // Already in range 1-22 on first sum → single card
    primaryNum=firstSum;
  } else {
    // firstSum > 22 → reduce once
    const once=String(firstSum).split('').reduce((s,d)=>s+ +d, 0);
    if(once>=10&&once<=22){
      // Dual card: reduced value is 10-22
      primaryNum=once;
      secondaryNum=String(once).split('').reduce((s,d)=>s+ +d, 0);
    } else if(once>=1&&once<=9){
      primaryNum=once;
    } else {
      // once still > 22, keep reducing
      let n=once;
      while(n>22){ n=String(n).split('').reduce((s,d)=>s+ +d, 0); }
      primaryNum=n;
    }
  }

  // Map num → card ID: 0 or 22 = M0 (The Fool), else M{n}
  function numToCardId(n){ return (n===0||n===22)?'M0':'M'+n; }

  const card1=DECK.find(c=>c.id===numToCardId(primaryNum));
  const card2=secondaryNum!==null?DECK.find(c=>c.id===numToCardId(secondaryNum)):null;

  renderBirthCard(dateStr, firstSum, primaryNum, secondaryNum, card1, card2);
}

function bcCardHTML(card, label){
  if(!card) return '';
  const fallbackUrl=CARD_FALLBACK[card.id]||'';
  const onErr=fallbackUrl
    ?`if(this.src.indexOf('cards/')>=0){this.src='${fallbackUrl}'}else{this.style.display='none'};this.onerror=null`
    :`this.style.display='none';this.onerror=null`;
  const siteKW=SITE_HEADLINE[card.id];
  const meaning=siteKW?siteKW.up:(card.up||'');
  const el=EL_INFO[card.el]||{icon:'',name:card.el,color:'var(--gold)'};
  const kwsHtml=card.kw.map(k=>`<span class="kw">${k}</span>`).join('');

  return `<div class="bc-card-wrap">
    <div class="bc-card-label">${label}</div>
    <div class="bc-card-img">
      <img src="cards/${card.id}.jpg" alt="${card.name_th}" onerror="${onErr}">
    </div>
    <div class="bc-card-detail">
      <h3>${card.name_th}</h3>
      <div class="bc-en">${card.name_en}</div>
      <span class="bc-el-tag">${el.icon} ${el.name}</span>
      <div class="bc-kws">${kwsHtml}</div>
      <div class="bc-meaning">${meaning}</div>
    </div>
  </div>`;
}

let _bcCards=[];

function renderBirthCard(dateStr, firstSum, primaryNum, secondaryNum, card1, card2){
  const isDual=secondaryNum!==null;
  const calcSteps=isDual
    ?`ผลรวมตัวเลข (${dateStr}) = <b>${firstSum}</b> → ลดเป็น <b>${primaryNum}</b> (คู่กับ <b>${secondaryNum}</b>)`
    :`ผลรวมตัวเลข (${dateStr}) = <b>${firstSum}</b>${firstSum!==primaryNum?' → ลดเป็น <b>'+primaryNum+'</b>':''}`;

  const dualNote=isDual
    ?`<div class="bc-dual-note">✦ ไพ่คู่ประจำตัว — เลข <b>${primaryNum}</b> และ <b>${secondaryNum}</b> ทำงานร่วมกัน สะท้อนสองมิติของตัวตนคุณ</div>`
    :'';

  const cardsHtml=isDual
    ?`<div class="bc-cards-row">
        ${bcCardHTML(card1,'ไพ่หลัก · เลข '+primaryNum)}
        ${bcCardHTML(card2,'ไพ่รอง · เลข '+secondaryNum)}
      </div>`
    :`<div class="bc-cards-row">${bcCardHTML(card1,'ไพ่ประจำตัว · เลข '+primaryNum)}</div>`;

  // Store birth cards for wallpaper generation
  _bcCards=[card1, card2].filter(Boolean);

  document.getElementById('bc-result').innerHTML=`
    <div class="bc-num-badge">${isDual?primaryNum+' · '+secondaryNum:primaryNum}</div>
    <p style="text-align:center;color:var(--text2);font-size:.85rem;margin-bottom:.6rem">${calcSteps}</p>
    ${dualNote}
    ${cardsHtml}
    <div style="display:flex;justify-content:center;margin-top:1.4rem">
      <button class="btn-wp" onclick="generateWallpaperFromBirthCard()">✨ วอลเปเปอร์ประจำตัว</button>
    </div>`;
  document.getElementById('bc-result').style.display='block';
  document.getElementById('bc-result').scrollIntoView({behavior:'smooth',block:'start'});
}

async function generateWallpaperFromBirthCard(){
  if(!_bcCards.length){ alert('กรุณาคำนวณไพ่ประจำตัวก่อน'); return; }

  // Build card data in same format as reading wallpaper
  const cardData=_bcCards.map(c=>{
    const siteKW=SITE_HEADLINE[c.id];
    const positiveMeaning=siteKW?siteKW.up:(c.up||'');
    return {
      id: c.id,
      name: c.name_en,
      nameTh: c.name_th,
      keywords: (c.kw||[]).slice(0,4),
      positiveMeaning: positiveMeaning.slice(0,80),
      element: c.el,
      reversed: false, // birth cards are always upright
    };
  });

  // Dominant element from birth card(s)
  const domEl=_bcCards[0].el;

  // Show modal
  const modal=document.getElementById('wp-modal');
  const loading=document.getElementById('wp-loading');
  const result=document.getElementById('wp-result');
  modal.style.display='flex';
  loading.style.display='flex';
  result.style.display='none';
  _startWpSteps();

  try{
    const resp=await fetch('/api/wallpaper',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({cards:cardData, element:domEl, context:'birthcard'})
    });
    const data=await resp.json();
    if(!resp.ok) throw new Error(data.error||'ไม่สามารถสร้างภาพได้');

    _stopWpSteps();
    loading.style.display='none';
    result.style.display='block';

    const img=document.getElementById('wp-img');
    const mime=data.mimeType||'image/png';
    img.src=`data:${mime};base64,${data.image}`;
    img.dataset.b64=data.image;
    img.dataset.mime=mime;
    const promptEl=document.getElementById('wp-prompt');
    if(promptEl) promptEl.textContent=data.prompt||'';
  }catch(e){
    _stopWpSteps();
    modal.style.display='none';
    alert('ไม่สามารถสร้างวอลเปเปอร์ได้\n'+(e.message||'กรุณาลองใหม่'));
  }
}

/* ===================================================================
   FEATURE 2 — CARD LIBRARY (คลังไพ่ 78 ใบ)
   =================================================================== */

let _libFilter='all';
const _libFilters=[
  {key:'all',   label:'ทั้งหมด'},
  {key:'major', label:'★ Major'},
  {key:'fire',  label:'△ ไม้เท้า'},
  {key:'water', label:'▽ ถ้วย'},
  {key:'air',   label:'◇ ดาบ'},
  {key:'earth', label:'⊕ เหรียญ'},
];

function openLibrary(){
  // Build filter buttons once
  const fb=document.getElementById('lib-filters');
  if(!fb.children.length){
    _libFilters.forEach(f=>{
      const btn=document.createElement('button');
      btn.className='lib-filter-btn'+(f.key==='all'?' active':'');
      btn.textContent=f.label;
      btn.dataset.key=f.key;
      btn.onclick=()=>{
        _libFilter=f.key;
        fb.querySelectorAll('.lib-filter-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        renderLibGrid();
      };
      fb.appendChild(btn);
    });
  }
  document.getElementById('lib-search').value='';
  _libFilter='all';
  fb.querySelectorAll('.lib-filter-btn').forEach(b=>b.classList.toggle('active',b.dataset.key==='all'));
  renderLibGrid();
  show('screen-library');
}

function getLibCards(){
  const q=(document.getElementById('lib-search').value||'').trim().toLowerCase();
  return DECK.filter(c=>{
    if(_libFilter==='major'&&c.type!=='major') return false;
    if(_libFilter==='fire'&&c.el!=='fire') return false;
    if(_libFilter==='water'&&c.el!=='water') return false;
    if(_libFilter==='air'&&c.el!=='air') return false;
    if(_libFilter==='earth'&&c.el!=='earth') return false;
    if(q){
      const hay=(c.name_th+' '+c.name_en).toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderLibGrid(){
  const cards=getLibCards();
  document.getElementById('lib-count').textContent=cards.length+' ใบ';
  const grid=document.getElementById('lib-grid');
  grid.innerHTML=cards.map(c=>{
    const fallbackUrl=CARD_FALLBACK[c.id]||'';
    const onErr=fallbackUrl
      ?`if(this.src.indexOf('cards/')>=0){this.src='${fallbackUrl}'}else{this.style.display='none'};this.onerror=null`
      :`this.style.display='none';this.onerror=null`;
    return `<div class="lib-card-thumb" onclick="openLibCard('${c.id}')">
      <img src="cards/${c.id}.jpg" alt="${c.name_th}" loading="lazy" onerror="${onErr}">
      <div class="lib-thumb-name">${c.name_th}</div>
    </div>`;
  }).join('');
}

function openLibCard(id){
  const c=DECK.find(x=>x.id===id);
  if(!c) return;
  const fallbackUrl=CARD_FALLBACK[c.id]||'';
  const onErr=fallbackUrl
    ?`if(this.src.indexOf('cards/')>=0){this.src='${fallbackUrl}'}else{this.style.display='none'};this.onerror=null`
    :`this.style.display='none';this.onerror=null`;
  const el=EL_INFO[c.el]||{icon:'',name:c.el,color:'var(--gold)'};
  const siteKW=SITE_HEADLINE[c.id];
  const upMeaning=siteKW?siteKW.up:(c.up||'');
  const revMeaning=siteKW?siteKW.rev:(c.rev||'');
  const kwsHtml=c.kw.map(k=>`<span>${k}</span>`).join('');

  function tabText(domain, rv){
    const raw=rv?(c[domain]&&c[domain][1]):(c[domain]&&c[domain][0]);
    if(domain==='spirit') return c.spirit||'';
    return raw||'';
  }

  document.getElementById('lib-modal-inner').innerHTML=`
    <button class="lib-modal-close" onclick="closeLibModal()">✕</button>
    <div class="lib-modal-top">
      <div class="lib-modal-img">
        <img src="cards/${c.id}.jpg" alt="${c.name_th}" onerror="${onErr}">
      </div>
      <div class="lib-modal-info">
        <h2>${c.name_th}</h2>
        <div class="lm-en">${c.name_en}</div>
        <div class="lm-el">${el.icon} ${el.name}${c.type==='major'?' · ★ Major Arcana':' · ชุดเล็ก'}</div>
        <div class="lm-kws">${kwsHtml}</div>
        <span class="lm-up-label">⤴ ตั้งตรง</span>
        <div class="lm-meaning">${upMeaning}</div>
        <span class="lm-rev-label">⤵ กลับหัว</span>
        <div class="lm-rev-meaning">${revMeaning}</div>
      </div>
    </div>
    <div class="lib-modal-tabs">
      <button class="lib-modal-tab-btn active" onclick="switchLibTab(this,'love')">💞 ความรัก</button>
      <button class="lib-modal-tab-btn" onclick="switchLibTab(this,'work')">💼 การงาน</button>
      <button class="lib-modal-tab-btn" onclick="switchLibTab(this,'health')">🌿 สุขภาพ</button>
      <button class="lib-modal-tab-btn" onclick="switchLibTab(this,'spirit')">✨ จิตวิญญาณ</button>
    </div>
    <div class="lib-modal-tab-pane active" data-tab="love">
      <b style="color:var(--gold-l);font-size:.8rem">ตั้งตรง:</b> ${tabText('love',false)||'—'}<br><br>
      <b style="color:#f08a6a;font-size:.8rem">กลับหัว:</b> ${tabText('love',true)||'—'}
    </div>
    <div class="lib-modal-tab-pane" data-tab="work">
      <b style="color:var(--gold-l);font-size:.8rem">ตั้งตรง:</b> ${tabText('work',false)||'—'}<br><br>
      <b style="color:#f08a6a;font-size:.8rem">กลับหัว:</b> ${tabText('work',true)||'—'}
    </div>
    <div class="lib-modal-tab-pane" data-tab="health">
      <b style="color:var(--gold-l);font-size:.8rem">ตั้งตรง:</b> ${tabText('health',false)||'—'}<br><br>
      <b style="color:#f08a6a;font-size:.8rem">กลับหัว:</b> ${tabText('health',true)||'—'}
    </div>
    <div class="lib-modal-tab-pane" data-tab="spirit">${tabText('spirit',false)||'—'}</div>`;

  document.getElementById('lib-modal').style.display='flex';
}

function closeLibModal(){
  document.getElementById('lib-modal').style.display='none';
}

function switchLibTab(btn, tabName){
  const modal=btn.closest('.lib-modal');
  modal.querySelectorAll('.lib-modal-tab-btn').forEach(b=>b.classList.remove('active'));
  modal.querySelectorAll('.lib-modal-tab-pane').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  modal.querySelector(`.lib-modal-tab-pane[data-tab="${tabName}"]`).classList.add('active');
}

/* ===================================================================
   FEATURE 3 — WALLPAPER GENERATOR (วอลเปเปอร์นำโชค)
   Claude (Co) generates the mystical prompt · Gemini Imagen renders it
   =================================================================== */

const _wpSteps=[
  'กำลังอ่านสัญลักษณ์ในไพ่แต่ละใบ…',
  'กำลังถ่ายทอดความหมายสู่ภาพ…',
  'AI กำลังวาดพลังจักรวาล…',
  'รอสักครู่ กำลังส่งพลังงานนำโชค…',
];
let _wpStepTimer=null;

function _startWpSteps(){
  let i=0;
  const el=document.getElementById('wp-loading-step');
  if(el) el.textContent=_wpSteps[0];
  _wpStepTimer=setInterval(()=>{
    i=(i+1)%_wpSteps.length;
    if(el) el.textContent=_wpSteps[i];
  },3500);
}

function _stopWpSteps(){
  if(_wpStepTimer){ clearInterval(_wpStepTimer); _wpStepTimer=null; }
}

async function generateWallpaper(){
  const cards=state.cards;
  if(!cards||!cards.length){ alert('กรุณาทำนายก่อนสร้างวอลเปเปอร์'); return; }

  // Dominant element
  const elCount={};
  cards.forEach(c=>elCount[c.el]=(elCount[c.el]||0)+1);
  const domEl=Object.entries(elCount).sort((a,b)=>b[1]-a[1])[0][0];

  // Rich card data for better image prompts
  const cardData=cards.map(c=>{
    const siteKW=SITE_HEADLINE[c.id];
    const positiveMeaning=siteKW?siteKW.up:(c.up||'');
    return {
      id: c.id,
      name: c.name_en,
      nameTh: c.name_th,
      keywords: (c.kw||[]).slice(0,4),
      positiveMeaning: positiveMeaning.slice(0,80),
      element: c.el,
      reversed: c.reversed,
    };
  });

  // Show modal in loading state
  const modal=document.getElementById('wp-modal');
  const loading=document.getElementById('wp-loading');
  const result=document.getElementById('wp-result');
  modal.style.display='flex';
  loading.style.display='flex';
  result.style.display='none';
  _startWpSteps();

  try{
    const resp=await fetch('/api/wallpaper',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({cards:cardData, element:domEl})
    });
    const data=await resp.json();
    if(!resp.ok) throw new Error(data.error||'ไม่สามารถสร้างภาพได้');

    _stopWpSteps();
    loading.style.display='none';
    result.style.display='block';

    const img=document.getElementById('wp-img');
    const mime=data.mimeType||'image/png';
    img.src=`data:${mime};base64,${data.image}`;
    img.dataset.b64=data.image;
    img.dataset.mime=mime;

    const promptEl=document.getElementById('wp-prompt');
    if(promptEl) promptEl.textContent=data.prompt||'';

  }catch(e){
    _stopWpSteps();
    modal.style.display='none';
    alert('ไม่สามารถสร้างวอลเปเปอร์ได้\n'+(e.message||'กรุณาลองใหม่'));
  }
}

function downloadWallpaper(){
  const img=document.getElementById('wp-img');
  if(!img||!img.dataset.b64) return;
  const mime=img.dataset.mime||'image/png';
  const ext=mime.includes('jpeg')?'jpg':'png';
  const a=document.createElement('a');
  a.href=`data:${mime};base64,${img.dataset.b64}`;
  a.download=`lucky-wallpaper-${Date.now()}.${ext}`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function closeWpModal(){
  _stopWpSteps();
  document.getElementById('wp-modal').style.display='none';
}
