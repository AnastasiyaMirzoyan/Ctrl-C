"use strict";
const APP = document.getElementById('app');
const $ = (s,r=document)=>r.querySelector(s);
const el = (t,c,h)=>{const e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e;};

const LABS = [
  {id:'sec', icon:'🔒', name:'Информационная безопасность', game:'«Охота на вирусы»',
   module:'Модуль Безопасности', ac:'#ff5a6e', type:'virus',
   link:'https://rsue.ru/abitur/bakalavry-i-spetsialisty/spec/Inf_bezopasnost.pdf'},
  {id:'eng', icon:'💻', name:'Программная инженерия', game:'«Сопоставь команды»',
   module:'Модуль Разработки', ac:'#2ee5ff', type:'match',
   link:'https://rsue.ru/abitur/bakalavry-i-spetsialisty/spec/PRI.pdf'},
  {id:'sys', icon:'🌐', name:'Информационные системы и технологии', game:'«Поток данных»',
   module:'Модуль Систем', ac:'#7CFFB2', type:'pipe',
   link:'https://rsue.ru/abitur/bakalavry-i-spetsialisty/spec/inf_sist_bisness.pdf'},
  {id:'app', icon:'📱', name:'Прикладная информатика', game:'«Маршрутизация запросов»',
   module:'Модуль Автоматизации', ac:'#ffd14a', type:'route',
   link:'https://rsue.ru/abitur/bakalavry-i-spetsialisty/spec/priklad_ekonom.pdf'},
  {id:'math',icon:'🤖', name:'Прикладная математика и информатика', game:'«Робот-доставщик»',
   module:'Модуль Алгоритмов', ac:'#b07cff', type:'maze',
   link:'https://rsue.ru/abitur/bakalavry-i-spetsialisty/spec/PMI.pdf'},
  {id:'fund',icon:'🧠', name:'Фундаментальная информатика', game:'«Двоичный код»',
   module:'Модуль Вычислений', ac:'#ff8a3d', type:'binary',
   link:'https://rsue.ru/abitur/bakalavry-i-spetsialisty/spec/fund_informatica.pdf'},
  {id:'biz', icon:'📊', name:'Бизнес-информатика', game:'«Распредели бюджет»',
   module:'Модуль Управления', ac:'#49d6ff', type:'budget',
   link:'https://rsue.ru/abitur/bakalavry-i-spetsialisty/spec/BisnesInformatika.pdf'},
];
const IMG_ALEKSEY = 'images/aleksey.png';
const IMG_ALINA = 'images/alina.png';
const IMG_LAB = 'images/bg-lab.jpg';
const IMG_FINALE_BG = 'images/bg-finale.jpg';
const IMG_LOBBY = 'images/bg-lobby.jpg';
const IMG_ROBOT = 'images/robot.png';
const AV = {'Алексей Олегович':'IMG','Алина':'IMG','Система':'⚠️','Робот':'🛠️','Студенты':'🎉'};
const AV_IMG = {'Алексей Олегович':IMG_ALEKSEY,'Алина':IMG_ALINA,'Робот':IMG_ROBOT};
const collected = new Set();
const scores = {};
const STAR_POINTS = 100;
function totalScore(){ return Object.values(scores).reduce((s,v)=>s+v*STAR_POINTS,0); }
function clearScores(){ for(const k in scores) delete scores[k]; }
function starsFromMistakes(m){ return m===0 ? 3 : (m<=2 ? 2 : 1); }
function frogSVG(color, sz){
  sz = sz||30;
  return `<svg class="frog" width="${sz}" height="${Math.round(sz*0.92)}" viewBox="0 0 64 58" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle">
    <ellipse cx="32" cy="40" rx="23" ry="16" fill="${color}"/>
    <ellipse cx="32" cy="47" rx="14" ry="7" fill="rgba(0,0,0,.13)"/>
    <circle cx="19" cy="17" r="12" fill="${color}"/><circle cx="45" cy="17" r="12" fill="${color}"/>
    <circle cx="19" cy="15" r="7.5" fill="#fff"/><circle cx="45" cy="15" r="7.5" fill="#fff"/>
    <circle cx="20" cy="16" r="3.4" fill="#0b1020"/><circle cx="44" cy="16" r="3.4" fill="#0b1020"/>
    <circle cx="21.4" cy="14.6" r="1.1" fill="#fff"/><circle cx="45.4" cy="14.6" r="1.1" fill="#fff"/>
    <path d="M20 42 Q32 51 44 42" stroke="#0b1020" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <circle cx="14" cy="40" r="3.1" fill="rgba(255,255,255,.28)"/><circle cx="50" cy="40" r="3.1" fill="rgba(255,255,255,.28)"/>
  </svg>`;
}

const DB_KEY = 'kf_users_v1';
const SESSION_KEY = 'kf_current_user';
let currentUser = null;

function safeStore(get, set){
  try{ return get(); }catch(e){ return set; }
}
function loadDB(){
  try{ return JSON.parse(localStorage.getItem(DB_KEY)) || {}; }
  catch(e){ return {}; }
}
function saveDB(db){
  try{ localStorage.setItem(DB_KEY, JSON.stringify(db)); }catch(e){}
}
function isValidEmail(s){

  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
}
function setSession(email){
  currentUser = email;
  try{ localStorage.setItem(SESSION_KEY, email); }catch(e){}
}
function clearSession(){
  currentUser = null;
  try{ localStorage.removeItem(SESSION_KEY); }catch(e){}
}
function loadProgress(){
  collected.clear(); clearScores();
  if(!currentUser) return;
  const db = loadDB();
  const u = db[currentUser];
  if(u && Array.isArray(u.progress)) u.progress.forEach(id=>collected.add(id));
  if(u && u.scores) Object.assign(scores, u.scores);
}
function saveProgress(){
  if(!currentUser) return;
  const db = loadDB();
  if(!db[currentUser]) db[currentUser] = {pass:'', progress:[]};
  db[currentUser].progress = Array.from(collected);
  db[currentUser].scores = scores;
  saveDB(db);
}

