(function () {
  'use strict';
  const PAGES = document.querySelectorAll('.page');
  const NAV_LINKS = document.querySelectorAll('a[data-page]');

  // 1. 处理导航点击跳转（使用原生的 scrollIntoView）
  NAV_LINKS.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const idx = parseInt(a.dataset.page);
      const targetPage = PAGES[idx];
      if (targetPage) {
        // 这一行是关键：让浏览器自己滚到目标位置，配合 CSS 自吸
        targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 2. 监听滚动位置，自动高亮对应的导航点
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = Array.from(PAGES).indexOf(entry.target);
        NAV_LINKS.forEach((link, i) => link.classList.toggle('active', i === index));
        const prog = document.getElementById('progress-bar');
        if (prog) prog.style.transform = `scaleX(${(index + 1) / PAGES.length})`;
      }
    });
  }, { threshold: 0.6 }); // 只有当页面露出 60% 时才算切换

  PAGES.forEach(page => observer.observe(page));
})();
