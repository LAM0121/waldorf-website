/**
 * ui.js (2026 适配版)
 * 功能：汉堡菜单交互、企业微信弹窗、平滑滚动跳转、内容随滚动浮现
 */
(function () {
  'use strict';

  // ── 1. 移动端导航与汉堡菜单 ─────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const overlay   = document.getElementById('mobile-overlay');

  if (hamburger && overlay) {
    // 切换菜单状态的统一函数
    const toggleMenu = (forceClose = false) => {
      const isOpen = forceClose ? false : !hamburger.classList.contains('open');
      
      hamburger.classList.toggle('open', isOpen);
      overlay.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      
      // 菜单打开时锁定背景滚动，关闭时恢复
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    hamburger.addEventListener('click', () => toggleMenu());

    // 核心修复：点击菜单内的链接后，自动关闭菜单并平滑跳转
    overlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        // 如果是站内锚点跳转（以 # 开头）
        if (href && href.startsWith('#')) {
          toggleMenu(true); // 1. 先关闭遮罩层

          const targetId = href.substring(1);
          const targetEl = document.getElementById(targetId);
          
          if (targetEl) {
            e.preventDefault();
            // 2. 执行平滑滚动
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
    
    // 点击黑色遮罩区域关闭
    wm.addEventListener('click', e => { if (e.target === wm) closeW(); });
    // 按 ESC 键关闭
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeW(); });
  }

  // ── 3. 内容随滚动浮现 (Intersection Observer) ──────────────────────
  // 这是让网站看起来“高级”的关键：内容进入视口时自动滑入
  const revealOptions = {
    threshold: 0.15, // 元素出现 15% 时触发
    rootMargin: "0px 0px -50px 0px" 
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // 动画只触发一次，触发后停止观察该元素
        revealObserver.unobserve(entry.target);
      }
    });
  }, revealOptions);

  // 自动绑定所有带 .reveal 类的元素
  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // ── 4. 导航栏滚动变色补丁 ──────────────────────────────────────────
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.style.background = 'rgba(0, 38, 20, 0.95)';
      nav.style.boxShadow = '0 4px 30px rgba(0,0,0,0.3)';
    } else {
      nav.style.background = 'rgba(0, 38, 20, 0.8)';
      nav.style.boxShadow = 'none';
    }
  }, { passive: true });

})();
