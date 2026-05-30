# Ctrl-C
# Выбери своё будущее
Все экраны сразу в HTML, видим только один — у кого есть класс `active`:

```css
.page        { display: none;  }
.page.active { display: block; }
```

```javascript
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
```

Экраны: `p-main` → `p-auth` → `p-doors` → `p-dir` → `modal-bg` (игра) → `result-screen`.

При загрузке — если сессия уже была, сразу в игру:
```javascript
try { users = JSON.parse(localStorage.getItem('vsb_u') || '{}'); } catch(e) {}
try { cur   = JSON.parse(localStorage.getItem('vsb_c') || 'null'); } catch(e) {}
if (cur) enterGame();
```

---

Хранение данных
Всё в `localStorage`, сервер не нужен:

```javascript
// vsb_u — все аккаунты
{
  'user@mail.ru': {
    name: 'Анна',
    pass: 'пароль',
    score: 150,
    progress: {
      '0_0': { stars: 3, medal: '🥇' },  // dirId_gameIdx
      '1_2': { stars: 2, medal: '🥈' },
    }
  }
}

// vsb_c — текущая сессия
{ name: 'Анна', email: 'user@mail.ru', score: 150 }
```

```javascript
const saveU = () => localStorage.setItem('vsb_u', JSON.stringify(users));
const saveC = () => localStorage.setItem('vsb_c', JSON.stringify(cur));
```

---

Регистрация

```javascript
function doReg() {
  const name  = document.getElementById('r-name').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const pass  = document.getElementById('r-pass').value;
  const err   = document.getElementById('r-err');

  if (!name || !email || !pass)
    return err.textContent = 'Заполните все поля';

  if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email))
    return err.textContent = 'Введите корректный email';

  const fakeDomains = ['test.com','example.com','example.ru','fake.com','mailinator.com'];
  if (fakeDomains.includes(email.split('@')[1].toLowerCase()))
    return err.textContent = 'Укажите настоящий email';

  if (pass.length < 6)
    return err.textContent = 'Пароль — минимум 6 символов';

  if (users[email])
    return err.textContent = 'Email уже зарегистрирован';

  users[email] = { name, pass, progress: {}, score: 0 };
  cur = { name, email, score: 0 };
  saveU(); saveC();
  enterGame();
}
```

Вход проще — просто проверяем есть ли такой email и совпадает ли пароль:

```javascript
function doLog() {
  if (!users[email] || users[email].pass !== pass)
    return err.textContent = 'Неверный email или пароль';
  cur = { name: users[email].name, email, score: users[email].score || 0 };
  saveC();
  enterGame();
}
```

Данные направлений

Все 7 направлений в массиве `DIRS`. У каждого — название, описание и 3 игры:

```javascript
const DIRS = [
  {
    id: 0, icon: '🖥️',
    name:  'Информационные системы и технологии',
    code:  '09.03.02',
    about: 'Представь: ты архитектор цифрового мира...',
    games: [
      { name: 'Соедини систему',     type: 'connect_system' },
      { name: 'Почини интерфейс',    type: 'fix_interface'  },
      { name: 'Найди ошибку в логе', type: 'find_error'     },
    ]
  },
  // ... ещё 6
];
```

`renderDoors()` по этому массиву строит карточки и показывает звёзды прогресса:

```javascript
function renderDoors() {
  document.getElementById('doors-grid').innerHTML = DIRS.map(d => {
    const total = d.games.reduce((s,_,i) => s + getProg(d.id,i).stars, 0);
    const done  = d.games.filter((_,i) => getProg(d.id,i).stars > 0).length;
    const stars = [0,1,2].map(i =>
      `<span style="opacity:${total > i*3 ? 1 : .2}">⭐</span>`
    ).join('');
    return `<div class="door-card" onclick="openDir(${d.id})">
      <div class="d-icon">${d.icon}</div>
      <div class="d-name">${d.name}</div>
      <div class="d-code">${d.code}</div>
      <div class="d-stars">${stars}</div>
      <div class="d-progress">${done} из ${d.games.length} заданий пройдено</div>
    </div>`;
  }).join('');
}
```
 Запуск игры и результат

