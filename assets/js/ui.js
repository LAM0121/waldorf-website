/**
 * ui.js
 * 通用 UI 交互：汉堡菜单、企业微信弹窗、Intersection Observer reveal
 */
(function () {

  // ── 汉堡菜单 ─────────────────────────────────────────────
  // ── 汉堡菜单逻辑修正 ─────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const overlay   = document.getElementById('mobile-overlay');

  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(open));
      overlay.classList.toggle('open', open);
      
      // 【关键修正】：同时控制 html 和 body，防止自吸效果在菜单打开时抖动
      const overflowVal = open ? 'hidden' : '';
      document.documentElement.style.overflow = overflowVal;
      document.body.style.overflow = overflowVal;
    });

    overlay.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        overlay.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        
        // 【关键修正】：恢复滚动
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      });
    });
  }
  // ── 企业微信弹窗 ──────────────────────────────────────────
  const wt = document.getElementById('wechat-trigger');
  const wm = document.getElementById('wechat-modal');
  const wc = document.getElementById('wechat-close');

  if (wt && wm && wc) {
    const openW  = () => { wm.classList.add('open');    document.body.style.overflow = 'hidden'; };
    const closeW = () => { wm.classList.remove('open'); document.body.style.overflow = ''; };
    wt.addEventListener('click', openW);
    wt.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openW(); });
    wc.addEventListener('click', closeW);
    wm.addEventListener('click', e => { if (e.target === wm) closeW(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeW(); });
  }

  // ── Intersection Observer reveal（备用，首屏已由 scroll-engine 触发）──
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal,.reveal-l').forEach(el => io.observe(el));

})();
