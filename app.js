/* My Little World, v1.0.0. No libraries, trackers, APIs, or internet requests. */
(() => {
  'use strict';
  const STORE = 'my-little-world-state-v1';
  const app = document.getElementById('app');
  const announcer = document.getElementById('announcer');
  const WORLDS = {
    farm: { en:'Animal Farm', ar:'مزرعة الحيوانات', emoji:'🐮', className:'farm', sticker:'🐄' },
    colors: { en:'Color Land', ar:'عالم الألوان', emoji:'🌈', className:'colors', sticker:'🌈' },
    kitchen: { en:'Little Kitchen', ar:'المطبخ الصغير', emoji:'👩‍🍳', className:'kitchen', sticker:'🍓' },
    garden: { en:'Magic Garden', ar:'الحديقة السحرية', emoji:'🌻', className:'garden', sticker:'🌻' }
  };
  const animals = [
    {id:'cow', emoji:'🐮', en:'Cow', ar:'بقرة'},
    {id:'sheep', emoji:'🐑', en:'Sheep', ar:'خروف'},
    {id:'cat', emoji:'🐱', en:'Cat', ar:'قطة'},
    {id:'dog', emoji:'🐶', en:'Dog', ar:'كلب'},
    {id:'duck', emoji:'🦆', en:'Duck', ar:'بطة'},
    {id:'horse', emoji:'🐴', en:'Horse', ar:'حصان'},
    {id:'chicken', emoji:'🐔', en:'Chicken', ar:'دجاجة'},
    {id:'elephant', emoji:'🐘', en:'Elephant', ar:'فيل'}
  ];
  const colors = [
    {id:'red', hex:'#ff5575', en:'Red', ar:'أحمر'},
    {id:'blue', hex:'#4c9afb', en:'Blue', ar:'أزرق'},
    {id:'yellow', hex:'#ffda50', en:'Yellow', ar:'أصفر'},
    {id:'green', hex:'#54cb7e', en:'Green', ar:'أخضر'},
    {id:'purple', hex:'#ad7ef5', en:'Purple', ar:'بنفسجي'},
    {id:'orange', hex:'#ff9f45', en:'Orange', ar:'برتقالي'}
  ];
  const shapes = [
    {id:'circle',en:'Circle',ar:'دائرة',shape:'circle'},
    {id:'square',en:'Square',ar:'مربع',shape:'square'},
    {id:'triangle',en:'Triangle',ar:'مثلث',shape:'triangle'},
    {id:'star',en:'Star',ar:'نجمة',shape:'star'},
    {id:'heart',en:'Heart',ar:'قلب',shape:'heart'},
    {id:'diamond',en:'Diamond',ar:'مُعيَّن',shape:'diamond'}
  ];
  const foods = [
    {id:'apple',emoji:'🍎',en:'Apple',ar:'تفاحة'},
    {id:'banana',emoji:'🍌',en:'Banana',ar:'موزة'},
    {id:'strawberry',emoji:'🍓',en:'Strawberry',ar:'فراولة'},
    {id:'carrot',emoji:'🥕',en:'Carrot',ar:'جزرة'},
    {id:'tomato',emoji:'🍅',en:'Tomato',ar:'طماطم'},
    {id:'broccoli',emoji:'🥦',en:'Broccoli',ar:'بروكلي'},
    {id:'bread',emoji:'🍞',en:'Bread',ar:'خبز'},
    {id:'cheese',emoji:'🧀',en:'Cheese',ar:'جبنة'},
    {id:'cucumber',emoji:'🥒',en:'Cucumber',ar:'خيار'},
    {id:'grapes',emoji:'🍇',en:'Grapes',ar:'عنب'},
    {id:'orange',emoji:'🍊',en:'Orange',ar:'برتقالة'},
    {id:'pear',emoji:'🍐',en:'Pear',ar:'كمثرى'}
  ];
  const flowers = [
    {id:'sunflower',emoji:'🌻',en:'Sunflower',ar:'عباد الشمس'},
    {id:'tulip',emoji:'🌷',en:'Tulip',ar:'زهرة التوليب'},
    {id:'hibiscus',emoji:'🌺',en:'Hibiscus',ar:'زهرة جميلة'}
  ];
  const initial = () => ({
    prefs:{voice:true,language:'both'},
    progress:{stars:0,completed:0,stickers:{farm:0,colors:0,kitchen:0,garden:0}},
    session:null
  });
  const safeRead = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (!raw || typeof raw !== 'object') return initial();
      const base = initial();
      if (raw.prefs && typeof raw.prefs === 'object') {
        base.prefs.voice = raw.prefs.voice !== false;
        if (['ar','en','both'].includes(raw.prefs.language)) base.prefs.language = raw.prefs.language;
      }
      if (raw.progress && typeof raw.progress === 'object') {
        base.progress.stars = Math.max(0,Number(raw.progress.stars) || 0);
        base.progress.completed = Math.max(0,Number(raw.progress.completed) || 0);
        for (const id of Object.keys(WORLDS)) base.progress.stickers[id] = Math.max(0,Number(raw.progress.stickers?.[id]) || 0);
      }
      if (raw.session && Object.keys(WORLDS).includes(raw.session.world)) {
        const s = raw.session;
        if (typeof s.stage === 'string' && Number.isInteger(s.index || 0)) base.session = s;
      }
      return base;
    } catch (_) { return initial(); }
  };
  let state = safeRead();
  let audioContext = null;
  let speechToken = 0;
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (_) { /* storage may be disabled */ } };
  const shuffle = list => {
    const items = [...list];
    for (let i=items.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [items[i],items[j]]=[items[j],items[i]]; }
    return items;
  };
  const lookup = (list,id) => list.find(item => item.id === id);
  const fmtAr = text => `<span lang="ar" dir="rtl">${text}</span>`;
  const calmTones = (happy=true) => {
    if (!state.prefs.voice) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext ||= new AudioCtx();
      if (audioContext.state === 'suspended') audioContext.resume().catch(()=>{});
      const now = audioContext.currentTime;
      (happy ? [523.25,659.25,783.99] : [392,440]).forEach((f,i) => {
        const o=audioContext.createOscillator(), g=audioContext.createGain();
        o.type='sine';o.frequency.value=f;
        const begin=now+i*.1;
        g.gain.setValueAtTime(.0001,begin);
        g.gain.exponentialRampToValueAtTime(.07,begin+.025);
        g.gain.exponentialRampToValueAtTime(.0001,begin+.18);
        o.connect(g);g.connect(audioContext.destination);o.start(begin);o.stop(begin+.19);
      });
    } catch (_) { /* audio is optional */ }
  };
  function speak(ar, en) {
    const synth=window.speechSynthesis;
    ++speechToken;
    if (!state.prefs.voice || !synth || !window.SpeechSynthesisUtterance) return;
    try {
      synth.cancel();
      const sequence=state.prefs.language==='ar' ? [['ar-SA',ar]] : state.prefs.language==='en' ? [['en-US',en]] : [['ar-SA',ar],['en-US',en]];
      const token=speechToken;
      const available=synth.getVoices();
      let pos=0;
      function sayNext() {
        if (token!==speechToken || pos>=sequence.length) return;
        const [lang,text]=sequence[pos++];
        const utterance=new SpeechSynthesisUtterance(text);
        utterance.lang=lang;
        utterance.rate=.84;
        utterance.pitch=1.09;
        const candidate=available.find(v => v.lang.toLowerCase()===lang.toLowerCase()) || available.find(v => v.lang.slice(0,2)===lang.slice(0,2));
        if (candidate) utterance.voice=candidate;
        utterance.onend=sayNext;
        utterance.onerror=sayNext;
        synth.speak(utterance);
      }
      sayNext();
    } catch (_) { /* visual play remains available even if speech fails */ }
  }
  const announce = text => { announcer.textContent=text; };
  const worldHeader = (id, indexText='') => `<div class="world-top">
    <button class="home-btn" data-act="home" aria-label="Back to all worlds">🏠 Home</button>
    ${indexText ? `<span class="counter">${indexText}</span>` : ''}
    <button class="replay" data-act="repeat" aria-label="Hear instructions again">🔊</button>
  </div><div class="game-panel"><div class="world-banner ${WORLDS[id].className}-banner">${WORLDS[id].emoji} ${WORLDS[id].en} · ${fmtAr(WORLDS[id].ar)}</div>`;
  const worldFooter = () => `</div>`;
  const homePage = () => `
    <section class="hero" aria-labelledby="welcome-title">
      <span class="sparkle s1">✨</span><span class="sparkle s2">⭐</span><span class="sparkle s3">✨</span>
      <span class="floaty" aria-hidden="true">🌍🦋🌈</span>
      <h1 id="welcome-title">My Little World</h1>
      <div class="arabic" lang="ar" dir="rtl">عالمي الصغير</div>
      <p>Tap, play, grow and smile!<br><span lang="ar" dir="rtl">المسي، العبي، وتعلمي!</span></p>
      <span class="pill">⭐ ${state.progress.stars} happy stars</span>
    </section>
    <h2 class="intro-title">🌟 Choose a world · ${fmtAr('اختاري عالماً')}</h2>
    <section class="worlds" aria-label="Choose a world">
      ${Object.entries(WORLDS).map(([id,w]) => `<button class="world-card ${w.className}-card" data-act="world" data-world="${id}" aria-label="${w.en}, ${w.ar}">
        <span class="chevron" aria-hidden="true">➜</span><span class="world-art" aria-hidden="true">${w.emoji}</span><strong>${w.en}</strong><span class="sub" lang="ar" dir="rtl">${w.ar}</span>
      </button>`).join('')}
    </section>
    <section class="shelf" aria-label="Collected stickers">
      <div class="shelf-head"><span>🏆 My sticker shelf</span><span>⭐ ${state.progress.stars}</span></div>
      <div class="shelf-sub" lang="ar">ملصقاتي الجميلة</div>
      <div class="sticker-list">${Object.entries(WORLDS).map(([id,w])=>`<div class="sticker ${state.progress.stickers[id]===0?'locked':''}" title="${w.en}">${w.sticker}<span>×${state.progress.stickers[id]}</span></div>`).join('')}</div>
    </section>
    <details class="grownup"><summary>⚙️ Grown-up settings · إعدادات الوالدين</summary>
      <div class="settings">
        <div class="settings-row"><label for="language">Instructions / لغة التعليمات</label>
          <select id="language" data-setting="language"><option value="both" ${state.prefs.language==='both'?'selected':''}>العربية + English</option>
          <option value="ar" ${state.prefs.language==='ar'?'selected':''}>العربية فقط</option>
          <option value="en" ${state.prefs.language==='en'?'selected':''}>English only</option></select></div>
        <div class="settings-row"><label>Speak and play sounds</label><button data-act="voice">${state.prefs.voice?'🔊 Sound on':'🔇 Sound off'}</button></div>
        <div class="settings-row"><label>Test the voice</label><button data-act="repeat">🗣️ Say hello</button></div>
        <div class="settings-row"><label>Reset stickers and stars</label><button data-act="reset">🧹 Reset progress</button></div>
        <p class="settings-note">Speech uses your phone's text-to-speech voices. For bilingual offline speech, install Arabic and English voices in Samsung/Android text-to-speech settings. The game itself needs no internet once cached.</p>
      </div>
    </details>
    <p class="footer">Made for little hands 💖 No ads · No accounts · No timers</p>`;
  const shapeSvg = (shape) => {
    const shapesPath={
      circle:'<circle cx="50" cy="50" r="41"/>',
      square:'<rect x="9" y="9" width="82" height="82" rx="6"/>',
      triangle:'<polygon points="50,5 95,91 5,91"/>',
      star:'<polygon points="50,3 61,35 96,35 69,56 80,92 50,71 20,92 31,56 4,35 39,35"/>',
      heart:'<path d="M50 91 C23 70 4 58 4 34 C4 3 39 -2 50 25 C61 -2 96 3 96 34 C96 58 77 70 50 91 Z"/>',
      diamond:'<polygon points="50,3 96,50 50,97 4,50"/>'
    };
    return `<svg viewBox="0 0 100 100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><g fill="#a179ea" stroke="#fff" stroke-width="3">${shapesPath[shape]||''}</g></svg>`;
  };
  function currentQuestion() {
    const s=state.session;
    if (!s) return null;
    if (s.world==='farm') return lookup(animals,s.order[s.index]);
    if (s.world==='colors') {
      const [kind,id]=s.order[s.index].split(':');
      return {kind,target:lookup(kind==='color'?colors:shapes,id)};
    }
    return null;
  }
  function makeAnswers() {
    const s=state.session;
    const q=currentQuestion();
    if (!s || !q) return '';
    if (s.world==='farm') return s.options.map(id=>{
      const a=lookup(animals,id);
      return `<button class="answer ${s.misses>=2&&id===q.id?'hint':''}" data-act="answer" data-id="${a.id}" aria-label="${a.en}, ${a.ar}"><span class="answer-emoji" aria-hidden="true">${a.emoji}</span><strong>${a.en}</strong><small lang="ar" dir="rtl">${a.ar}</small></button>`;
    }).join('');
    return s.options.map(id=>{
      const a=lookup(q.kind==='color'?colors:shapes,id);
      return `<button class="answer ${s.misses>=2&&id===q.target.id?'hint':''}" data-act="answer" data-id="${a.id}" aria-label="${a.en}, ${a.ar}">
        ${q.kind==='color'?`<span class="color-blob" style="background:${a.hex}" aria-hidden="true"></span>`:`<span class="shape-blob">${shapeSvg(a.shape)}</span>`}
        <strong>${a.en}</strong><small lang="ar" dir="rtl">${a.ar}</small></button>`;
    }).join('');
  }
  const successPanel = (finalQuestion) => `<div class="success-screen">
    <div class="star-shower" aria-hidden="true">⭐ ✨ ⭐</div>
    <div class="success-art" aria-hidden="true">${state.session.world==='farm'?currentQuestion().emoji:'🌈'} </div>
    <h2>Wonderful! 🎉</h2><div class="arabic" lang="ar">شَاطِرَة يا بَطَلَة!</div>
    <p>You found it! · ⭐ +1</p>
    <button class="primary" data-act="next">${finalQuestion?'🎁 My sticker!':'➡️ Next surprise!'} <span lang="ar">${finalQuestion?'ملصقي!':'التالي!'}</span></button>
  </div>`;
  const finishPanel = (id) => `<div class="success-screen">
    <div class="star-shower" aria-hidden="true">✨ ⭐ ✨</div>
    <div class="success-art" aria-hidden="true">${WORLDS[id].sticker}</div>
    <h2>A new sticker!</h2><div class="arabic" lang="ar">ملصق جديد! أحسنتِ!</div>
    <p>Let's keep exploring! · ${state.progress.stickers[id]} collected</p>
    <button class="primary" data-act="again">🔁 Play again · <span lang="ar">العبي مرة أخرى</span></button>
    <button class="secondary" data-act="home">🏠 All worlds · <span lang="ar">كل العوالم</span></button>
  </div>`;
  function renderQuiz(id) {
    const s=state.session;
    const q=currentQuestion();
    if (!q) { state.session=null; save(); return homePage(); }
    const total=s.order.length;
    let content;
    if (s.stage==='correct') content=successPanel(s.index===total-1);
    else if (s.stage==='done') content=finishPanel(id);
    else {
      const item=id==='farm' ? q : q.target;
      const instructionEn=id==='farm'?`Find the ${item.en.toLowerCase()}!`:q.kind==='color'?`Find ${item.en.toLowerCase()}!`:`Find the ${item.en.toLowerCase()}!`;
      const instructionAr=id==='farm'?`أين الـ${item.ar}؟`:q.kind==='color'?`أين اللون الـ${item.ar}؟`:`أين الـ${item.ar}؟`;
      content=`<h2 class="instruction">${instructionEn}</h2><p class="instruction-ar" lang="ar" dir="rtl">${instructionAr}</p>
      <p class="helper">${s.misses===0?'👆 Tap the picture · المسِي الصورة':s.misses<2?'💛 Almost! Try another · حاولي مرة أخرى':'✨ Look for the glowing picture! · ابحثي عن الصورة المضيئة'}</p>
      <div class="answers">${makeAnswers()}</div>`;
    }
    return worldHeader(id,`⭐ ${Math.min(s.index+1,total)} / ${total}`)+content+worldFooter();
  }
  function renderKitchen() {
    const s=state.session;
    if (s.stage==='done') return worldHeader('kitchen')+finishPanel('kitchen')+worldFooter();
    const selected=s.chosen.map(id=>lookup(foods,id)).filter(Boolean);
    return worldHeader('kitchen',`🍓 ${selected.length} / 3`)+`
      <h2 class="instruction">Let's make a yummy plate!</h2><p class="instruction-ar" lang="ar">هيا نُحضِّر طَبَقاً لَذِيذاً!</p>
      <p class="helper">🍎 Tap any 3 foods · اختاري ثلاث أطعمة</p>
      <div class="plate" aria-label="Your plate">${selected.length?selected.map(f=>`<span role="img" aria-label="${f.en}">${f.emoji}</span>`).join(''):'🍽️'}</div>
      <div class="kitchen-items">${s.order.map(id=>{const f=lookup(foods,id);return `<button class="food-btn" data-act="food" data-id="${id}" ${s.chosen.includes(id)?'disabled':''} aria-label="${f.en}, ${f.ar}">${f.emoji}<span>${f.en}</span></button>`;}).join('')}</div>
      ${s.chosen.length?`<button class="secondary" data-act="undo">↶ Undo last · <span lang="ar">تراجعي</span></button>`:''}
    `+worldFooter();
  }
  function renderGarden() {
    const s=state.session;
    if (s.stage==='done') return worldHeader('garden')+finishPanel('garden')+worldFooter();
    const bloom=lookup(flowers,s.flower);
    const plant=s.step===0?'🟤':s.step===1?'🌱':s.step===2?'🌿':(bloom?.emoji || '🌷');
    const titles=[['Pick a flower seed!','اختاري بَذْرَة زَهْرَة!'],['Give it some water!','اسْقِي الزَّهْرَة بِالمَاء!'],['Give it sunshine!','أَعْطِيها ضَوْءَ الشَّمْس!']];
    const [en,ar]=titles[Math.min(2,s.step)];
    return worldHeader('garden',`🌱 ${s.step+1} / 3`)+`
      <h2 class="instruction">${en}</h2><p class="instruction-ar" lang="ar">${ar}</p>
      <div class="garden-scene" aria-label="Growing a flower">
        <span class="garden-sun" aria-hidden="true">☀️</span><span class="garden-butterfly" aria-hidden="true">🦋</span>
        <span class="garden-plant" key="${s.step}" aria-hidden="true">${plant}</span><span class="garden-pot" aria-hidden="true">🪴</span>
      </div>
      ${s.step===0?`<div class="garden-actions">${flowers.map(f=>`<button class="garden-action" data-act="seed" data-id="${f.id}" aria-label="Plant a ${f.en}">🌱<span>${f.emoji} ${f.en}</span></button>`).join('')}</div>`:
      s.step===1?`<button class="garden-action big" data-act="water">💧<span>Water! · <span lang="ar">ماء!</span></span></button>`:
      `<button class="garden-action big" data-act="sun">☀️<span>Sunshine! · <span lang="ar">شمس!</span></span></button>`}
    `+worldFooter();
  }
  function render() {
    const active=state.session;
    const area=active ? (active.world==='kitchen'?renderKitchen():active.world==='garden'?renderGarden():renderQuiz(active.world)) : homePage();
    app.innerHTML=`<header class="app-header">
       <div class="brand"><span class="brand-dot" aria-hidden="true">🌈</span><div class="brand-text"><strong>My Little World</strong><span lang="ar" dir="rtl">عالمي الصغير</span></div></div>
       <div class="head-tools"><button class="icon-btn" data-act="voice" aria-label="Toggle sound" title="Sound on/off">${state.prefs.voice?'🔊':'🔇'}</button>
       <button class="icon-btn" data-act="repeat" aria-label="Hear the instructions again" title="Hear again">🗣️</button></div>
     </header>${area}`;
    save();
  }
  function prepareOptions() {
    const s=state.session;
    if (!s || !['farm','colors'].includes(s.world)) return;
    const q=currentQuestion();
    const list=s.world==='farm'?animals:q.kind==='color'?colors:shapes;
    const answer=s.world==='farm'?q.id:q.target.id;
    s.options=shuffle([answer,...shuffle(list.filter(item=>item.id!==answer)).slice(0,3).map(item=>item.id)]);
  }
  function startWorld(id) {
    const s={world:id,stage:'play',index:0,misses:0,order:[],options:[],chosen:[],step:0,flower:null};
    if (id==='farm') s.order=shuffle(animals.map(a=>a.id)).slice(0,4);
    if (id==='colors') {
      s.order=shuffle([
        ...shuffle(colors).slice(0,2).map(c=>`color:${c.id}`),
        ...shuffle(shapes).slice(0,2).map(sh=>`shape:${sh.id}`)
      ]);
    }
    if (id==='kitchen') s.order=shuffle(foods.map(f=>f.id)).slice(0,6);
    state.session=s;
    prepareOptions();
    render();
    repeatInstructions();
  }
  function finish(id) {
    state.progress.stickers[id]+=1;
    state.progress.completed+=1;
    state.session.stage='done';
    calmTones(true);
    render();
    speak('أَحْسَنْتِ! حَصَلْتِ عَلَى مُلْصَقٍ جَدِيد!', 'Hooray! You earned a new sticker!');
  }
  function quizAnswer(id) {
    const s=state.session;
    if (!s || s.stage!=='play') return;
    const q=currentQuestion();
    const answer=s.world==='farm'?q.id:q.target.id;
    if (!s.options.includes(id)) return;
    if (id!==answer) {
      s.misses=Math.min(4,s.misses+1);
      render();calmTones(false);speak('جَرِّبِي صُورَةً أُخْرَى.', "Let\'s try another picture!");
      announce('Try another picture');
      return;
    }
    state.progress.stars+=1;
    s.stage='correct';
    render();calmTones(true);
    speak('أَحْسَنْتِ يا بَطَلَة!', 'You did it! Great job!');
    announce('Wonderful, you found it');
  }
  function nextQuestion() {
    const s=state.session;
    if (!s || s.stage!=='correct') return;
    if (s.index+1===s.order.length) { finish(s.world); return; }
    s.index+=1;s.misses=0;s.stage='play';
    prepareOptions();render();repeatInstructions();
  }
  function foodPick(id) {
    const s=state.session;
    if (!s || s.world!=='kitchen' || s.stage!=='play' || !s.order.includes(id) || s.chosen.includes(id)) return;
    const f=lookup(foods,id);
    s.chosen.push(id);
    if (s.chosen.length===3) {state.progress.stars+=3;finish('kitchen');return;}
    render();calmTones(true);speak(`هَذِهِ ${f.ar}. اِخْتَارِي طَعَاماً آخَر.`, `${f.en}. Choose another food!`);
    announce(`${f.en} added to the plate`);
  }
  function undoFood() {
    const s=state.session;
    if (!s || s.world!=='kitchen' || s.stage!=='play') return;
    s.chosen.pop();render();repeatInstructions();
  }
  function gardenAction(action,id) {
    const s=state.session;
    if (!s || s.world!=='garden' || s.stage!=='play') return;
    if (action==='seed' && s.step===0 && lookup(flowers,id)) {s.flower=id;s.step=1;}
    else if (action==='water' && s.step===1) s.step=2;
    else if (action==='sun' && s.step===2) {s.step=3;state.progress.stars+=3;finish('garden');return;}
    else return;
    render();calmTones(true);repeatInstructions();
  }
  function repeatInstructions() {
    const s=state.session;
    if (!s) {speak('مَرْحَباً بِكِ في عَالَمِكِ الصَّغِير! اِخْتَارِي لُعْبَةً!', 'Welcome to My Little World! Choose a world to play!');return;}
    if (s.stage==='correct') {speak('أَحْسَنْتِ! اِلْمَسِي التَّالِي.', 'Great job! Tap next.');return;}
    if (s.stage==='done') {speak('رَائِع! لَدَيْكِ مُلْصَقٌ جَدِيد!', 'Amazing! You have a new sticker!');return;}
    if (s.world==='farm') {
      const animal=currentQuestion();speak(`أَيْنَ ${animal.ar}؟ اِلْمَسِي الصُّورَةَ.`, `Can you find the ${animal.en.toLowerCase()}? Touch the picture!`);
    } else if (s.world==='colors') {
      const q=currentQuestion();speak(q.kind==='color'?`أَيْنَ اللَّوْنُ ${q.target.ar}؟`:`أَيْنَ ${q.target.ar}؟`, `Can you find the ${q.target.en.toLowerCase()}?`);
    } else if (s.world==='kitchen') {
      speak('هَيَّا نُحَضِّرُ طَبَقاً لَذِيذاً! اِخْتَارِي ثَلَاثَةَ أَطْعِمَةٍ.', "Let's make a yummy plate! Pick three foods!");
    } else if (s.world==='garden') {
      const prompts=[['اِخْتَارِي بَذْرَةَ زَهْرَةٍ!','Choose a flower seed!'],['اسْقِي النَّبْتَةَ بِالْمَاءِ!','Give the plant some water!'],['أَعْطِي النَّبْتَةَ الشَّمْسَ!','Give the plant sunshine!']];
      speak(...prompts[Math.min(s.step,2)]);
    }
  }
  app.addEventListener('click', event => {
    const btn=event.target.closest('button[data-act]');
    if (!btn || btn.disabled) return;
    const act=btn.dataset.act;
    if (act==='world' && WORLDS[btn.dataset.world]) startWorld(btn.dataset.world);
    else if (act==='home') {state.session=null;render();speak('اختاري عالماً لِلَّعِبِ!', 'Choose a world to play!');}
    else if (act==='repeat') repeatInstructions();
    else if (act==='voice') {state.prefs.voice=!state.prefs.voice;if (!state.prefs.voice) {++speechToken;window.speechSynthesis?.cancel();}render();if(state.prefs.voice)repeatInstructions();}
    else if (act==='answer') quizAnswer(btn.dataset.id);
    else if (act==='next') nextQuestion();
    else if (act==='food') foodPick(btn.dataset.id);
    else if (act==='undo') undoFood();
    else if (['seed','water','sun'].includes(act)) gardenAction(act,btn.dataset.id);
    else if (act==='again' && state.session) startWorld(state.session.world);
    else if (act==='reset') {
      if (window.confirm('Reset all stickers and happy stars? / هل تريد حذف الملصقات والنجوم؟')) {
        const p=state.prefs;state=initial();state.prefs=p;render();
      }
    }
  });
  app.addEventListener('change', event => {
    if (event.target.dataset.setting==='language' && ['both','ar','en'].includes(event.target.value)) {
      state.prefs.language=event.target.value;save();repeatInstructions();
    }
  });
  window.addEventListener('pagehide',save);
  if ('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost')) {
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }
  render();
})();