```javascript
function startGame(d, g) {
  curDir = d; curGame = g; attempts = 0;
  document.getElementById('modal-ttl').textContent = DIRS[d].games[g].name;
  renderGame(d, g, document.getElementById('modal-body'));
  document.getElementById('modal-bg').style.display = 'flex';
}
```

`renderGame()` — роутер, вызывает нужную функцию по полю `type`:

```javascript
function renderGame(d, g, body) {
  const map = {
    connect_system: gameConnectSystem, fix_interface:  gameFixInterface,
    find_error:     gameFindError,     automate_office:gameAutomateOffice,
    build_shop:     gameBuildShop,     handle_tickets: gameHandleTickets,
    robot_maze:     gameRobotMaze,     sequence:       gameSequence,
    optimal_path:   gameOptimalPath,   binary:         gameBinary,
    logic_gate:     gameLogicGate,     flowchart:      gameFlowchart,
    startup:        gameStartup,       project_mgmt:   gameProjectMgmt,
    analytics:      gameAnalytics,     debug:          gameDebug,
    build_program:  gameBuildProgram,  code_runner:    gameCodeRunner,
    phishing:       gamePhishing,      password:       gamePassword,
    find_virus:     gameFindVirus,
  };
  map[DIRS[d].games[g].type]?.(body);
}
```

При завершении — `showResult()`. Прогресс сохраняется только при победе:

```javascript
function showResult(win, stars, msg) {
  closeModal();
  const emoji = win ? ['🎉','🥈','🥇'][Math.min(stars-1,2)] : '😔';
  document.getElementById('r-emoji').textContent  = emoji;
  document.getElementById('r-title').className    = 'r-title ' + (win ? 'win' : 'lose');
  document.getElementById('r-title').textContent  = win ? 'Отлично!' : 'Не получилось';
  document.getElementById('r-stars').textContent  = win
    ? '⭐'.repeat(stars) + '☆'.repeat(3-stars) : '☆☆☆';
  document.getElementById('r-msg').textContent    = msg;
  document.getElementById('r-retry').style.display = win ? 'none' : 'inline-block';
  if (win) setProg(curDir, curGame, stars);
  document.getElementById('result-screen').style.display = 'flex';
}
```

---

Прогресс и награды

Счёт только растёт — если прошёл повторно хуже, ничего не меняется:

```javascript
function setProg(dirId, gameIdx, newStars) {
  const key  = dirId + '_' + gameIdx;
  const prev = users[cur.email].progress[key] || { stars: 0 };

  if (newStars <= prev.stars) return;  // хуже чем раньше — пропускаем

  users[cur.email].score   += (newStars - prev.stars) * 10;
  users[cur.email].progress[key] = {
    stars: newStars,
    medal: newStars === 3 ? '🥇' : newStars === 2 ? '🥈' : '🥉'
  };
  cur.score = users[cur.email].score;
  saveU(); saveC(); updateScore();
}
```

Мини-игры

Всего 21 игра, 8 типов механик.

Выбор из вариантов — общая функция `mcq()`, используется в 13 играх:

```javascript
function mcq(body, questions, onDone) {
  let idx = 0, errors = 0;
  const show = () => {
    if (idx >= questions.length) { onDone(errors); return; }
    const q = questions[idx];
    body.innerHTML = `
      <div class="task-text">${q.q}</div>
      ${attemptsHtml()}
      <div class="options">
        ${shuffle(q.opts).map(o =>
          `<button class="opt" onclick="pickMCQ(this,'${o}','${q.ans}')">${o}</button>`
        ).join('')}
      </div>`;
    window.pickMCQ = (btn, val, ans) => {
      document.querySelectorAll('.opt').forEach(b => b.disabled = true);
      if (val === ans) { btn.classList.add('correct'); idx++; setTimeout(show, 650); }
      else {
        btn.classList.add('wrong'); errors++; attempts++;
        if (attempts >= 3) setTimeout(() => showResult(false, 0, 'Попробуй ещё раз!'), 400);
        else setTimeout(show, 650);
      }
    };
  };
  show();
}
```
Drag & Drop — перетаскивание с проверкой по кнопке:

