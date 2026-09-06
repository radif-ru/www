/* Анимация фона: нейросеть из узлов + дрейфующие токены кода/ИИ.
   Оптимизирована под энергосбережение, чтобы браузер (например, Яндекс.Браузер
   в режиме экономии заряда) не счёл её «слишком тяжёлой» и не отключил:
   - линии-связи рисуются батчем по «корзинам» прозрачности (тысячи отдельных
     stroke → несколько draw-call за кадр, без сборки строки rgba() на каждую линию);
   - все точки заливаются одним путём за один вызов;
   - при низком заряде батареи ИЛИ prefers-reduced-motion включается облегчённый,
     спокойный режим (меньше узлов и ниже скорость, кап 30 FPS) — анимация
     продолжает жить, а не замирает; РЕЗКОСТЬ картинки (DPR) при этом сохраняется,
     чтобы при низком заряде изображение не было размытым;
   - ВАЖНО: мобильное энергосбережение (в т.ч. Яндекс.Браузер) принудительно включает
     prefers-reduced-motion и так «гасит» анимации страницы. Поэтому этот флаг НЕ
     останавливает анимацию — он лишь переводит её в спокойный режим;
   - watchdog перезапускает rAF, если кадры перестали приходить. */
(() => {
  "use strict";
  const canvas = document.getElementById("bg");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const mqReduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  let prefersReduced = mqReduce ? mqReduce.matches : false; // вкл. энергосбережением ИЛИ настройкой доступности
  let batteryLow = false; // низкий заряд по Battery API
  let W = 0, H = 0, dpr = 1, raf = 0, nodes = [], tokens = [], lastW = 0, lastH = 0, resizeTimer = 0, lastT = 0, lastDraw = 0;
  const pointer = { x: -9999, y: -9999 };
  let lowPower = false; // спокойный облегчённый режим (низкий заряд ИЛИ reduced-motion)
  let speedScale = 1;   // множитель скорости движения (в спокойном режиме < 1)
  let dprCap = 2;       // потолок DPR: держим 2 даже в спокойном режиме ради резкости
  // Линии-связи сети: LINK — макс. расстояние соединения узлов (больше = длиннее линий).
  // Толщина линий — ctx.lineWidth во frame(); цвет/прозрачность — bucketColor.
  let LINK = 150, LINK2 = LINK * LINK;
  let fpsInterval = 0; // 0 = без капа FPS; в lowPower = 1000/30
  // Корзины прозрачности линий для батчинга: ближе узлы — ярче (макс. 0.5).
  const BUCKETS = 5, bucketSeg = [], bucketColor = [];
  for (let bi = 0; bi < BUCKETS; bi++) { bucketSeg.push([]); bucketColor.push(`rgba(70,190,210,${(((bi + 1) / BUCKETS) * 0.5).toFixed(3)})`); }
  // Словарь летящих токенов: код, ИИ/ML, данные, инфраструктура, немного математики.
  // Набор намеренно большой, а слово берётся из перемешанной колоды (nextWord) — за
  // сессию видно весь словарь, а не одну и ту же горстку слов.
  const WORDS = ["def","async","await","class","{ }","</>","AI","LLM","token","model","RAG","agent",
    "prompt","vector","fn()","git","SQL","==>","λ","0x1F","npm","docker","yield","return","import",
    "GPT","embed","tensor","->","::","neural","fastapi","redis","k8s","[ ]","self",
    "Ollama","MCP","LoRA","epoch","loss","∇","softmax","attn","context","chunk","top-k","cosine",
    "numpy","torch","pandas","pytest","assert","commit","rebase","merge","diff","CI/CD","lint",
    "JSON","YAML","HTTP","gRPC","REST","JWT","S3","cron","nginx","uvicorn","psql","SELECT","JOIN",
    "INDEX","migrate","alembic","socket","ws://","OCR","vision","whisper","MLOps","ETL","DWH",
    "A/B","p-value","σ","∑","π","≈","=>","!=","&&","0b1011","lambda","None","True","dict{}",
    "list[]","match","with","try","except","grep","curl","ssh"];
  const rand = (a, b) => a + Math.random() * (b - a);
  // Колода индексов слов: пока она не опустела, слово не повторяется — набор фраз
  // меняется на любом экране. Раньше слово фиксировалось при создании токена, и до
  // перезагрузки страницы менялось только его положение; на узком экране токенов
  // было всего шесть, поэтому словарь визуально не менялся вообще.
  let wordBag = [];
  const nextWord = () => {
    if (!wordBag.length) {
      for (let i = 0; i < WORDS.length; i++) wordBag.push(i);
      for (let i = wordBag.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0, sw = wordBag[i]; wordBag[i] = wordBag[j]; wordBag[j] = sw; }
    }
    return WORDS[wordBag.pop()];
  };
  // Слово, скорость, размер и прозрачность токен получает и при рождении, и при
  // каждом возврате снизу — иначе разнообразие теряется после первого прохода.
  const spawnToken = (tk, y) => {
    tk.x = Math.random() * W; tk.y = y;
    tk.w = nextWord();
    tk.vy = rand(-2.03, -0.55);
    tk.a = rand(0.05, 0.16);
    tk.s = rand(11, 17) | 0;
    return tk;
  };
  const applyPowerProfile = () => {
    // Спокойный режим: короче связи, кап 30 FPS и ниже скорость. Движение привязано
    // ко времени (dt), поэтому кап FPS экономит CPU и НЕ меняет скорость анимации;
    // спокойствие задаём отдельным множителем speedScale.
    LINK = lowPower ? 120 : 150; LINK2 = LINK * LINK;
    fpsInterval = lowPower ? 1000 / 30 : 0;
    speedScale = lowPower ? 0.6 : 1;
    // РЕЗКОСТЬ не снижаем при низком заряде: DPR=1 давал размытую картинку на
    // плотных мобильных экранах (тонкие линии 0.6px и текст токенов мылились).
    // FPS защищён капом 30 кадров и меньшим числом узлов, поэтому полный DPR
    // (потолок 2) не роняет частоту кадров.
    dprCap = 2;
  };
  const setup = (reinit) => {
    dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const w = canvas.clientWidth || window.innerWidth || document.documentElement.clientWidth;
    const h = canvas.clientHeight || window.innerHeight || document.documentElement.clientHeight;
    if (!w || !h) return false;
    W = w; H = h;
    canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reinit || !nodes.length) init();
    return true;
  };
  const init = () => {
    // Кол-во узлов (точки + основа для линий): делитель меньше = плотнее сеть.
    // При lowPower узлов меньше, чтобы анимация оставалась дешёвой.
    const div = lowPower ? 30000 : 17000, maxN = lowPower ? 55 : 95, minN = lowPower ? 20 : 28;
    const count = Math.max(minN, Math.min(maxN, Math.round((W * H) / div)));
    nodes = [];
    // Узлы сети (точки + связи): скорость дрейфа — rand(...) по vx и vy.
    for (let i = 0; i < count; i++) nodes.push({ x: Math.random()*W, y: Math.random()*H, vx: rand(-1.00,1.00), vy: rand(-1.00,1.00) });
    // Кол-во летящих токенов считаем от площади ОТДЕЛЬНО от узлов. Раньше было
    // count / 5, а на узком экране узлов минимум по площади — токенов оставалось
    // шесть. Текст дёшев (один fillText на токен) в отличие от связей узлов с их
    // O(n²), поэтому на мобильном можно держать больше без просадки FPS.
    const tcount = Math.max(lowPower ? 10 : 14, Math.min(lowPower ? 18 : 28, Math.round((W * H) / 40000)));
    tokens = [];
    // Летящие снизу вверх токены: скорость подъёма — vy (отрицательная; ближе к нулю = медленнее).
    for (let j = 0; j < tcount; j++) tokens.push(spawnToken({}, Math.random() * H));
  };
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (fpsInterval && lastDraw && (now - lastDraw) < fpsInterval) return; // кап FPS (lowPower)
    // Движение привязано ко времени, а не к кадру: при просадках/паузах rAF
    // (типично во время скролла на мобильных) скорость остаётся ровной, без рывка.
    let dt = lastT ? (now - lastT) / 16.6667 : 1;
    if (dt > 3) dt = 3;
    lastT = now; lastDraw = now;
    let b;
    for (b = 0; b < BUCKETS; b++) bucketSeg[b].length = 0;
    // Движение узлов + сбор сегментов линий по корзинам прозрачности.
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx * dt * speedScale; n.y += n.vy * dt * speedScale;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      const pdx = pointer.x - n.x, pdy = pointer.y - n.y, pd = pdx*pdx + pdy*pdy;
      if (pd < 26000) { n.x += pdx * 0.0009 * dt; n.y += pdy * 0.0009 * dt; }
      for (let k = i + 1; k < nodes.length; k++) {
        const m = nodes[k];
        const dx = n.x - m.x, dy = n.y - m.y, d2 = dx*dx + dy*dy;
        if (d2 < LINK2) {
          let bk = ((1 - d2 / LINK2) * BUCKETS) | 0; if (bk >= BUCKETS) bk = BUCKETS - 1;
          bucketSeg[bk].push(n.x, n.y, m.x, m.y);
        }
      }
    }
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 0.6; // толщина линий-связей (больше = толще)
    for (b = 0; b < BUCKETS; b++) {
      const seg = bucketSeg[b]; if (!seg.length) continue;
      ctx.strokeStyle = bucketColor[b]; // цвет/прозрачность линий
      ctx.beginPath();
      for (let s = 0; s < seg.length; s += 4) { ctx.moveTo(seg[s], seg[s+1]); ctx.lineTo(seg[s+2], seg[s+3]); }
      ctx.stroke();
    }
    // Все узлы — одним путём и одной заливкой (меньше draw-call).
    ctx.fillStyle = "rgba(124,242,160,0.75)"; // цвет узлов
    ctx.beginPath();
    for (let p = 0; p < nodes.length; p++) { ctx.moveTo(nodes[p].x + 1.7, nodes[p].y); ctx.arc(nodes[p].x, nodes[p].y, 1.7, 0, 6.2832); }
    ctx.fill();
    // Летящие снизу вверх токены кода/ИИ.
    for (let t = 0; t < tokens.length; t++) {
      const tk = tokens[t];
      tk.y += tk.vy * dt * speedScale;
      if (tk.y < -24) spawnToken(tk, H + 24); // новое слово, а не только новое место
      ctx.fillStyle = `rgba(150,180,255,${tk.a})`;
      ctx.font = `${tk.s}px ui-monospace, monospace`;
      ctx.fillText(tk.w, tk.x, tk.y);
    }
  };
  const render = () => { cancelAnimationFrame(raf); lastT = 0; lastDraw = 0; raf = requestAnimationFrame(frame); };
  const reconfigure = () => {
    applyPowerProfile();
    lastW = canvas.clientWidth || window.innerWidth; lastH = canvas.clientHeight || window.innerHeight;
    if (setup(true)) render();
  };
  // Спокойный режим включается при низком заряде ИЛИ при prefers-reduced-motion.
  // Решение владельца сайта: reduced-motion НЕ останавливает анимацию (иначе мобильное
  // энергосбережение гасило бы её через этот флаг) — лишь переводит её в спокойный режим.
  const refreshPower = () => {
    const low = batteryLow || prefersReduced;
    if (low === lowPower) return;
    lowPower = low;
    reconfigure();
  };
  // Низкий заряд батареи: сами переходим в облегчённый режим, не дожидаясь браузера.
  // Battery API есть не везде — тогда полагаемся на prefers-reduced-motion и общий
  // облегчённый рендер (батчинг).
  if (navigator.getBattery) {
    navigator.getBattery().then((bat) => {
      const upd = () => { batteryLow = (!bat.charging && bat.level <= 0.3); refreshPower(); };
      bat.addEventListener("levelchange", upd);
      bat.addEventListener("chargingchange", upd);
      upd();
    }).catch(() => {});
  }
  // Реактивно следим за prefers-reduced-motion: энергосбережение может включить его
  // уже после загрузки — тогда плавно переходим в спокойный режим (анимация не гаснет).
  if (mqReduce) {
    const onReduceChange = () => { prefersReduced = mqReduce.matches; refreshPower(); };
    if (mqReduce.addEventListener) mqReduce.addEventListener("change", onReduceChange);
    else if (mqReduce.addListener) mqReduce.addListener(onReduceChange);
  }
  // При листании на смартфоне адресная строка меняет только ВЫСОТУ вьюпорта и на
  // небольшую величину. Ресайз canvas в этот момент сбрасывал бы кадр и давал рывок,
  // поэтому пересобираем сцену лишь при смене ШИРИНЫ (>60px) или КРУПНОМ изменении высоты (>200px).
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (Math.abs(w - lastW) <= 60 && Math.abs(h - lastH) <= 200) return;
      lastW = w; lastH = h;
      if (setup(true)) render();
    }, 160);
  });
  window.addEventListener("orientationchange", () => {
    setTimeout(() => { lastW = canvas.clientWidth || window.innerWidth; lastH = canvas.clientHeight || window.innerHeight; if (setup(true)) render(); }, 250);
  });
  window.addEventListener("pointermove", (e) => { pointer.x = e.clientX; pointer.y = e.clientY; });
  window.addEventListener("pointerleave", () => { pointer.x = -9999; pointer.y = -9999; });
  // Возврат из фона / bfcache / энергосбережения мог остановить rAF — перезапускаем.
  document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
  window.addEventListener("pageshow", () => { render(); });
  // Watchdog: если кадры перестали приходить (rAF придушен/остановлен браузером),
  // но вкладка видима — мягко перезапускаем цикл, чтобы анимация не «замёрзла».
  setInterval(() => {
    if (document.hidden) return;
    if (lastT && (performance.now() - lastT) > 1500) render();
  }, 2000);
  lastW = canvas.clientWidth || window.innerWidth;
  lastH = canvas.clientHeight || window.innerHeight;
  lowPower = batteryLow || prefersReduced; // если reduced-motion активен уже при загрузке
  applyPowerProfile();
  setup(true);
  render();

  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  if (nav && navToggle) {
    const setOpen = (open) => {
      nav.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    };
    navToggle.addEventListener("click", () => { setOpen(!nav.classList.contains("open")); });
    const navLinks = nav.querySelectorAll(".links a, .links button");
    navLinks.forEach((link) => link.addEventListener("click", () => { setOpen(false); }));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" || e.keyCode === 27) setOpen(false); });
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("open") && !nav.contains(e.target)) setOpen(false);
    });
    /* Бургер-меню: JS измеряет, помещаются ли все пункты навигации + «Скачать PDF»
       в одну строку. Если нет — добавляет класс .burger независимо от ориентации.
       Заменяет фиксированный брейкпоинт @media(max-width:720px), который не срабатывал
       в горизонтальном режиме телефона (ширина >720px, но пункты всё равно не влезают). */
    let navFitTimer = null;
    const checkNavFit = () => {
      if (!nav) return;
      nav.classList.remove("burger");
      nav.classList.remove("open");
      const brand = nav.querySelector(".brand");
      const navLinksSpan = document.getElementById("navLinks");
      const navToggleBtn = document.getElementById("navToggle");
      let needsBurger = false;
      /* Если .links или .nav-toggle перенеслись на новую строку относительно
         brand — включаем бургер, чтобы nav всегда был в одну строку. */
      if (brand) {
        const brandTop = brand.offsetTop;
        if (navLinksSpan && navLinksSpan.offsetTop > brandTop + 1) needsBurger = true;
        if (!needsBurger && navToggleBtn && navToggleBtn.offsetTop > brandTop + 1) needsBurger = true;
      }
      /* Проверяем перенос внутри .links (пункты не помещаются в одну строку). */
      if (!needsBurger && navLinksSpan) {
        const items = navLinksSpan.querySelectorAll("a, button");
        if (items.length > 1) {
          const firstTop = items[0].offsetTop;
          for (let ii = 1; ii < items.length; ii++) {
            if (items[ii].offsetTop > firstTop + 1) { needsBurger = true; break; }
          }
        }
      }
      if (needsBurger) {
        nav.classList.add("burger");
        /* Повторная проверка: даже в бургер-режиме brand может быть слишком
           широким и toggle переносится. В таком случае скрываем brand. */
        nav.classList.remove("hide-brand");
        if (brand && navToggleBtn && navToggleBtn.offsetTop > brand.offsetTop + 1) {
          nav.classList.add("hide-brand");
        }
      } else {
        nav.classList.remove("hide-brand");
      }
    };
    checkNavFit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(checkNavFit);
    window.addEventListener("resize", () => { clearTimeout(navFitTimer); navFitTimer = setTimeout(checkNavFit, 150); });
    window.addEventListener("orientationchange", () => { setTimeout(checkNavFit, 200); });
  }
  const pb = document.getElementById("printBtn");
  if (pb) pb.addEventListener("click", () => { window.print(); });

  // Год в копирайте подвала обновляем автоматически (в HTML лежит статичный
  // фолбэк на случай отключённого JS и для поисковых/ИИ-краулеров).
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Галерея демо мульти-агентной системы.
     1) Превью НЕ грузятся вместе со страницей: в src разметки лежит прозрачная
        заглушка, реальный URL — в data-src. Подстановку делаем только ПОСЛЕ
        полной загрузки страницы (событие load) и лишь когда карточка приблизилась
        к вьюпорту — галерея не влияет на скорость первой отрисовки резюме.
     2) Одна и та же картинка — и для превью, и для лайтбокса. При открытии карусели
        <img> перемещаются из галереи в лайтбокс (без копий и повторной загрузки).
     Подписи в лайтбокс берём из figcaption — один источник текста, без дублей. */
  const gallery = document.getElementById("gallery");
  const lightbox = document.getElementById("lightbox");
  if (gallery && lightbox) {
    const shots = Array.prototype.slice.call(gallery.querySelectorAll(".shot"));
    const lbFrame = lightbox.querySelector(".lb-frame");
    const lbCap = document.getElementById("lbCap");
    const lbCounter = document.getElementById("lbCounter");
    const lbPrev = document.getElementById("lbPrev");
    const lbNext = document.getElementById("lbNext");
    const lbClose = document.getElementById("lbClose");
    const lbDownload = document.getElementById("lbDownload");
    let current = 0;
    let lastFocus = null;
    let lastScrollY = 0;
    // Запоминаем исходное положение каждого превью-<img>, чтобы вернуть его при закрытии.
    // В лайтбоксе показываем ТЕ ЖЕ самые <img> — без создания копий и повторной загрузки.
    const thumbHomes = shots.map((shot) => {
      const img = shot.querySelector(".shot-img");
      return { img, parent: img.parentElement, next: img.nextSibling };
    });
    const loadThumb = (img) => {
      const src = img.getAttribute("data-src");
      if (!src) return;
      img.removeAttribute("data-src");
      img.src = src;
    };
    const startThumbs = () => {
      const thumbs = gallery.querySelectorAll(".shot-img[data-src]");
      if (!("IntersectionObserver" in window)) { thumbs.forEach(loadThumb); return; }
      // rootMargin 300px: превью успевает подгрузиться до того, как попадёт в кадр.
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadThumb(entry.target);
          io.unobserve(entry.target);
        });
      }, { rootMargin: "300px 0px" });
      thumbs.forEach((img) => io.observe(img));
    };
    // Ждём load, затем — свободный кадр браузера (requestIdleCallback, если есть).
    const deferThumbs = () => {
      if (window.requestIdleCallback) requestIdleCallback(startThumbs, { timeout: 2000 });
      else setTimeout(startThumbs, 300);
    };
    if (document.readyState === "complete") deferThumbs();
    else window.addEventListener("load", deferThumbs, { once: true });
    const lbInner = lightbox.querySelector(".lb-inner");
    // Проверяем: картинка заняла всю высоту viewport → контролы поверх (overlay),
    // иначе — сверху над картинкой (padding-top в CSS).
    const updateFull = () => {
      const vh = window.innerHeight;
      const img = thumbHomes[current] ? thumbHomes[current].img : null;
      lbInner.classList.toggle("lb-full", img && img.naturalHeight > 0 && img.offsetHeight >= vh);
    };
    thumbHomes.forEach((h) => h.img.addEventListener("load", () => { if (!h.img.hidden) updateFull(); }));
    window.addEventListener("resize", () => { if (!lightbox.hidden) updateFull(); });
    const showShot = (index) => {
      const total = shots.length;
      const prev = current;
      current = (index + total) % total;
      const shot = shots[current];
      const cap = shot.querySelector(".shot-cap");
      const img = thumbHomes[current] ? thumbHomes[current].img : null;
      const src = img ? (img.dataset.src || img.src) : "";
      // Переключаем видимость между перемещёнными img — без смены src.
      if (thumbHomes[prev]) thumbHomes[prev].img.hidden = true;
      if (thumbHomes[current]) thumbHomes[current].img.hidden = false;
      lbCap.textContent = cap ? cap.textContent : "";
      lbCounter.textContent = `${current + 1} / ${total}`;
      if (lbDownload && src) { lbDownload.href = src; lbDownload.setAttribute("download", src.split("/").pop()); }
      updateFull();
    };
    const openShot = (index) => {
      lastFocus = document.activeElement;
      lastScrollY = window.scrollY;
      // Загружаем все оставшиеся превью — чтобы навигация в карусели была мгновенной.
      gallery.querySelectorAll(".shot-img[data-src]").forEach(loadThumb);
      // Перемещаем сами <img> из галереи в лайтбокс — те же элементы, без повторной загрузки.
      thumbHomes.forEach((h, i) => {
        h.img.classList.add("lb-img");
        h.img.hidden = (i !== index);
        lbFrame.appendChild(h.img);
      });
      showShot(index);
      lightbox.hidden = false;
      document.body.classList.add("lb-open");
      window.scrollTo({ top: 0, behavior: "instant" });
      lbClose.focus({ preventScroll: true });
    };
    const closeShot = () => {
      // Возвращаем <img> на исходные места в галерее.
      thumbHomes.forEach((h) => {
        h.parent.insertBefore(h.img, h.next);
        h.img.classList.remove("lb-img");
        h.img.hidden = false;
      });
      lightbox.hidden = true;
      document.body.classList.remove("lb-open");
      window.scrollTo({ top: lastScrollY, behavior: "instant" });
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };
    shots.forEach((shot, index) => {
      const btn = shot.querySelector(".shot-btn");
      if (btn) btn.addEventListener("click", () => { openShot(index); });
    });
    lbPrev.addEventListener("click", (e) => { e.stopPropagation(); showShot(current - 1); });
    lbNext.addEventListener("click", (e) => { e.stopPropagation(); showShot(current + 1); });
    lbClose.addEventListener("click", (e) => { e.stopPropagation(); closeShot(); });
    if (lbDownload) lbDownload.addEventListener("click", (e) => { e.stopPropagation(); });
    // Клик по затемнённому фону (мимо карточки) закрывает просмотр.
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeShot(); });
    // Клавиатура: Esc — закрыть, стрелки — листать.
    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeShot();
      else if (e.key === "ArrowLeft") showShot(current - 1);
      else if (e.key === "ArrowRight") showShot(current + 1);
    });
  }
})();
