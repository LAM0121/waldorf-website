/**
 * scroll-engine.js - 修复版
 * 确保滑动顺畅且不连跳
 */
(function () {
  'use strict';

  const PAGES = Array.from(document.querySelectorAll('.page'));
  const WRAP  = document.getElementById('scroll-wrap');
  if (!WRAP || PAGES.length === 0) return;

  let cur = 0;
  let isAnimating = false; // 动画锁
  
  const ANIM_MS = 600; // 缩短动画时间，提高响应感
  const EASE    = 'cubic-bezier(0.25, 1, 0.5, 1)';

  function vh() {
    return window.innerHeight; // 基础高度获取
  }

  function goTo(i) {
    if (i < 0 || i >= PAGES.length || isAnimating) return;

    isAnimating = true;
    cur = i;

    const offset = -i * vh();
    WRAP.style.transition = `transform ${ANIM_MS}ms ${EASE}`;
    WRAP.style.transform  = `translateY(${offset}px)`;

    // 更新导航点（如果有）
    document.querySelectorAll('a[data-page]').forEach((a, idx) => {
      a.classList.toggle('active', idx === i);
    });

    // 600ms 后准时解锁
    setTimeout(() => {
      isAnimating = false;
    }, ANIM_MS + 50); 
  }

  // --- 触摸处理 ---
  let ts = 0; 

  window.addEventListener('touchstart', e => {
    ts = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', e => {
    if (isAnimating) return;

    const te = e.changedTouches[0].clientY;
    const dy = ts - te; // 滑动距离

    // 只要滑动超过 50px 就触发翻页
    if (Math.abs(dy) > 50) {
      goTo(dy > 0 ? cur + 1 : cur - 1);
    }
  }, { passive: true });

  // --- 滚轮处理 ---
  let wheelTimer = null;
  window.addEventListener('wheel', e => {
    if (isAnimating) return;
    
    // 简单的防抖，防止滚轮过灵敏
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      if (Math.abs(e.deltaY) > 5) {
        goTo(e.deltaY > 0 ? cur + 1 : cur - 1);
      }
    }, 50);
  }, { passive: false });

  // 暴露给点击事件
  window.routerGoTo = (i) => goTo(i);

  // 初始化位置
  window.addEventListener('resize', () => {
    WRAP.style.transition = 'none';
    WRAP.style.transform  = `translateY(${-cur * vh()}px)`;
  });

})();