const D = {
 intro:[
  ['Алексей Олегович','Привет! Добро пожаловать на День открытых дверей!'],
  ['Алина','Ого, здесь столько интересного! А ты кто?'],
  ['Алексей Олегович','Я Алексей Олегович — цифровой помощник факультета. Сегодня я должен был показать гостям все наши направления.'],
  ['Алексей Олегович','Но произошёл серьёзный сбой в системе. Цифровая сеть факультета недоступна.'],
  ['Алина','Это плохо?'],
  ['Алексей Олегович','Очень. Без системы ни одна лаборатория не сможет работать.'],
  ['Алина','И что теперь делать?'],
  ['Алексей Олегович','Помоги мне восстановить все направления факультета. Только так мы сможем спасти День открытых дверей.'],
  ['Алексей Олегович','Центральная система разделена на семь модулей. Посети каждую лабораторию и собери их все!'],
 ],
 sec:{pre:[
   ['Алексей Олегович','Мы в лаборатории информационной безопасности.'],
   ['Алексей Олегович','После сбоя часть файлов оказалась заражена вирусами.'],
   ['Алина','Нужно удалить вирусы?'],
   ['Алексей Олегович','Именно. Но не перепутай их с обычными файлами.'],
   ['Алексей Олегович','Чем быстрее очистим систему, тем быстрее заработает защита сети.'],
  ],post:[
   ['Алексей Олегович','Отличная работа! Система очищена.'],
   ['Алина','Значит, специалисты по ИБ действительно занимаются защитой данных?'],
   ['Алексей Олегович','Да. Мы защищаем сети, серверы и пользователей от угроз.'],
   ['Алексей Олегович','Получен Модуль Безопасности.'],
  ]},
 eng:{pre:[
   ['Алексей Олегович','Здесь создают программы и приложения.'],
   ['Алексей Олегович','После сбоя наш справочник команд перемешался: команды отделились от своих описаний.'],
   ['Алина','Нужно вернуть всё на места?'],
   ['Алексей Олегович','Да. Открывай по две карточки и сопоставляй команду с тем, что она делает.'],
   ['Алексей Олегович','Программист должен хорошо знать инструменты своего языка.'],
  ],post:[
   ['Алексей Олегович','Отлично! Справочник команд восстановлен.'],
   ['Алина','Получилось!'],
   ['Алексей Олегович','Так и работает разработчик: знает, какая команда за что отвечает.'],
   ['Алексей Олегович','Получен Модуль Разработки.'],
  ]},
 sys:{pre:[
   ['Алексей Олегович','Здесь изучают работу больших информационных систем.'],
   ['Алексей Олегович','После сбоя трубопровод данных рассыпался — пакеты не доходят до базы.'],
   ['Алина','Значит, нужно собрать маршрут заново?'],
   ['Алексей Олегович','Верно. Поворачивай трубы, чтобы соединить сервер с базой данных.'],
  ],post:[
   ['Алексей Олегович','Отлично! Данные снова текут от сервера к базе.'],
   ['Алина','Теперь понимаю, сколько всего должно работать вместе.'],
   ['Алексей Олегович','Получен Модуль Систем.'],
  ]},
 app:{pre:[
   ['Алексей Олегович','Наш цифровой кампус больше не понимает, куда направлять обращения студентов.'],
   ['Алина','То есть запросы приходят, но теряются?'],
   ['Алексей Олегович','Да. Соедини каждый запрос с нужной службой, чтобы помощник снова работал.'],
  ],post:[
   ['Алексей Олегович','Отлично! Все обращения идут по адресу.'],
   ['Алина','Значит прикладная информатика помогает автоматизировать процессы?'],
   ['Алексей Олегович','Именно этим мы и занимаемся.'],
   ['Алексей Олегович','Получен Модуль Автоматизации.'],
  ]},
 math:{pre:[
   ['Алексей Олегович','Мы прибыли в лабораторию робототехники.'],
   ['Алексей Олегович','После сбоя робот потерял маршрут доставки.'],
   ['Алина','Нужно провести его к цели?'],
   ['Алексей Олегович','Да. Найди лучший путь.'],
  ],post:[
   ['Робот','Маршрут успешно восстановлен.'],
   ['Алина','Выходит, здесь много алгоритмов и расчётов?'],
   ['Алексей Олегович','Да. Мы учим компьютеры решать сложные задачи.'],
   ['Алексей Олегович','Получен Модуль Алгоритмов.'],
  ]},
 fund:{pre:[
   ['Алексей Олегович','Наш вычислительный центр отключился.'],
   ['Алина','Что нужно сделать?'],
   ['Алексей Олегович','Компьютер понимает только нули и единицы. Собери числа в двоичном коде.'],
   ['Алексей Олегович','Включай нужные биты, чтобы их сумма дала заданное число.'],
  ],post:[
   ['Алексей Олегович','Великолепно! Ядро снова считает.'],
   ['Алина','Так вот как числа выглядят внутри компьютера.'],
   ['Алексей Олегович','Именно фундаментальные знания позволяют создавать новые технологии.'],
   ['Алексей Олегович','Получен Модуль Вычислений.'],
  ]},
 biz:{pre:[
   ['Алексей Олегович','Последняя лаборатория.'],
   ['Алексей Олегович','У нашего стартапа есть бюджет, но он распределён неудачно.'],
   ['Алина','Нужно вложить деньги правильно?'],
   ['Алексей Олегович','Верно. Распредели средства между разработкой, маркетингом и серверами так, чтобы достичь целей.'],
  ],post:[
   ['Алексей Олегович','Отличная работа! Показатели вышли в плюс.'],
   ['Алина','Получается, здесь изучают не только технологии, но и управление?'],
   ['Алексей Олегович','Да. Мы соединяем IT и бизнес.'],
   ['Алексей Олегович','Получен Модуль Управления.'],
  ]},
 finale:[
   ['Алексей Олегович','Невероятно! Ты собрал все семь модулей.'],
   ['Алина','Значит, теперь система заработает?'],
   ['Алексей Олегович','Остался последний шаг. Активируй центральный терминал!'],
 ],
 finale2:[
   ['Алексей Олегович','День открытых дверей спасён!'],
   ['Алина','Честно говоря, я даже не думал, что IT может быть настолько разным.'],
   ['Алексей Олегович','Теперь ты познакомился со всеми направлениями факультета.'],
   ['Алина','Кажется, я уже начинаю представлять себя студентом КТиИБ.'],
   ['Алексей Олегович','Тогда будем ждать тебя снова. Уже не как гостя, а как студента.'],
 ]
};

function frame(){
  APP.innerHTML='';
  const stage=el('div','stage');
  const top=el('div','topbar');
  top.appendChild(el('div','hbrand','КОД ФАКУЛЬТЕТА'));
  const shelf=el('div','frogshelf');
  LABS.forEach(L=>{
    const st = scores[L.id]||0;
    const chip=el('div','frogchip'+(st?' got':''));
    chip.style.setProperty('--gl', L.ac+'88');
    chip.title = L.name + (st ? ` — жаба получена, ${st} из 3` : ' — ещё не пройдено');
    chip.innerHTML = frogSVG(st?L.ac:'#2a3552',24) + `<span class="fst">${st?'★'.repeat(st):''}</span>`;
    shelf.appendChild(chip);
  });
  top.appendChild(shelf);
  const sc=el('div','score-badge'); sc.title='Всего очков';
  sc.innerHTML=`🏆 <b>${totalScore()}</b>`;
  top.appendChild(sc);
  const scr=el('div','screen');
  stage.appendChild(top); stage.appendChild(scr);
  APP.appendChild(stage);
  return scr;
}