```javascript
function drag(e)     { e.dataTransfer.setData('text', e.target.dataset.id); }
function allowDrop(e){ e.preventDefault(); }

// сброс в слот — запоминаем, не проверяем сразу
window.dropCS = (e, slotId) => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text');
  Object.keys(placed).forEach(k => { if (placed[k] === id) delete placed[k]; });
  placed[slotId] = id;
  render();
};

// проверка только по кнопке
window.checkCS = () => {
  const ok = Object.keys(correctMap).every(k => placed[k] === correctMap[k]);
  if (ok) showResult(true, attempts === 0 ? 3 : attempts <= 1 ? 2 : 1, 'Правильно!');
  else { attempts++; document.getElementById('cs-err').textContent = 'Не совсем верно!'; }
};
```

Лабиринт — матрица 5×5, 0=путь, 1=стена, 2=выход:

```javascript
window.moveR = (dr, dc) => {
  const [nr, nc] = [rr+dr, rc+dc];
  if (nr<0||nr>=5||nc<0||nc>=5||maze[nr][nc]===1) return;
  rr=nr; rc=nc; moves++;
  if (maze[rr][rc]===2)
    return showResult(true, moves<=8?3:moves<=10?2:1, `Дошёл за ${moves} ходов!`);
  if (moves>=12)
    return showResult(false, 0, 'Ходы закончились!');
  render();
};
```
Сортировка блоков — стрелками меняем соседние элементы:

```javascript
window.mvFC = (i, dir) => {
  [order[i], order[i+dir]] = [order[i+dir], order[i]];
  render();
};
window.checkFC = () => {
  if (order.every((v,i) => v === correct[i])) showResult(true, 3, 'Верно!');
  else { attempts++; if (attempts>=3) showResult(false,0,'Попробуй ещё раз!'); }
};
```
Логические ворота — функция ворота как параметр:

```javascript
// AND: (a,b) => a&&b   OR: (a,b) => a||b
window.togG = which => {
  if (which==='a') aV=!aV; else bV=!bV;
  document.getElementById('lamp-ui').textContent = t.fn(aV,bV) ? '💡' : '⚫';
};
```
Ритм-игра — нажать нужную кнопку за 3 секунды:

```javascript
const nextCmd = () => {
  clearTimeout(timer);
  timer = setTimeout(() => { errors++; idx++; errors>=3
    ? showResult(false,0,'Слишком медленно!') : nextCmd(); }, 3000);
  document.getElementById('cr-d').textContent = seq[idx].c;
};
window.pressR = cmd => {
  clearTimeout(timer);
  if (cmd===seq[idx].c) score++; else if(++errors>=3)
    return showResult(false,0,'Много ошибок!');
  ++idx >= seq.length ? showResult(true,score>=4?3:score>=3?2:1,'Готово!') : nextCmd();
};
```
Пароль — проверяем 4 критерия, победа когда все выполнены:

```javascript
const check = () => {
  const s = [/[A-Z]/,/[0-9]/,/[!@#$%]/].filter(r=>r.test(pwd)).length
          + (pwd.length>=8 ? 1 : 0);
  if (s>=4) showResult(true, 3, 'Надёжный пароль создан!');
};
```
Вспомогательные функции

```javascript
// перемешать массив (копию)
const shuffle = a => [...a].sort(() => Math.random() - .5);

// три точки-попытки
function attemptsHtml() {
  return `<div class="attempts">Попытки: ${
    [0,1,2].map(i=>`<span class="attempt-dot${i<attempts?' used':''}"></span>`).join('')
  }</div>`;
}

// обновить счёт в навигации
const updateScore = () => {
  const s = (users[cur?.email]||{}).score||0;
  document.getElementById('score-val').textContent = s;
  document.getElementById('dir-score-val').textContent = s;
};
```
