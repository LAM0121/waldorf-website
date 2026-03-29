(function () {
  'use strict';
  const PAGES = document.querySelectorAll('.page');
  const NAV_LINKS = document.querySelectorAll('a[data-page]');

  // 1. 使用 IntersectionObserver 监听当前在哪个页面
  const observerOptions = {
    threshold: 0.6 // 当页面露出 60% 时，更新导航高亮
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

  // 2. 点击导航平滑滚动（利用原生 scrollIntoView）
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
