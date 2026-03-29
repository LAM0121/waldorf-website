/**
 * scroll-engine.js
 * 桌面端：全屏翻页引擎 v2 — transform 精准定位
 * 移动端（≤768px）：自然文档流滚动，禁用翻页引擎
 * 支持：滚轮、触摸滑动、键盘方向键、导航链接
 */
(function () {
  'use strict';

  const MOBILE_BP = 768;

  const PAGES     = Array.from(document.querySelectorAll('.page'));
  const NAV_LINKS = Array.from(document.querySelectorAll('a[data-page]'));
  const PROG      = document.getElementById('progress-bar');
  const NAV_EL    = document.getElementById('main-nav');
  const WRAP      = document.getElementById('scroll-wrap');

  // ══════════════════════════════════════════════════════════
  // MOBILE MODE — 自然滚动，reveal 动效、进度条、nav 高亮
  // ══════════════════════════════════════════════════════════
  if (window.innerWidth <= MOBILE_BP) {

    // 立即触发所有 reveal（IntersectionObserver 在 ui.js 中已监听）
    PAGES.forEach(p =>
      p.querySelectorAll('.reveal,.reveal-l').forEach(el => el.classList.add('visible'))
    );

    // 滚动联动：nav 收缩 + 进度条 + 导航高亮
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY || window.pageYOffset;

      // Nav 收缩
      if (NAV_EL) NAV_EL.classList.toggle('scrolled', scrollY > 40);

      // 进度条
      if (PROG) {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        PROG.style.width = docH > 0 ? (scrollY / docH * 100) + '%' : '0%';
      }

      // 当前 section 高亮
      let cur = 0;
      PAGES.forEach((p, i) => {
        if (scrollY >= p.offsetTop - 120) cur = i;
      });
      NAV_LINKS.forEach(a => a.classList.toggle('active', +a.dataset.page === cur));
    }, { passive: true });

    // 导航链接：平滑滚动到对应 section
    document.querySelectorAll('a[data-page]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = PAGES[+a.dataset.page];
        if (target) {
          const navH = NAV_EL ? NAV_EL.offsetHeight : 60;
          const top  = target.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        document.getElementById('mobile-overlay')?.classList.remove('open');
        document.getElementById('hamburger')?.classList.remove('open');
        document.getElementById('hamburger')?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // 向下箭头：滚动到下一 section
    document.querySelectorAll('[data-next]').forEach(el => {
      el.addEventListener('click', () => {
        const next = PAGES[1];
        if (next) {
          const navH = NAV_EL ? NAV_EL.offsetHeight : 60;
          const top  = next.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    return; // ← 不进入桌面翻页引擎
  }

  // ══════════════════════════════════════════════════════════
  // DESKTOP MODE — 全屏翻页引擎
  // ══════════════════════════════════════════════════════════
  let cur = 0, locked = false;
  const ANIM_MS = 750;
  const LOCK_MS = 800;
  const EASE    = 'cubic-bezier(0.77,0,0.175,1)';

  /** 精准视口高度（排除地址栏） */
  function vh() {
    return window.visualViewport ? window.visualViewport.height : window.innerHeight;
  }

  /** 无动画定位 */
  function snapTo(i) {
    WRAP.style.transition = 'none';
    WRAP.style.transform  = `translateY(${-i * vh()}px)`;
  }

  /** 翻页（带动画） */
  function goTo(i, instant) {
    if (i < 0 || i >= PAGES.length) return;
    if (locked && !instant) return;
    locked = true;
    cur = i;

    const offset = -i * vh();
    if (instant) {
      WRAP.style.transition = 'none';
      WRAP.style.transform  = `translateY(${offset}px)`;
      locked = false;
    } else {
      WRAP.style.transition = `transform ${ANIM_MS}ms ${EASE}`;
      WRAP.style.transform  = `translateY(${offset}px)`;
      setTimeout(() => { locked = false; }, LOCK_MS);
    }

    if (PROG) PROG.style.width = (((i + 1) / PAGES.length) * 100) + '%';
    NAV_LINKS.forEach(a => a.classList.toggle('active', +a.dataset.page === i));
    if (!instant && PAGES[i].id) history.replaceState(null, '', '#' + PAGES[i].id);
    PAGES[i].querySelectorAll('.reveal,.reveal-l').forEach(el => el.classList.add('visible'));
    if (NAV_EL) NAV_EL.classList.toggle('scrolled', i > 0);
  }

  /** 初始化 */
  function init() {
    PAGES.forEach(p => {
      p.style.height    = vh() + 'px';
      p.style.minHeight = vh() + 'px';
    });
    WRAP.style.height = (PAGES.length * vh()) + 'px';
    snapTo(cur);
    PAGES[0].querySelectorAll('.reveal,.reveal-l').forEach(el => el.classList.add('visible'));
  }
  init();

  // ── Resize ────────────────────────────────────────────────
  let rvTimer;
  function onResize() {
    clearTimeout(rvTimer);
    rvTimer = setTimeout(() => {
      // 如果调整后变成移动端宽度，刷新页面使 CSS/JS 重新生效
      if (window.innerWidth <= MOBILE_BP) { location.reload(); return; }
      PAGES.forEach(p => {
        p.style.height    = vh() + 'px';
        p.style.minHeight = vh() + 'px';
      });
      WRAP.style.height = (PAGES.length * vh()) + 'px';
      snapTo(cur);
      const cv = document.getElementById('heroCanvas');
      if (cv) { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    }, 100);
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onResize);
    window.visualViewport.addEventListener('scroll', onResize);
  } else {
    window.addEventListener('resize', onResize, { passive: true });
  }

  // ── 滚轮（桌面）──────────────────────────────────────────
  let wheelAccum = 0, wheelTimer;
  window.addEventListener('wheel', e => {
    e.preventDefault();
    if (locked) return;
    wheelAccum += e.deltaY;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelAccum = 0; }, 80);
    if (Math.abs(wheelAccum) < 50) return;
    const dir = wheelAccum > 0 ? 1 : -1;
    wheelAccum = 0;
    goTo(cur + dir);
  }, { passive: false });

  // ── 触摸 ─────────────────────────────────────────────────
  let ty = 0, tx = 0, ttime = 0, moved = false;
  window.addEventListener('touchstart', e => {
    ty = e.touches[0].clientY; tx = e.touches[0].clientX;
    ttime = Date.now(); moved = false;
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    moved = true; e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchend', e => {
    if (!moved || locked) return;
    const dy = ty - e.changedTouches[0].clientY;
    const dx = tx - e.changedTouches[0].clientX;
    const dt = Date.now() - ttime;
    if (Math.abs(dy) < Math.abs(dx)) return;
    const fast = Math.abs(dy) > 25 && dt < 300;
    const slow = Math.abs(dy) > 55;
    if (!fast && !slow) return;
    goTo(dy > 0 ? cur + 1 : cur - 1);
  }, { passive: true });

  // ── 键盘 ─────────────────────────────────────────────────
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(cur + 1); }
    else if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(cur - 1); }
  });

  // ── 导航链接（桌面）──────────────────────────────────────
  document.querySelectorAll('a[data-page]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      goTo(+a.dataset.page);
      document.getElementById('mobile-overlay')?.classList.remove('open');
      document.getElementById('hamburger')?.classList.remove('open');
      document.getElementById('hamburger')?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ── 向下箭头 ─────────────────────────────────────────────
  document.querySelectorAll('[data-next]').forEach(el => {
    el.addEventListener('click', () => goTo(cur + 1));
  });

})();