function runDialog(scr,lines,{art,label,onDone,bg}){
  if(bg){
    scr.classList.add('has-bg');
    scr.style.backgroundImage=`linear-gradient(180deg,rgba(5,7,15,.30) 0%,rgba(5,7,15,.42) 55%,rgba(5,7,15,.66) 100%),url("${bg}")`;
    scr.style.backgroundSize='cover';
    scr.style.backgroundPosition='center';
    scr.style.backgroundRepeat='no-repeat';
  }
  const wrap=el('div','dialog-wrap');
  let sceneImg=null, sceneEmoji=null;
  {const a=el('div','scene-art');
    const im=el('img');im.style.maxHeight='80%';im.style.maxWidth='60%';im.style.objectFit='contain';im.style.filter='drop-shadow(0 8px 22px rgba(0,0,0,.6))';im.style.transition='opacity .2s';im.style.display='none';
    a.appendChild(im);sceneImg=im;
    if(art){ if(typeof art==='string'&&art.startsWith('data:')){im.src=art;im.style.display='';}
      else{sceneEmoji=el('span',null,art);sceneEmoji.style.lineHeight='1';a.appendChild(sceneEmoji);} }
    scr.appendChild(a);}
  const box=el('div','dialog');
  const sp=el('div','speaker'); const av=el('div','av'); const nm=el('div','nm');
  sp.appendChild(av);sp.appendChild(nm);
  const line=el('div','line'); const row=el('div','row');
  const next=el('button','btn','Далее ▸');
  row.appendChild(next);
  box.appendChild(sp);box.appendChild(line);box.appendChild(row);
  wrap.appendChild(box);scr.appendChild(wrap);

  let i=0, typing=false, full='', ti=null;
  function show(){
    const [who,txt]=lines[i];
    nm.textContent=who;
    if(AV_IMG[who]){
      if(sceneImg){if(sceneImg.src!==AV_IMG[who])sceneImg.src=AV_IMG[who];sceneImg.style.display='';}
      if(sceneEmoji)sceneEmoji.style.display='none';
    }else{
      if(sceneEmoji){sceneEmoji.style.display='';if(sceneImg)sceneImg.style.display='none';}
    }
    if(AV_IMG[who]){av.innerHTML='';av.style.background='#0b1226';av.style.backgroundImage=`url("${AV_IMG[who]}")`;av.style.backgroundSize='cover';av.style.backgroundPosition='center top';}
    else{av.style.backgroundImage='';av.style.background='rgba(46,229,255,.08)';av.textContent=AV[who]||'❔';}
    const col = who==='Алексей Олегович'?'var(--cyan)':who==='Алина'?'var(--magenta)':who==='Система'?'var(--red)':'var(--ink)';
    nm.style.color=col; av.style.borderColor=col;
    full=txt; line.innerHTML=''; let k=0; typing=true;
    next.textContent = (i===lines.length-1)?'▸':'Далее ▸';
    clearInterval(ti);
    ti=setInterval(()=>{
      if(k<full.length){line.textContent=full.slice(0,++k);}
      else{clearInterval(ti);typing=false;line.innerHTML=full+'<span class="cursor"></span>';}
    },16);
  }
  function advance(){
    if(typing){clearInterval(ti);typing=false;line.innerHTML=full+'<span class="cursor"></span>';return;}
    i++;
    if(i>=lines.length){onDone&&onDone();return;}
    show();
  }
  next.onclick=(e)=>{e.stopPropagation();advance();};
  box.onclick=advance;
  show();
}

function authScreen(){
  const scr=frame();
  const c=el('div','center');
  c.appendChild(el('div','subtitle','День открытых дверей · КТиИБ'));
  c.appendChild(el('div','glitch','КОД<br>ФАКУЛЬТЕТА'));

  const box=el('div','auth');
  let mode='login'; // login | register

  const tabs=el('div','tabs');
  const tLogin=el('div','tab on','Вход');
  const tReg=el('div','tab','Регистрация');
  tabs.appendChild(tLogin); tabs.appendChild(tReg);

  const fEmail=el('div','fld');
  fEmail.innerHTML='<label>Электронная почта</label>';
  const iEmail=el('input'); iEmail.type='text'; iEmail.placeholder='example@mail.ru'; iEmail.autocomplete='username';
  fEmail.appendChild(iEmail);

  const fPass=el('div','fld');
  fPass.innerHTML='<label>Пароль</label>';
  const iPass=el('input'); iPass.type='password'; iPass.placeholder='не менее 4 символов'; iPass.autocomplete='current-password';
  fPass.appendChild(iPass);

  const err=el('div','err','');

  const submit=el('button','btn','▸ Войти'); submit.style.marginTop='4px';

  box.appendChild(tabs);
  box.appendChild(fEmail);
  box.appendChild(fPass);
  box.appendChild(err);
  box.appendChild(submit);

  function setMode(m){
    mode=m; err.textContent=''; err.className='err';
    iEmail.classList.remove('bad'); iPass.classList.remove('bad');
    if(m==='login'){ tLogin.classList.add('on'); tReg.classList.remove('on'); submit.textContent='▸ Войти'; }
    else{ tReg.classList.add('on'); tLogin.classList.remove('on'); submit.textContent='▸ Создать аккаунт'; }
  }
  tLogin.onclick=()=>setMode('login');
  tReg.onclick=()=>setMode('register');

  function fail(msg, field){
    err.textContent=msg; err.className='err';
    if(field==='email')iEmail.classList.add('bad');
    if(field==='pass')iPass.classList.add('bad');
  }

  function doSubmit(){
    iEmail.classList.remove('bad'); iPass.classList.remove('bad'); err.className='err';
    const email=iEmail.value.trim().toLowerCase();
    const pass=iPass.value;
    if(!email){ return fail('Введите электронную почту.','email'); }
    if(!isValidEmail(email)){ return fail('Введите корректный адрес: имя@домен.зона','email'); }
    if(!pass){ return fail('Введите пароль.','pass'); }
    const db=loadDB();
    if(mode==='register'){
      if(pass.length<4){ return fail('Пароль должен быть не короче 4 символов.','pass'); }
      if(db[email]){ return fail('Аккаунт с такой почтой уже существует. Войдите.','email'); }
      db[email]={pass:pass, progress:[]};
      saveDB(db);
      setSession(email); loadProgress(); titleScreen();
    }else{
      const u=db[email];
      if(!u){ return fail('Аккаунт не найден. Зарегистрируйтесь.','email'); }
      if(u.pass!==pass){ return fail('Неверный пароль.','pass'); }
      setSession(email); loadProgress(); titleScreen();
    }
  }
  submit.onclick=doSubmit;
  iPass.addEventListener('keydown',e=>{ if(e.key==='Enter')doSubmit(); });
  iEmail.addEventListener('keydown',e=>{ if(e.key==='Enter')iPass.focus(); });

  c.appendChild(box);
  scr.appendChild(c);
  setTimeout(()=>iEmail.focus(),50);
}

function titleScreen(){
  if(!currentUser){ return authScreen(); }
  const scr=frame();
  const c=el('div','center');
  c.appendChild(el('div','subtitle','День открытых дверей · КТиИБ'));
  c.appendChild(el('div','glitch','КОД<br>ФАКУЛЬТЕТА'));
  c.appendChild(el('div','tagline','Цифровая сеть факультета дала сбой. Помоги Алексею Олеговичу восстановить семь направлений подготовки, пройди мини-игры в каждой лаборатории и собери все цифровые модули.'));


  if(collected.size>0 && collected.size<7){
    const cont=el('button','btn','▸ Продолжить');
    cont.style.marginTop='10px';
    cont.onclick=()=>hub();
    c.appendChild(cont);
    const fresh=el('button','btn ghost','Начать заново');
    fresh.onclick=()=>{ collected.clear(); clearScores(); saveProgress(); intro(); };
    c.appendChild(fresh);
  }else{
    const b=el('button','btn','▸ Начать игру');
    b.style.marginTop='10px';
    b.onclick=()=>{ if(collected.size===7){collected.clear();clearScores();saveProgress();} intro(); };
    c.appendChild(b);
  }

  const out=el('button','btn ghost','Выйти из аккаунта');
  out.onclick=()=>{ clearSession(); collected.clear(); clearScores(); authScreen(); };
  c.appendChild(out);

  scr.appendChild(c);
}

