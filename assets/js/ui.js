/**
 * ui.js (优化版)
 * 功能：汉堡菜单交互、企业微信弹窗、滚动平滑跳转、内容滚动浮现
 */
(function () {
  'use strict';

  // ── 1. 汉堡菜单与移动端导航 ─────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const overlay   = document.getElementById('mobile-overlay');

  if (hamburger && overlay) {
    // 切换菜单开关
    const toggleMenu = (forceClose = false) => {
      const isOpen = forceClose ? false : !hamburger.classList.contains('open');
      hamburger.classList.toggle('open', isOpen);
      overlay.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      // 菜单打开时禁止背景滚动，关闭时恢复
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    hamburger.addEventListener('click', () => toggleMenu());

    // 点击菜单内的链接时：关闭菜单并跳转
    overlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // 如果是站内锚点跳转 (以 # 开头)
        if (href && href.startsWith('#')) {
          toggleMenu(true); // 强制关闭菜单
          
          // 获取目标元素并执行平滑滚动（兼容旧浏览器）
          const targetId = href.substring(1);
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            e.preventDefault();
            window.scrollTo({
              top: targetEl.offsetTop,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }

  // ── 2. 企业微信弹窗逻辑 ──────────────────────────────────────────
  const wt = document.getElementById('wechat-trigger');
  const wm = document.getElementById('wechat-modal');
  const wc = document.getElementById('wechat-close');

  if (wt && wm && wc) {
    const openW  = () => { wm.classList.add('open');    document.body.style.overflow = 'hidden'; };
    const closeW = () => { wm.classList.remove('open'); document.body.style.overflow = ''; };
    
    wt.addEventListener('click', (e) => { e.preventDefault(); openW(); });
    wc.addEventListener('click', closeW);
    
    // 点击遮罩层关闭
    wm.addEventListener('click', e => { if (e.target === wm) closeW(); });
    // ESC 键关闭
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeW(); });
  }

  // ── 3. 滚动浮现动画 (Intersection Observer) ──────────────────────
  // 当元素进入视口 10% 时，添加 .active 类触发 CSS 动画
  const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px" // 提前或延迟触发
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // 如果只需要触发一次动画，取消观察：
        // revealObserver.unobserve(entry.target);
      }
    });
  }, revealOptions);

  // 自动查找页面中所有带 .reveal 类的元素
  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // ── 4. 导航栏背景随滚动变色 (可选增强) ──────────────────────────────
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  }, { passive: true });

})();
