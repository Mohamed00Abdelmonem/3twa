// sticky nav shadow
    const navInner = document.getElementById('navInner');
    window.addEventListener('scroll', () => {
      navInner.classList.toggle('scrolled', window.scrollY > 20);
    });

    // ═══ SCROLL REVEALS (with staggered children) ═══
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => io.observe(el));

    // Staggered entrance for grid children
    document.querySelectorAll('.compare-grid, .cf-grid, .voice-row, .num-grid, .how-row').forEach(grid => {
      const sio = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          Array.from(e.target.children).forEach((child, i) => {
            child.style.opacity = '0';
            child.style.transform = 'translateY(20px)';
            setTimeout(() => {
              child.style.transition = 'opacity .55s cubic-bezier(.22,1,.36,1), transform .55s cubic-bezier(.22,1,.36,1)';
              child.style.opacity = '1';
              child.style.transform = 'translateY(0)';
            }, i * 90);
          });
          sio.unobserve(e.target);
        });
      }, { threshold: 0.12 });
      sio.observe(grid);
    });

    // ═══ DYNAMIC TIMELINE PROGRESS LINE ═══
    (function () {
      const glow = document.getElementById('timelineGlow');
      const steps = document.querySelectorAll('.timeline .step');
      if (!glow || steps.length < 2) return;
      const N = steps.length;
      const STEP_DUR = 1200;
      const HOLD = 1500;
      const END_PAUSE = 2000;
      let started = false;

      function setActive(idx) {
        steps.forEach((s, i) => s.classList.toggle('active', i === idx));
      }

      function animateLine(from, to, dur) {
        return new Promise(resolve => {
          const t0 = performance.now();
          (function frame(now) {
            const p = Math.min((now - t0) / dur, 1);
            const e = 1 - Math.pow(1 - p, 3);
            glow.style.transform = 'scaleX(' + (from + (to - from) * e) + ')';
            p < 1 ? requestAnimationFrame(frame) : resolve();
          })(performance.now());
        });
      }

      async function cycle() {
        glow.style.transform = 'scaleX(0)';
        setActive(0);
        await new Promise(r => setTimeout(r, HOLD));
        for (let i = 1; i < N; i++) {
          await animateLine((i - 1) / (N - 1), i / (N - 1), STEP_DUR);
          setActive(i);
          if (i < N - 1) await new Promise(r => setTimeout(r, HOLD));
        }
        await new Promise(r => setTimeout(r, END_PAUSE));
        cycle();
      }

      const tlObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting && !started) { started = true; cycle(); }
        });
      }, { threshold: 0.2 });
      tlObs.observe(document.querySelector('.timeline'));
    })();

    // client profiles — infinite auto-scroll drag carousel
    (function () {
      const creators = [
        {
          name: 'Daniel Hart', username: '@danielhart.co', followers: '210K', niche: 'Entrepreneur', verified: true, url: '#',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
        },
        {
          name: 'Marcus Reid', username: '@marcusreid', followers: '340K', niche: 'Fitness Coach', verified: true, url: '#',
          avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop'
        },
        {
          name: 'Brandon Lee', username: '@brandonlee.tv', followers: '128K', niche: 'SaaS Founder', verified: false, url: '#',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop'
        },
        {
          name: 'Sophie Turner', username: '@sophieturner', followers: '540K', niche: 'Personal Brand', verified: true, url: '#',
          avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop'
        },
        {
          name: 'Ayaan Rahman', username: '@ayaan.raw', followers: '1.3M', niche: 'Content Creator', verified: true, url: '#',
          avatar: 'https://images.unsplash.com/photo-1500336624523-d727130c3328?q=80&w=200&auto=format&fit=crop'
        },
        {
          name: 'Jessie Lin', username: '@jessielin.fit', followers: '275K', niche: 'Fitness Coach', verified: false, url: '#',
          avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=200&auto=format&fit=crop'
        },
        {
          name: 'Elena Cross', username: '@elenacross', followers: '402K', niche: 'E-commerce', verified: true, url: '#',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop'
        },
        {
          name: 'Marco Delgado', username: '@marcodelgado', followers: '189K', niche: 'Entrepreneur', verified: true, url: '#',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop'
        },
        {
          name: 'Priya Nair', username: '@priyanair', followers: '96K', niche: 'SaaS Founder', verified: false, url: '#',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop'
        },
        {
          name: 'Tyler Brooks', username: '@tylerbrooks', followers: '620K', niche: 'Content Creator', verified: true, url: '#',
          avatar: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=200&auto=format&fit=crop'
        }
      ];

      const cpTrack = document.getElementById('cpTrack');
      const cpViewport = document.getElementById('cpViewport');
      if (!cpTrack || !cpViewport) return;

      const cpVerifiedIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 2.2 3.1-.6 1 3 2.8 1.5-.5 3.1 1.9 2.5-1.9 2.5.5 3.1-2.8 1.5-1 3-3.1-.6L12 25l-2.4-2.8-3.1.6-1-3-2.8-1.5.5-3.1L1.3 12.7l1.9-2.5-.5-3.1 2.8-1.5 1-3 3.1.6L12 2z" fill="#3b82f6"/><path d="M8.5 12.3l2.2 2.2 4.8-4.8" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      const cpExtIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

      function cpCardHTML(p) {
        return `
        <a class="cp-card" href="${p.url}" target="_blank" rel="noopener" data-profile-url="${p.url}">
          <span class="cp-ext">${cpExtIcon}</span>
          <img class="cp-avatar" src="${p.avatar}" alt="" loading="lazy">
          <div class="cp-name-row">
            <span class="cp-name">${p.name}</span>
            ${p.verified ? cpVerifiedIcon : ''}
          </div>
          <div class="cp-username">${p.username}</div>
          <div class="cp-followers">${p.followers}<span>Followers</span></div>
          <span class="cp-niche">${p.niche}</span>
        </a>`;
      }

      // render two sets back-to-back for a seamless infinite loop
      cpTrack.innerHTML = creators.map(cpCardHTML).join('') + creators.map(cpCardHTML).join('');

      let cpOffset = 0;
      let cpSetWidth = 0;
      let cpSpeed = 0.4; // px per frame, right-to-left
      let cpHover = false;
      let cpDragging = false;
      let cpDragStartX = 0;
      let cpDragStartOffset = 0;
      let cpDragDistance = 0;

      function cpMeasure() {
        cpSetWidth = cpTrack.scrollWidth / 2;
      }
      cpMeasure();
      window.addEventListener('resize', cpMeasure);

      function cpApply() {
        cpTrack.style.transform = `translate3d(${cpOffset}px,0,0)`;
      }

      function cpTick() {
        if (!cpDragging && !cpHover && cpSetWidth) {
          cpOffset -= cpSpeed;
        }
        if (cpSetWidth) {
          while (cpOffset <= -cpSetWidth) cpOffset += cpSetWidth;
          while (cpOffset > 0) cpOffset -= cpSetWidth;
        }
        cpApply();
        requestAnimationFrame(cpTick);
      }
      requestAnimationFrame(cpTick);

      cpViewport.addEventListener('mouseenter', () => { cpHover = true; });
      cpViewport.addEventListener('mouseleave', () => { cpHover = false; });

      function cpPointerDown(x) {
        cpDragging = true;
        cpDragDistance = 0;
        cpDragStartX = x;
        cpDragStartOffset = cpOffset;
      }
      function cpPointerMove(x) {
        if (!cpDragging) return;
        const delta = x - cpDragStartX;
        cpDragDistance += Math.abs(delta - (cpOffset - cpDragStartOffset));
        cpOffset = cpDragStartOffset + delta;
      }
      function cpPointerUp() {
        cpDragging = false;
      }

      cpViewport.addEventListener('pointerdown', (e) => { cpPointerDown(e.clientX); });
      window.addEventListener('pointermove', (e) => { cpPointerMove(e.clientX); });
      window.addEventListener('pointerup', cpPointerUp);
      cpViewport.addEventListener('touchstart', (e) => { cpPointerDown(e.touches[0].clientX); }, { passive: true });
      cpViewport.addEventListener('touchmove', (e) => { cpPointerMove(e.touches[0].clientX); }, { passive: true });
      cpViewport.addEventListener('touchend', cpPointerUp);

      // suppress the click-through to the profile link if the user was dragging
      cpTrack.addEventListener('click', (e) => {
        if (cpDragDistance > 6) {
          e.preventDefault();
        }
      });
    })();

    // selected editing work — infinite drag carousel
    (function () {
      const projects = [
        {
          name: 'Daniel Hart', title: 'Street style hook edit', verified: true,
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop',
          thumb: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=500&auto=format&fit=crop',
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        },
        {
          name: 'Marcus Reid', title: 'Talking-head retention cut', verified: true,
          avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=100&auto=format&fit=crop',
          thumb: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=500&auto=format&fit=crop',
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        },
        {
          name: 'Brandon Lee', title: 'Travel reel, hook-first pacing', verified: true,
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=100&auto=format&fit=crop',
          thumb: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=500&auto=format&fit=crop',
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        },
        {
          name: 'Sophie Turner', title: 'Founder story, watch-time edit', verified: false,
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop',
          thumb: 'https://images.unsplash.com/photo-1500336624523-d727130c3328?q=80&w=500&auto=format&fit=crop',
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        },
        {
          name: 'Ayaan Rahman', title: 'Fashion reel, story pacing', verified: true,
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=100&auto=format&fit=crop',
          thumb: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=500&auto=format&fit=crop',
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        },
        {
          name: 'Jessie Lin', title: 'Coach content, hook engineering', verified: true,
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=100&auto=format&fit=crop',
          thumb: 'https://images.unsplash.com/photo-1618609377864-68609b857e90?q=80&w=500&auto=format&fit=crop',
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        }
      ];

      const track = document.getElementById('ewTrack');
      const viewport = document.getElementById('ewViewport');
      if (!track || !viewport) return;

      const verifiedIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 2.2 3.1-.6 1 3 2.8 1.5-.5 3.1 1.9 2.5-1.9 2.5.5 3.1-2.8 1.5-1 3-3.1-.6L12 25l-2.4-2.8-3.1.6-1-3-2.8-1.5.5-3.1L1.3 12.7l1.9-2.5-.5-3.1 2.8-1.5 1-3 3.1.6L12 2z" fill="#3b82f6"/><path d="M8.5 12.3l2.2 2.2 4.8-4.8" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

      function cardHTML(p) {
        return `
        <div class="ew-card" data-video="${p.video}">
          <div class="ew-thumb"><img src="${p.thumb}" alt="" loading="lazy"></div>
          <div class="ew-overlay">
            <div class="ew-creator">
              <img class="ew-avatar" src="${p.avatar}" alt="" loading="lazy">
              <span class="ew-name">${p.name} ${p.verified ? verifiedIcon : ''}</span>
            </div>
            <div class="ew-title">${p.title}</div>
          </div>
          <button class="ew-play" aria-label="Play video" type="button">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 1.8v14.4L15.5 9 3 1.8Z" fill="#fff"/></svg>
          </button>
        </div>`;
      }

      // render two sets back-to-back for a seamless infinite loop
      track.innerHTML = projects.map(cardHTML).join('') + projects.map(cardHTML).join('');

      let offset = 0;
      let setWidth = 0;
      let speed = 0.45; // px per frame, right-to-left
      let isHover = false;
      let isDragging = false;
      let dragStartX = 0;
      let dragStartOffset = 0;
      let rafId = null;

      function measure() {
        setWidth = track.scrollWidth / 2;
      }
      measure();
      window.addEventListener('resize', measure);

      function apply() {
        track.style.transform = `translate3d(${offset}px,0,0)`;
      }

      function tick() {
        if (!isDragging && !isHover && setWidth) {
          offset -= speed;
        }
        if (setWidth) {
          while (offset <= -setWidth) offset += setWidth;
          while (offset > 0) offset -= setWidth;
        }
        apply();
        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);

      viewport.addEventListener('mouseenter', () => { isHover = true; });
      viewport.addEventListener('mouseleave', () => { isHover = false; });

      function pointerDown(x) {
        isDragging = true;
        dragStartX = x;
        dragStartOffset = offset;
      }
      function pointerMove(x) {
        if (!isDragging) return;
        offset = dragStartOffset + (x - dragStartX);
      }
      function pointerUp() {
        isDragging = false;
      }

      viewport.addEventListener('pointerdown', (e) => { pointerDown(e.clientX); });
      window.addEventListener('pointermove', (e) => { pointerMove(e.clientX); });
      window.addEventListener('pointerup', pointerUp);
      viewport.addEventListener('touchstart', (e) => { pointerDown(e.touches[0].clientX); }, { passive: true });
      viewport.addEventListener('touchmove', (e) => { pointerMove(e.touches[0].clientX); }, { passive: true });
      viewport.addEventListener('touchend', pointerUp);

      // click a card to open the lightbox (ignore clicks that were actually drags)
      let dragDistance = 0;
      viewport.addEventListener('pointerdown', (e) => { dragDistance = 0; });
      window.addEventListener('pointermove', (e) => { if (isDragging) dragDistance += Math.abs(e.movementX || 0); });

      const modal = document.getElementById('ewModal');
      const modalVideo = document.getElementById('ewModalVideo');
      const modalClose = document.getElementById('ewModalClose');

      track.addEventListener('click', (e) => {
        if (dragDistance > 6) return; // was a drag, not a tap
        const card = e.target.closest('.ew-card');
        if (!card) return;
        const src = card.getAttribute('data-video');
        modalVideo.src = src;
        modal.classList.add('open');
        modalVideo.play().catch(() => { });
      });

      function closeModal() {
        modal.classList.remove('open');
        modalVideo.pause();
        modalVideo.removeAttribute('src');
        modalVideo.load();
      }
      modalClose.addEventListener('click', closeModal);
      modal.querySelector('.ew-modal-backdrop').addEventListener('click', closeModal);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    })();

    // voice note audio testimonials
    function formatTime(sec) {
      if (!isFinite(sec) || isNaN(sec)) return '0:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }
    const voiceCards = document.querySelectorAll('.voice-card');
    voiceCards.forEach(card => {
      const audio = card.querySelector('.voice-audio');
      const playBtn = card.querySelector('.voice-play');
      const iconPlay = card.querySelector('.icon-play');
      const iconPause = card.querySelector('.icon-pause');
      const fill = card.querySelector('.voice-progress-fill');
      const timeEl = card.querySelector('.voice-time');
      const durEl = card.querySelector('.voice-duration');

      audio.addEventListener('loadedmetadata', () => {
        durEl.textContent = formatTime(audio.duration);
      });
      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
        }
        timeEl.textContent = formatTime(audio.currentTime);
      });
      audio.addEventListener('ended', () => {
        card.classList.remove('is-active');
        playBtn.classList.remove('is-playing');
        iconPlay.style.display = '';
        iconPause.style.display = 'none';
        fill.style.width = '0%';
        timeEl.textContent = '0:00';
      });

      playBtn.addEventListener('click', () => {
        const isPlaying = !audio.paused;
        // pause every other voice note first
        voiceCards.forEach(other => {
          if (other !== card) {
            const otherAudio = other.querySelector('.voice-audio');
            otherAudio.pause();
            other.classList.remove('is-active');
            other.querySelector('.voice-play').classList.remove('is-playing');
            other.querySelector('.icon-play').style.display = '';
            other.querySelector('.icon-pause').style.display = 'none';
          }
        });
        if (isPlaying) {
          audio.pause();
          card.classList.remove('is-active');
          playBtn.classList.remove('is-playing');
          iconPlay.style.display = '';
          iconPause.style.display = 'none';
        } else {
          audio.play();
          card.classList.add('is-active');
          playBtn.classList.add('is-playing');
          iconPlay.style.display = 'none';
          iconPause.style.display = '';
        }
      });
    });

    // faq accordion
    document.querySelectorAll('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-q');
      const a = item.querySelector('.faq-a');
      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(o => {
          o.classList.remove('open');
          o.querySelector('.faq-a').style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add('open');
          a.style.maxHeight = a.scrollHeight + 'px';
        }
      });
    });
    // open first FAQ by default
    document.querySelector('.faq-item').classList.add('open');
    const firstA = document.querySelector('.faq-item .faq-a');
    firstA.style.maxHeight = firstA.scrollHeight + 'px';


    // ═══ 3TWA: PHONE VIDEOS ═══
    // ★ EASY EDIT: swap these URLs to change the phone videos
    const VIDEOS = {
      left: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      center: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
      right: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    };
    function changeVideo(id) {
      const url = prompt("Paste a new video URL for the " + id + " phone:", VIDEOS[id]);
      if (url) { VIDEOS[id] = url; const v = document.getElementById("pv-" + id); v.src = url; v.load(); v.play().catch(() => { }); }
    }
    Object.keys(VIDEOS).forEach(id => {
      const v = document.getElementById("pv-" + id);
      if (!v) return;
      v.src = VIDEOS[id]; v.load(); v.play().catch(() => { });
    });

    // ═══ 3TWA: VIEWS COUNTER 0 → 500M, pause, repeat ═══
    (function () {
      const el = document.getElementById("vb-num");
      if (!el) return;
      const TARGET = 500000000, DURATION = 6000, PAUSE = 2200;
      function fmt(n) { if (n >= 1000000) return "+" + (n / 1000000).toFixed(n >= 100000000 ? 0 : 1) + "M"; if (n >= 1000) return "+" + (n / 1000).toFixed(0) + "K"; return "+" + n; }
      function run() {
        let start = null;
        (function frame(ts) { if (!start) start = ts; const p = Math.min((ts - start) / DURATION, 1); const e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(Math.round(e * TARGET)); if (p < 1) { requestAnimationFrame(frame); } else { el.textContent = "+500M"; setTimeout(() => { el.textContent = "+0"; setTimeout(run, 200); }, PAUSE); } })(performance.now());
      }
      run();
    })();

    // ═══ APPLE-STYLE GLASS ANALYTICS CHART ═══
    (function () {
      const canvas = document.getElementById("glass-chart");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      let progress = 0;
      let state = "growing"; // "growing", "pausing", "resetting"
      let pauseStartTime = 0;

      const _dpr = Math.min(window.devicePixelRatio || 1, 2);
      let _cw = 0, _ch = 0;

      const curvePoints = [
        { x: 0, y: 0.05 },
        { x: 0.2, y: 0.18 },
        { x: 0.4, y: 0.35 },
        { x: 0.6, y: 0.62 },
        { x: 0.8, y: 0.78 },
        { x: 1.0, y: 0.92 }
      ];

      function drawChart(currentProgress, opacity = 1) {
        const parent = canvas.parentElement;
        if (!parent) return;
        const W = parent.offsetWidth || 184;
        const H = parent.offsetHeight || 80;

        if (W !== _cw || H !== _ch) {
          canvas.width = W * _dpr;
          canvas.height = H * _dpr;
          ctx.setTransform(_dpr, 0, 0, _dpr, 0, 0);
          _cw = W; _ch = H;
        } else {
          ctx.setTransform(_dpr, 0, 0, _dpr, 0, 0);
        }

        ctx.clearRect(0, 0, W, H);
        if (currentProgress <= 0) return;

        const padX = 8;
        const padY = 10;
        const chartW = W - padX * 2;
        const chartH = H - padY * 2;

        const pts = [];
        const steps = 60;
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * currentProgress;
          let valY = 0.05;
          for (let s = 0; s < curvePoints.length - 1; s++) {
            const p1 = curvePoints[s];
            const p2 = curvePoints[s + 1];
            if (t >= p1.x && t <= p2.x) {
              const segT = (t - p1.x) / (p2.x - p1.x);
              const easeSegT = segT * segT * (3 - 2 * segT);
              valY = p1.y + (p2.y - p1.y) * easeSegT;
              break;
            }
          }
          const px = padX + t * chartW;
          const py = H - padY - valY * chartH;
          pts.push({ x: px, y: py });
        }

        if (pts.length < 2) return;

        ctx.globalAlpha = opacity;

        const gradFill = ctx.createLinearGradient(0, padY, 0, H);
        gradFill.addColorStop(0, "rgba(168, 85, 247, 0.35)");
        gradFill.addColorStop(1, "rgba(168, 85, 247, 0.0)");

        ctx.beginPath();
        ctx.moveTo(pts[0].x, H - padY);
        pts.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.lineTo(pts[pts.length - 1].x, H - padY);
        ctx.closePath();
        ctx.fillStyle = gradFill;
        ctx.fill();

        ctx.beginPath();
        pts.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = "rgba(168, 85, 247, 0.6)";
        ctx.shadowBlur = 8;
        ctx.stroke();

        ctx.shadowBlur = 0;

        const tip = pts[pts.length - 1];
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#c084fc";
        ctx.shadowColor = "rgba(192, 132, 252, 0.9)";
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      let lastTime = performance.now();
      let opacity = 1;

      function loop(now) {
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        if (state === "growing") {
          progress += dt * 0.22;
          if (progress >= 1) {
            progress = 1;
            state = "pausing";
            pauseStartTime = now;
          }
          opacity = 1;
        } else if (state === "pausing") {
          if (now - pauseStartTime >= 2000) {
            state = "resetting";
          }
          opacity = 1;
        } else if (state === "resetting") {
          opacity -= dt * 2.5;
          if (opacity <= 0) {
            opacity = 0;
            progress = 0;
            state = "growing";
          }
        }

        drawChart(progress, opacity);
        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    })();

    // ═══ INTERACTIVE CURSOR & CARD SPOTLIGHT EFFECTS ═══
    (function () {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

      // Create glowing cursor follower element
      const cursorGlow = document.createElement('div');
      cursorGlow.className = 'cursor-glow active';
      document.body.appendChild(cursorGlow);

      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let glowX = mouseX;
      let glowY = mouseY;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      function renderCursor() {
        glowX += (mouseX - glowX) * 0.15;
        glowY += (mouseY - glowY) * 0.15;
        cursorGlow.style.transform = `translate3d(${glowX - 225}px, ${glowY - 225}px, 0)`;
        requestAnimationFrame(renderCursor);
      }
      requestAnimationFrame(renderCursor);

      // Card spotlight position updates
      const cardSelectors = '.compare-card, .cf-card, .ew-card, .cp-card, .voice-card, .num-card, .step, .faq-item, .hero-metric, .result-card';
      const spotlightCards = document.querySelectorAll(cardSelectors);

      spotlightCards.forEach((card) => {
        card.classList.add('spotlight-card');
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        });
      });

      // Magnetic buttons effect
      const magneticBtns = document.querySelectorAll('.btn-primary, .btn-secondary, .ew-play');
      magneticBtns.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - (rect.left + rect.width / 2);
          const y = e.clientY - (rect.top + rect.height / 2);
          btn.style.transform = `translate3d(${x * 0.25}px, ${y * 0.25}px, 0) scale(1.03)`;
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = `translate3d(0, 0, 0) scale(1)`;
        });
      });
    })();

    // ═══ HERO BACKGROUND VIDEO PLAYBACK SAFEGUARD ═══
    (function () {
      const heroVideo = document.querySelector('.hero-video-bg');
      if (heroVideo) {
        heroVideo.play().catch(() => {
          // Autoplay fallback handler
        });
      }
    })();