function intro(){
  const scr=frame();
  runDialog(scr,D.intro,{art:IMG_ALEKSEY,bg:IMG_LOBBY,onDone:hub});
}

function hub(){
  const scr=frame();
  const h=el('div','hub');
  h.appendChild(el('p','sub',`Собрано модулей: ${collected.size} из 7. Выбери лабораторию ▾`));
  const grid=el('div','labgrid');
  LABS.forEach(L=>{
    const card=el('div','lab'+(collected.has(L.id)?' done':''));
    card.style.setProperty('--ac',L.ac);
    card.style.setProperty('--gl',L.ac+'66');
    card.innerHTML=`<div class="ic">${L.icon}</div>
      <div class="nm">${L.name}</div>
      <div class="game">${L.game}</div>
      <div class="stamp">✓ пройдено</div>`;
    card.onclick=()=>enterLab(L);
    grid.appendChild(card);
  });
  h.appendChild(grid);
  const fb=el('div','finbtn');
  fb.style.cssText='margin-top:14px;display:flex;flex-direction:column;align-items:center;gap:10px';
  if(collected.size===7){
    const b=el('button','btn','⚡ Активировать центральный терминал');
    b.onclick=()=>finale();
    fb.appendChild(b);
  }
  const fin=el('button','btn ghost','🏁 Завершить игру и посмотреть результаты');
  fin.onclick=()=>results({early:collected.size<7});
  fb.appendChild(fin);
  if(collected.size<7){
    const hint=el('div','hint',`Пройдено ${collected.size} из 7. Можно завершить сейчас или открыть остальные лаборатории.`);
    hint.style.cssText='margin:0;text-align:center;max-width:520px';
    fb.appendChild(hint);
  }
  h.appendChild(fb);
  scr.appendChild(h);
}

function enterLab(L){
  if(collected.has(L.id)){
    const scr=frame();
    runDialog(scr,[['Алексей Олегович',`Эта лаборатория уже восстановлена. ${L.module} получен.`]],
      {art:L.icon,label:L.name,onDone:hub});
    return;
  }
  const scr=frame();
  runDialog(scr,D[L.id].pre,{art:L.icon,label:L.name,bg:IMG_LAB,onDone:()=>playMiniGame(scr,L)});
}

function playMiniGame(scr,L){
  scr.innerHTML='';
  scr.classList.remove('has-bg');
  scr.style.backgroundImage='';
  const mg=el('div','mg');
  const head=el('div','mg-head');
  head.innerHTML=`<span class="ic">${L.icon}</span><span class="ti">${L.game}</span><span class="obj" id="obj"></span>`;
  const body=el('div','mg-body'); body.id='mgbody';
  const foot=el('div','mg-foot');
  foot.innerHTML=`<button class="btn ghost" id="skip">↺ В холл</button>
     <div class="prog"><i id="pbar"></i></div><div class="cnt" id="cnt"></div>`;
  mg.appendChild(head);mg.appendChild(body);mg.appendChild(foot);
  scr.appendChild(mg);
  $('#skip',mg).onclick=()=>{ if(body._cleanup)body._cleanup(); hub(); };
  let mistakes=0;
  const GUIDE = new Set(['Сначала выбери левый порт']);
  const win=(forcedStars)=>{
    if(body._cleanup)body._cleanup();
    const stars = (forcedStars!=null) ? forcedStars : starsFromMistakes(mistakes);
    scores[L.id] = stars;
    const gained = stars*STAR_POINTS;
    body.innerHTML='';
    const w=el('div','win');
    w.innerHTML=`<div class="mod">${frogSVG(L.ac,96)}</div>
      <div class="frog-stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
      <h3>${L.module} получен!</h3>
      <p>Награда — жаба «${L.name}».<br>Качество прохождения: <b>${stars} из 3</b> · <b>+${gained}</b> очков
      ${mistakes>0?`<br><span style="opacity:.7">ошибок: ${mistakes}</span>`:'<br><span style="opacity:.7">без ошибок — идеально!</span>'}</p>`;
    const b=el('button','btn','▸ Дальше');
    b.onclick=()=>{collected.add(L.id); saveProgress();
      const scr2=frame();
      runDialog(scr2,D[L.id].post,{art:L.icon,label:L.name,bg:IMG_LAB,onDone:hub});};
    w.appendChild(b);
    if(L.link){
      const a=document.createElement('a');
      a.className='btn ghost';
      a.href=L.link; a.target='_blank'; a.rel='noopener noreferrer';
      a.style.textDecoration='none';
      a.textContent='🔗 Узнать о направлении';
      w.appendChild(a);
    }
    body.appendChild(w);
  };
  const api={body,setObj:t=>$('#obj',mg).textContent=t,setProg:(v)=>{$('#pbar',mg).style.width=v+'%';},
    setCnt:t=>$('#cnt',mg).textContent=t,
    toast:(t,k)=>{ if(k==='bad' && !GUIDE.has(t)) mistakes++; toast(body,t,k); },
    miss:()=>{mistakes++;},
    win};
  MINIGAMES[L.type](api,L);
}

function toast(body,text,kind){
  let t=$('.toast',body);
  if(!t){t=el('div','toast');body.appendChild(t);}
  t.className='toast '+(kind||'');
  t.textContent=text;
  requestAnimationFrame(()=>t.classList.add('show'));
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),900);
}

const MINIGAMES={};

MINIGAMES.virus=(api,L)=>{
  const NEED=10; let killed=0, spawns=[];
  api.setObj('Уничтожай вирусы 🦠 — не трогай файлы 📄');
  const update=()=>{api.setProg(killed/NEED*100);api.setCnt(`Вирусов: ${killed}/${NEED}`);};
  update();
  const FILES=['📄','📁','🗂️','📑'];
  function spawn(){
    if(killed>=NEED)return;
    const virus=Math.random()<0.62;
    const it=el('div','vh-item',virus?'🦠':FILES[Math.random()*FILES.length|0]);
    const W=api.body.clientWidth-50, H=api.body.clientHeight-60;
    let x=Math.random()*W, y=Math.random()*H;
    let vx=(Math.random()*2-1)*1.4, vy=(Math.random()*2-1)*1.4;
    it.style.left=x+'px'; it.style.top=y+'px';
    it._move=()=>{x+=vx;y+=vy; if(x<0||x>W)vx*=-1; if(y<0||y>H)vy*=-1;
      it.style.left=Math.max(0,Math.min(W,x))+'px'; it.style.top=Math.max(0,Math.min(H,y))+'px';};
    it.onclick=()=>{
      if(it._dead)return; it._dead=true;
      if(virus){killed++;api.toast('Вирус уничтожен',(killed>=NEED?'good':''));update();
        it.classList.add('vh-pop');setTimeout(()=>it.remove(),300);
        if(killed>=NEED){cleanup();setTimeout(api.win,400);}
      }else{api.toast('Это файл! Осторожнее','bad');it._dead=false;
        it.style.transition='transform .3s';it.style.transform='scale(.7)';
        setTimeout(()=>it.style.transform='',300);}
    };
    api.body.appendChild(it); spawns.push(it);
    setTimeout(()=>{if(!it._dead){it.remove();spawns=spawns.filter(s=>s!==it);}},4200);
  }
  let si=setInterval(spawn,640);
  let raf;const tick=()=>{spawns.forEach(s=>s._move&&s._move());raf=requestAnimationFrame(tick);};tick();
  for(let i=0;i<4;i++)spawn();
  function cleanup(){clearInterval(si);cancelAnimationFrame(raf);spawns.forEach(s=>s.remove());}
  api.body._cleanup=cleanup;
};

