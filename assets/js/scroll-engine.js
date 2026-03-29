/**
 * scroll-engine.js
 * 全屏翻页引擎 v2 — transform 精准定位
 * 支持：滚轮、触摸滑动、键盘方向键、导航链接
 */
(function () {
  'use strict';
  const PAGES = document.querySelectorAll('.page');
  const NAV_LINKS = document.querySelectorAll('a[data-page]');

  // 1. 自动高亮当前页面的导航栏
  const observerOptions = {
    threshold: 0.5 // 当页面进入视口 50% 时切换状态
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = Array.from(PAGES).indexOf(entry.target);
        updateActiveNav(index);
      }
    });
  }, observerOptions);

  PAGES.forEach(page => observer.observe(page));

  function updateActiveNav(index) {
    NAV_LINKS.forEach((link, i) => {
      link.classList.toggle('active', i === index);
    });
    // 更新进度条
    const prog = document.getElementById('progress-bar');
    if (prog) prog.style.transform = `scaleX(${(index + 1) / PAGES.length})`;
  }

  // 2. 点击导航平滑滚动
  NAV_LINKS.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const idx = parseInt(a.dataset.page);
      if (PAGES[idx]) {
        PAGES[idx].scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();

    // 进度条
    if (PROG) PROG.style.width = (((i + 1) / PAGES.length) * 100) + '%';

    // 导航高亮
    NAV_LINKS.forEach(a => a.classList.toggle('active', +a.dataset.page === i));

    // URL hash
    if (!instant && PAGES[i].id) history.replaceState(null, '', '#' + PAGES[i].id);

    // Reveal 动效
    PAGES[i].querySelectorAll('.reveal,.reveal-l').forEach(el => el.classList.add('visible'));

    // Nav 收缩
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

  // ── Resize（地址栏出现/消失、旋转）──────────────────────
  let rvTimer;
  function onResize() {
    clearTimeout(rvTimer);
    rvTimer = setTimeout(() => {
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

  // ── 滚轮（桌面）—— deltaY 累积防抖 ─────────────────────
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

  // ── 触摸（手机/平板）────────────────────────────────────
  let ty = 0, tx = 0, ttime = 0, moved = false;
  window.addEventListener('touchstart', e => {
    ty    = e.touches[0].clientY;
    tx    = e.touches[0].clientX;
    ttime = Date.now();
    moved = false;
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    moved = true;
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('touchend', e => {
    if (!moved || locked) return;
    const dy = ty - e.changedTouches[0].clientY;
    const dx = tx - e.changedTouches[0].clientX;
    const dt = Date.now() - ttime;
    if (Math.abs(dy) < Math.abs(dx)) return; // 横向滑动忽略
    const fast = Math.abs(dy) > 25 && dt < 300;
    const slow = Math.abs(dy) > 55;
    if (!fast && !slow) return;
    goTo(dy > 0 ? cur + 1 : cur - 1);
  }, { passive: true });

  // ── 键盘 ─────────────────────────────────────────────────
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(cur + 1); }
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goTo(cur - 1); }
  });

  // ── 导航链接 ─────────────────────────────────────────────
  document.querySelectorAll('a[data-page]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      goTo(+a.dataset.page);
      document.getElementById('mobile-overlay').classList.remove('open');
      document.getElementById('hamburger').classList.remove('open');
      document.getElementById('hamburger').setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ── 向下箭头 ─────────────────────────────────────────────
  document.querySelectorAll('[data-next]').forEach(el => {
    el.addEventListener('click', () => goTo(cur + 1));
  });

})();
