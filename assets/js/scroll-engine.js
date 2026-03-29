/**
 * scroll-engine.js - 精准全屏翻页引擎
 */
(function () {
  'use strict';
  const WRAP = document.getElementById('scroll-wrap');
  const PAGES = Array.from(document.querySelectorAll('.page'));
  const PROG = document.getElementById('progress-bar');
  let cur = 0, locked = false;

  function vh() { return window.visualViewport ? window.visualViewport.height : window.innerHeight; }

  function goTo(i) {
    if (i < 0 || i >= PAGES.length || locked) return;
    locked = true;
    cur = i;
    const offset = -i * vh();
    
    WRAP.style.transition = 'transform 750ms cubic-bezier(0.77,0,0.175,1)';
    WRAP.style.transform = `translateY(${offset}px)`;

    if (PROG) PROG.style.width = `${((i + 1) / PAGES.length) * 100}%`;
    
    setTimeout(() => { locked = false; }, 800);
    updateNav(i);
  }

  function updateNav(i) {
    document.querySelectorAll('a[data-page]').forEach(a => {
      a.classList.toggle('active', parseInt(a.dataset.page) === i);
    });
  }

  window.addEventListener('wheel', e => { goTo(e.deltaY > 0 ? cur + 1 : cur - 1); }, { passive: true });
  
  // 触摸支持
  let ts;
  window.addEventListener('touchstart', e => { ts = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', e => {
    const te = e.changedTouches[0].clientY;
    if (Math.abs(ts - te) > 50) goTo(ts > te ? cur + 1 : cur - 1);
  }, { passive: true });

  window.addEventListener('resize', () => {
    WRAP.style.transition = 'none';
    WRAP.style.transform = `translateY(${-cur * vh()}px)`;
  });
})();