MINIGAMES.match=(api,L)=>{
  api.setObj('Сначала запомни карточки, пока они открыты');
  const PAIRS=[
    ['print()','вывод на экран'],
    ['if … else','выбор по условию'],
    ['for','цикл — повторение'],
    ['x = 5','переменная'],
    ['function','функция'],
    ['return','вернуть результат'],
  ];

  let cards=[];
  PAIRS.forEach((p,i)=>{ cards.push({pid:i,kind:'cmd',text:p[0]}); cards.push({pid:i,kind:'desc',text:p[1]}); });
  cards.sort(()=>Math.random()-.5);
  let matched=0, open=[], lock=true;
  const area=el('div','mem-area'); api.body.appendChild(area);
  const head=el('div','logic-step','ЗАПОМНИ РАСПОЛОЖЕНИЕ КАРТОЧЕК'); area.appendChild(head);
  const grid=el('div','mem-grid'); area.appendChild(grid);
  const hintEl=el('div','hint','Карточки скоро перевернутся — постарайся запомнить, где какая'); area.appendChild(hintEl);
  const elems=[];
  cards.forEach((c)=>{
    const card=el('div','mem-card'+(c.kind==='cmd'?' cmd':'')+' open', c.text);
    card._c=c; card._open=true;
    card.onclick=()=>flip(card);
    grid.appendChild(card); elems.push(card);
  });
  let t=30;
  api.setProg(0); api.setCnt(`Запоминание: ${t} с`);
  const timer=setInterval(()=>{
    t--; api.setCnt(`Запоминание: ${t} с`);
    if(t<=0){ clearInterval(timer); startPlay(); }
  },1000);
  api.body._cleanup=()=>clearInterval(timer);
  function startPlay(){
    elems.forEach(card=>{ card.classList.remove('open'); card._open=false; card.innerHTML='&lt;/&gt;'; });
    lock=false;
    head.textContent='СОПОСТАВЬ КОМАНДЫ ПО ПАМЯТИ';
    hintEl.textContent='Найди все 6 пар: команда ↔ что она делает';
    api.setObj('Открывай по две карточки и сопоставляй команду с её действием');
    setProg();
  }
  function setProg(){api.setProg(matched/PAIRS.length*100);api.setCnt(`Пар: ${matched}/${PAIRS.length}`);}
  function flip(card){
    if(lock||card._open||card.classList.contains('done'))return;
    card._open=true; card.classList.add('open'); card.textContent=card._c.text;
    open.push(card);
    if(open.length===2){
      lock=true;
      const [a,b]=open;
      if(a._c.pid===b._c.pid){
        setTimeout(()=>{a.classList.add('done');b.classList.add('done');matched++;setProg();
          api.toast('Пара найдена','good'); open=[]; lock=false;
          if(matched===PAIRS.length) setTimeout(api.win,500);
        },350);
      }else{
        api.toast('Не совпадает','bad');
        a.classList.add('bad');b.classList.add('bad');
        setTimeout(()=>{[a,b].forEach(c=>{c.classList.remove('open','bad');c._open=false;c.innerHTML='&lt;/&gt;';});open=[];lock=false;},750);
      }
    }
  }
};

MINIGAMES.pipe=(api,L)=>{
  api.setObj('Поворачивай трубы, чтобы соединить сервер с базой данных');
  const R=3,C=4, SR=1, TR=1;
  const TYPES=[
    ['c','c','c','c'],
    ['s','c','c','s'],
    ['c','s','c','s'],
  ];
  const BASE={s:['E','W'], c:['N','E']};
  const CW={N:'E',E:'S',S:'W',W:'N'};
  const OPP={N:'S',S:'N',E:'W',W:'E'};
  const DELTA={N:[-1,0],S:[1,0],E:[0,1],W:[0,-1]};
  const tiles=[]; let clicks=0, won=false;
  const area=el('div','pipe-area');
  area.appendChild(el('div','pipe-ends','🖥️ <b>Сервер</b> ▸ ▸ ▸ <b>База данных</b> 🗄️'));
  const grid=el('div','pipe-grid'); grid.style.gridTemplateColumns=`repeat(${C},auto)`;
  function dirsOf(t){ let d=BASE[t.type].slice(); for(let i=0;i<t.rot;i++) d=d.map(x=>CW[x]); return d; }
  for(let r=0;r<R;r++){tiles[r]=[];for(let c=0;c<C;c++){
    const t={type:TYPES[r][c], rot:(Math.random()*4|0), r, c};
    const cell=el('div','pipe-cell');
    cell.onclick=()=>{ if(won)return; t.rot=(t.rot+1)%4; clicks++; drawTile(t); recompute(); };
    t.cell=cell; tiles[r][c]=t; grid.appendChild(cell);
  }}
  function drawTile(t){
    const d=dirsOf(t);
    const pts={N:'32,32 32,2',S:'32,32 32,62',E:'32,32 62,32',W:'32,32 2,32'};
    t.cell.innerHTML=`<svg viewBox="0 0 64 64">${d.map(x=>`<polyline class="seg" points="${pts[x]}"/>`).join('')}<circle class="hub" cx="32" cy="32" r="6"/></svg>`;
  }
  function reachable(){
    const seen=new Set(); if(!dirsOf(tiles[SR][0]).includes('W')) return {set:seen, win:false};
    const stack=[[SR,0]]; let win=false;
    while(stack.length){
      const [r,c]=stack.pop(); const k=r+','+c; if(seen.has(k))continue; seen.add(k);
      const d=dirsOf(tiles[r][c]);
      if(r===TR&&c===C-1&&d.includes('E')) win=true;
      d.forEach(dir=>{const [dr,dc]=DELTA[dir];const nr=r+dr,nc=c+dc;
        if(nr<0||nc<0||nr>=R||nc>=C)return;
        if(dirsOf(tiles[nr][nc]).includes(OPP[dir])) stack.push([nr,nc]);});
    }
    return {set:seen, win};
  }
  function recompute(){
    const {set,win}=reachable();
    tiles.forEach(row=>row.forEach(t=>t.cell.classList.toggle('flow', set.has(t.r+','+t.c))));
    api.setProg(Math.min(100, set.size/6*100)); api.setCnt(`Поворотов: ${clicks}`);
    if(win && !won){ won=true; api.toast('Поток пошёл! Данные дошли до базы','good');
      const stars = clicks<=12?3 : clicks<=20?2 : 1; setTimeout(()=>api.win(stars),750); }
  }
  for(let r=0;r<R;r++)for(let c=0;c<C;c++)drawTile(tiles[r][c]);
  if(reachable().win){ tiles[SR][0].rot=(tiles[SR][0].rot+1)%4; drawTile(tiles[SR][0]); }
  area.appendChild(grid);
  area.appendChild(el('div','hint','Клик по трубе — поворот на 90°. Соедини левый вход с правым выходом.'));
  api.body.appendChild(area);
  recompute();
};

