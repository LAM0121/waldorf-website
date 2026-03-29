(function () {
  'use strict';
  const PAGES = document.querySelectorAll('.page');
  const NAV_LINKS = document.querySelectorAll('a[data-page]');

  // 1. 处理导航点击跳转
  NAV_LINKS.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const idx = parseInt(a.dataset.page);
      const targetPage = PAGES[idx];
      
      if (targetPage) {
        // 使用针对自吸滚动最稳定的跳转方式
        targetPage.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    });
  });

  // 2. 监听滚动更新高亮 (Intersection Observer)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = Array.from(PAGES).indexOf(entry.target);
        NAV_LINKS.forEach((link, i) => {
          link.classList.toggle('active', i === index);
        });
        const prog = document.getElementById('progress-bar');
        if (prog) prog.style.transform = `scaleX(${(index + 1) / PAGES.length})`;
      }
    });
  }, { threshold: 0.5 });

  PAGES.forEach(page => observer.observe(page));
})();