MINIGAMES.route=(api,L)=>{
  api.setObj('Соедини каждый запрос студента с нужной службой');
  const PAIRS=[
    {q:'🔑 Сбросить пароль от кабинета', s:'IT-поддержка', k:'it'},
    {q:'📅 Где посмотреть расписание?',   s:'Учебный отдел', k:'study'},
    {q:'📄 Заказать справку об обучении', s:'Деканат', k:'dean'},
    {q:'📚 Найти нужный учебник',         s:'Библиотека', k:'lib'},
  ];
  const SERVICES=[];
  PAIRS.forEach(p=>{ if(!SERVICES.find(s=>s.k===p.k)) SERVICES.push({s:p.s,k:p.k}); });
  const reqs=PAIRS.slice().sort(()=>Math.random()-.5);
  const servs=SERVICES.slice().sort(()=>Math.random()-.5);
  let done=0, sel=null; const need=PAIRS.length;
  const area=el('div','route-area');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('class','route-svg');
  const colL=el('div','route-col left'), colR=el('div','route-col right');
  area.appendChild(svg); area.appendChild(colL); area.appendChild(colR);
  api.body.appendChild(area);
  reqs.forEach(p=>{ const it=el('div','route-item',`<span class="cd">${p.q}</span>`); it._k=p.k; it._role='q';
    it.style.setProperty('--ac',L.ac); it.style.setProperty('--gl',L.ac+'66');
    it.onclick=()=>pick(it); colL.appendChild(it); });
  servs.forEach(s=>{ const it=el('div','route-item',`<span class="ic">🏢</span><span class="cd">${s.s}</span>`); it._k=s.k; it._role='s';
    it.style.setProperty('--ac',L.ac); it.style.setProperty('--gl',L.ac+'66');
    it.onclick=()=>pick(it); colR.appendChild(it); });
  function center(node){const r=node.getBoundingClientRect(),b=area.getBoundingClientRect();
    return {x:r.left-b.left+(node._role==='q'?r.width:0),y:r.top-b.top+r.height/2};}
  function pick(it){
    if(it.classList.contains('linked'))return;
    if(it._role==='q'){ if(sel)sel.classList.remove('sel'); sel=it; it.classList.add('sel'); return; }
    if(!sel){ api.toast('Сначала выбери запрос слева','bad'); return; }
    if(sel._k===it._k){
      const a=center(sel),b=center(it);
      const ln=document.createElementNS('http://www.w3.org/2000/svg','line');
      ln.setAttribute('x1',a.x);ln.setAttribute('y1',a.y);ln.setAttribute('x2',b.x);ln.setAttribute('y2',b.y);
      ln.setAttribute('stroke',L.ac);ln.setAttribute('stroke-width','3');ln.setAttribute('stroke-linecap','round');
      ln.style.filter='drop-shadow(0 0 5px '+L.ac+')';
      svg.appendChild(ln);
      sel.classList.add('linked');sel.classList.remove('sel');it.classList.add('linked');sel=null;
      done++; api.setProg(done/need*100); api.setCnt(`Соединено: ${done}/${need}`);
      api.toast('Запрос направлен верно','good');
      if(done===need){ api.toast('Все обращения идут по адресу!','good'); setTimeout(api.win,600); }
    }else{
      api.toast('Не та служба для этого запроса','bad');
      sel.classList.remove('sel'); sel=null;
    }
  }
  api.setProg(0); api.setCnt(`Соединено: 0/${need}`);
};

MINIGAMES.budget=(api,L)=>{
  api.setObj('Распредели бюджет так, чтобы достичь целей по пользователям и прибыли');
  const BUDGET=100, GOAL_U=95, GOAL_P=170;
  let dev=20, mkt=20, srv=20;
  const area=el('div','budget-area'); api.body.appendChild(area);
  area.appendChild(el('div','logic-step',`БЮДЖЕТ ${BUDGET} · ЦЕЛЬ: 👥 ${GOAL_U}+ · 💰 ${GOAL_P}+`));
  const grid=el('div','budget-grid');
  const sliders=el('div','sliders'), meters=el('div','meters');
  grid.appendChild(sliders); grid.appendChild(meters);
  function mkSlider(label,color,get,set){
    const s=el('div','slider'); s.style.setProperty('--ac',color);
    s.innerHTML=`<div class="row1"><span>${label}</span><b class="val">${get()}</b></div>`;
    const inp=el('input'); inp.type='range'; inp.min=0; inp.max=100; inp.value=get();
    inp.oninput=()=>{ set(+inp.value); refresh(); };
    s.appendChild(inp); s._val=$('.val',s); return s;
  }
  const sDev=mkSlider('💻 Разработка','#2ee5ff',()=>dev,v=>dev=v);
  const sMkt=mkSlider('📣 Маркетинг','#ffd14a',()=>mkt,v=>mkt=v);
  const sSrv=mkSlider('🖥️ Серверы','#7CFFB2',()=>srv,v=>srv=v);
  sliders.appendChild(sDev);sliders.appendChild(sMkt);sliders.appendChild(sSrv);
  function meter(label){
    const m=el('div','meter');
    m.innerHTML=`<div class="ml"><span>${label}</span><b class="mv">0</b></div>
      <div class="bar"><i></i><span class="goal" style="left:100%"></span></div>`;
    m._i=$('.bar>i',m); m._v=$('.mv',m); return m;
  }
  const mU=meter('👥 Пользователи'), mP=meter('💰 Прибыль');
  meters.appendChild(mU);meters.appendChild(mP);
  const flowEl=el('div','budget-flow','');
  const spentEl=el('div','budget-spent','');
  const foot=el('div','budget-foot');
  const launch=el('button','btn','🚀 Запустить проект'); foot.appendChild(launch);
  function model(){
    const demand=2*mkt+dev;
    const capacity=3*srv;
    const users=Math.min(demand,capacity);
    const profit=Math.round(users*2 - Math.abs(demand-capacity)*0.3);
    return {demand,capacity,users,profit,spent:dev+mkt+srv};
  }
  function refresh(){
    const {demand,capacity,users,profit,spent}=model();
    sDev._val.textContent=dev; sMkt._val.textContent=mkt; sSrv._val.textContent=srv;
    mU._v.textContent=users; mU._i.style.width=Math.min(100,users/GOAL_U*100)+'%'; mU.classList.toggle('ok',users>=GOAL_U);
    mP._v.textContent=profit; mP._i.style.width=Math.min(100,Math.max(0,profit)/GOAL_P*100)+'%'; mP.classList.toggle('ok',profit>=GOAL_P);
    const bottleneck = demand<capacity ? 'спрос' : (capacity<demand ? 'ёмкость' : 'баланс');
    flowEl.innerHTML=`Спрос: <b>${demand}</b> · Ёмкость: <b>${capacity}</b> · Узкое место: <span class="lo">${bottleneck}</span>`;
    spentEl.textContent=`Потрачено: ${spent} / ${BUDGET}`+(spent>BUDGET?' — превышен бюджет!':'');
    spentEl.className='budget-spent'+(spent>BUDGET?' over':'');
    api.setCnt(`👥 ${users}/${GOAL_U} · 💰 ${profit}/${GOAL_P}`);
    api.setProg(Math.min(100,(Math.min(users,GOAL_U)/GOAL_U+Math.min(Math.max(profit,0),GOAL_P)/GOAL_P)/2*100));
  }
  launch.onclick=()=>{
    const {users,profit,spent}=model();
    if(spent>BUDGET){ api.toast('Превышен бюджет — уменьши вложения','bad'); return; }
    if(users>=GOAL_U && profit>=GOAL_P){ api.toast('Цели достигнуты! Проект взлетел','good'); setTimeout(api.win,650); }
    else api.toast('Цели не достигнуты: '+(users<GOAL_U?'мало пользователей':'низкая прибыль'),'bad');
  };
  area.appendChild(grid); area.appendChild(flowEl); area.appendChild(spentEl); area.appendChild(foot);
  refresh();
};

MINIGAMES.maze=(api,L)=>{
  api.setObj('Доведи робота 🤖 до посылки 📦 по свободным клеткам');
  const MAP=[
    "S0010000",
    "01010110",
    "00010000",
    "01110111",
    "00000010",
    "01011010",
    "01010000",
    "0000011G",
  ];
  const R=MAP.length, C=MAP[0].length;
  let rx,ry,gx,gy;
  const grid=el('div','maze'); grid.style.gridTemplateColumns=`repeat(${C},auto)`;
  const cells=[];
  for(let y=0;y<R;y++){cells[y]=[];for(let x=0;x<C;x++){
    const ch=MAP[y][x]; const cell=el('div','cell');
    if(ch==='1')cell.classList.add('wall');
    if(ch==='S'){rx=x;ry=y;}
    if(ch==='G'){gx=x;gy=y;cell.classList.add('goal');cell.textContent='📦';}
    cells[y][x]=cell; grid.appendChild(cell);
  }}
  const area=el('div','maze-area');
  area.appendChild(grid);
  const pad=el('div','pad');
  const mkb=(t,dx,dy,cls)=>{const b=el('button','btn'+(cls||''),t);if(t)b.onclick=()=>move(dx,dy);return b;};
  pad.appendChild(mkb('',0,0,' sp'));pad.appendChild(mkb('▲',0,-1));pad.appendChild(mkb('',0,0,' sp'));
  pad.appendChild(mkb('◀',-1,0));pad.appendChild(mkb('▼',0,1));pad.appendChild(mkb('▶',1,0));
  area.appendChild(pad);
  api.body.appendChild(area);
  let steps=0;
  function draw(){cells[ry][rx].classList.remove('goal');
    cells.forEach((row,y)=>row.forEach((c,x)=>{c.classList.remove('robot');
      if(x===gx&&y===gy)c.textContent='📦';}));
    cells[ry][rx].classList.add('robot');cells[ry][rx].textContent='🤖';}
  function move(dx,dy){
    const nx=rx+dx,ny=ry+dy;
    if(nx<0||ny<0||nx>=C||ny>=R)return;
    if(MAP[ny][nx]==='1'){api.toast('Стена!','bad');return;}
    cells[ry][rx].textContent=''; rx=nx;ry=ny;steps++;draw();
    api.setCnt(`Шагов: ${steps}`);api.setProg(Math.max(0,100-(Math.abs(gx-rx)+Math.abs(gy-ry))/14*100));
    if(rx===gx&&ry===gy){api.toast('Посылка доставлена!','good');setTimeout(api.win,400);}
  }
  const onKey=(e)=>{const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];
    if(m){e.preventDefault();move(m[0],m[1]);}};
  document.addEventListener('keydown',onKey);
  api.body._cleanup=()=>document.removeEventListener('keydown',onKey);
  draw();api.setCnt('Шагов: 0');api.setProg(0);
};

MINIGAMES.binary=(api,L)=>{
  api.setObj('Считай по степеням двойки: включи биты 2ⁿ так, чтобы их сумма дала число');
  const WEIGHTS=[128,64,32,16,8,4,2,1];
  const EXP=['2⁷','2⁶','2⁵','2⁴','2³','2²','2¹','2⁰'];
  const NUMS=[13,50,105,200];
  const optimal=NUMS.reduce((s,n)=>s+n.toString(2).split('').filter(b=>b==='1').length,0);
  let qi=0, totalToggles=0, locked=false;
  const area=el('div','bin-area'); api.body.appendChild(area);
  let bitsOn, sumEl, strEl;
  function build(){
    area.innerHTML=''; locked=false; bitsOn=new Array(8).fill(false);
    api.setProg(qi/NUMS.length*100); api.setCnt(`Число ${qi+1}/${NUMS.length}`);
    area.appendChild(el('div','bin-target',`Собери число: <b>${NUMS[qi]}</b>`));
    const bits=el('div','bits');
    WEIGHTS.forEach((w,i)=>{
      const b=el('div','bit',`<div class="w">${EXP[i]}</div><div class="lamp"></div><div class="v">0</div>`);
      b.onclick=()=>{ if(locked)return; bitsOn[i]=!bitsOn[i]; totalToggles++;
        b.classList.toggle('on',bitsOn[i]); $('.v',b).textContent=bitsOn[i]?'1':'0'; refresh(); };
      bits.appendChild(b);
    });
    area.appendChild(bits);
    strEl=el('div','bin-str','00000000'); area.appendChild(strEl);
    sumEl=el('div','bin-sum',''); area.appendChild(sumEl);
    refresh();
  }
  function refresh(){
    const sum=WEIGHTS.reduce((s,w,i)=>s+(bitsOn[i]?w:0),0);
    strEl.textContent=bitsOn.map(b=>b?'1':'0').join('');
    const match=sum===NUMS[qi];
    sumEl.className='bin-sum'+(match?' match':''); sumEl.innerHTML=`Сумма: <b>${sum}</b> / ${NUMS[qi]}`;
    if(match){ locked=true;
      api.toast(`Верно: ${NUMS[qi]} = ${strEl.textContent}`,'good');
      qi++; api.setProg(qi/NUMS.length*100);
      if(qi>=NUMS.length){ const extra=totalToggles-optimal;
        const stars=extra<=3?3:extra<=8?2:1; setTimeout(()=>api.win(stars),800); }
      else setTimeout(build,850);
    }
  }
  build();
};

function recommendedLabs(){
  const done = LABS.filter(L=>(scores[L.id]||0)>0);
  if(!done.length) return [];
  return done.slice().sort((a,b)=>scores[b.id]-scores[a.id]).slice(0,3);
}
function recommendBlock(){
  const rec = recommendedLabs();
  const wrap = el('div');
  wrap.style.cssText='width:100%;max-width:620px;margin:4px auto 0;padding:16px 18px;border:1px solid var(--lime);border-radius:12px;background:rgba(124,255,178,.07);text-align:left';
  if(rec.length){
    const t=el('div',null,`🎯 <b style="color:var(--lime)">Рекомендуем тебе</b> — направления, где ты показал лучший результат:`);
    t.style.cssText='color:var(--ink);font-size:14px;margin-bottom:12px;line-height:1.5';
    wrap.appendChild(t);
    rec.forEach(L=>{
      const r=el('div');
      r.style.cssText='display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 0;border-top:1px solid rgba(255,255,255,.08)';
      const info=el('div',null,`<span style="font-size:20px">${L.icon}</span> <b>${L.name}</b> <span style="color:var(--yellow);letter-spacing:2px">${'★'.repeat(scores[L.id])}</span>`);
      info.style.cssText='flex:1;min-width:200px;color:var(--ink);font-size:14px';
      r.appendChild(info);
      if(L.link){
        const a=document.createElement('a');
        a.className='btn ghost'; a.href=L.link; a.target='_blank'; a.rel='noopener noreferrer';
        a.style.cssText='text-decoration:none;padding:8px 14px;font-size:12px';
        a.textContent='🔗 Узнать о направлении';
        r.appendChild(a);
      }
      wrap.appendChild(r);
    });
  } else {
    const t=el('div',null,'Ты ещё не прошёл ни одного направления. Выполни хотя бы одно задание, чтобы получить персональную рекомендацию!');
    t.style.cssText='color:var(--lime);font-size:14px;line-height:1.5';
    wrap.appendChild(t);
  }
  return wrap;
}
function statsBlock(){
  const box=el('div');
  box.style.cssText='width:100%;max-width:620px;margin:0 auto;display:flex;flex-direction:column;gap:14px';
  const doneCount=LABS.filter(L=>(scores[L.id]||0)>0).length;
  const totalStars=Object.values(scores).reduce((s,v)=>s+v,0);
  const head=el('div',null,`Пройдено направлений: <b>${doneCount}</b> из 7 &nbsp;·&nbsp; звёзд: <b>${totalStars}</b> из 21 &nbsp;·&nbsp; очков: <b>${totalScore()}</b>`);
  head.style.cssText='color:var(--ink);font-size:14px;text-align:center;letter-spacing:.5px';
  box.appendChild(head);
  const list=el('div');
  list.style.cssText='display:flex;flex-direction:column;gap:8px';
  LABS.forEach(L=>{
    const st=scores[L.id]||0;
    const row=el('div');
    row.style.cssText=`display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:1px solid ${st?L.ac+'88':'rgba(255,255,255,.08)'};background:${st?L.ac+'14':'rgba(255,255,255,.02)'}`;
    const stars = st ? `<span style="color:var(--yellow);letter-spacing:2px">${'★'.repeat(st)}${'☆'.repeat(3-st)}</span>`
                     : `<span style="color:var(--dim);font-size:12px;letter-spacing:1px">не пройдено</span>`;
    row.innerHTML=`<span style="font-size:22px">${L.icon}</span><span style="flex:1;color:var(--ink);font-size:13px">${L.name}</span>${stars}`;
    list.appendChild(row);
  });
  box.appendChild(list);
  box.appendChild(recommendBlock());
  return box;
}
function results(opts){
  opts=opts||{};
  const scr=frame();
  const f=el('div','fin');
  f.style.justifyContent='flex-start';
  f.appendChild(el('div','glitch','ИТОГИ'));
  f.appendChild(el('div','subtitle', opts.early ? 'Игра завершена' : 'Статистика прохождения'));
  f.appendChild(statsBlock());
  const btns=el('div');
  btns.style.cssText='display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:6px 0 4px';
  if(opts.early){
    const back=el('button','btn ghost','← Вернуться в холл');
    back.onclick=()=>hub();
    btns.appendChild(back);
  }
  const again=el('button','btn','↺ Играть снова');
  again.onclick=()=>{collected.clear();clearScores();saveProgress();titleScreen();};
  btns.appendChild(again);
  f.appendChild(btns);
  scr.appendChild(f);
}

function finale(){
  const scr=frame();
  runDialog(scr,D.finale,{art:'🖥️',bg:IMG_FINALE_BG,onDone:()=>{
    const scr2=frame();
    const f=el('div','fin');
    f.appendChild(el('div','core','⚙️'));
    const status=el('div','tagline','Загораются экраны… Открываются лаборатории… Включаются демонстрационные стенды…');
    f.appendChild(status);
    const b=el('button','btn','▸ Продолжить'); b.style.opacity='0';b.style.transition='.5s';
    b.onclick=()=>finaleEnd();
    f.appendChild(b);
    scr2.appendChild(f);
    confetti(scr2);
    setTimeout(()=>{status.textContent='✅ Система факультета снова работает!';status.style.color='var(--lime)';b.style.opacity='1';},2600);
  }});
}
function finaleEnd(){
  const scr=frame();
  runDialog(scr,D.finale2,{art:'🎓',label:'День открытых дверей спасён',bg:IMG_FINALE_BG,onDone:()=>{
    const scr2=frame();
    const c=el('div','center');
    c.style.justifyContent='flex-start';
    c.style.overflow='auto';
    c.style.paddingTop='28px';
    c.style.paddingBottom='28px';
    c.appendChild(el('div','glitch','КОНЕЦ'));
    c.appendChild(el('div','subtitle','Все семь направлений КТиИБ восстановлены'));
    const grand=el('div',null);
    grand.style.cssText='display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:6px 0';
    LABS.forEach(L=>{ const st=scores[L.id]||0;
      const it=el('div',null,frogSVG(L.ac,46)+`<div style="font-size:12px;color:var(--yellow);letter-spacing:1px">${'★'.repeat(st)||'—'}</div>`);
      it.style.textAlign='center'; it.title=L.name; grand.appendChild(it);
    });
    c.appendChild(grand);
    const stars=Object.values(scores).reduce((s,v)=>s+v,0);
    c.appendChild(el('div','subtitle',`Собрано жаб: 7 · звёзд: ${stars} из 21 · очков: ${totalScore()}`));
    c.appendChild(el('div','tagline','🔒 ИБ · 💻 Разработка · 🌐 Системы · 📱 Автоматизация · 🤖 Алгоритмы · 🧠 Вычисления · 📊 Управление'));
    c.appendChild(recommendBlock());
    const b=el('button','btn','↺ Играть снова');
    b.onclick=()=>{collected.clear();clearScores();saveProgress();titleScreen();};
    c.appendChild(b);
    scr2.appendChild(c);
    confetti(scr2);
  }});
}
function confetti(scr){
  const cols=['#2ee5ff','#7CFFB2','#ffd14a','#ff49a3','#b07cff','#ff8a3d'];
  for(let i=0;i<60;i++){
    const p=el('div','confetti'); p.style.left=Math.random()*100+'%';
    p.style.background=cols[i%cols.length];
    p.style.animationDuration=(2+Math.random()*2.5)+'s';
    p.style.animationDelay=(Math.random()*1.5)+'s';
    p.style.transform=`rotate(${Math.random()*360}deg)`;
    scr.appendChild(p);
  }
}

(function boot(){
  try{ currentUser = localStorage.getItem(SESSION_KEY) || null; }catch(e){ currentUser=null; }
  if(currentUser){
    const db=loadDB();
    if(db[currentUser]) loadProgress();
    else currentUser=null;
  }
  if(currentUser) titleScreen(); else authScreen();
})();
