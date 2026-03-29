/**
 * scroll-engine.js - 2024 增强防连跳优化版
 * ---------------------------------------------------------
 * 1. 引入 isAnimating 物理锁，彻底阻断动画期间的重复触发
 * 2. 提高滑动阈值 (80px)，过滤手指微动导致的误翻页
 * 3. 完美适配移动端动态视口 (Dynamic Viewport Height)
 * 4. 增加 Scroll-Wheel 防抖，适配 MacBook 触控板惯性
 */

(function () {
  'use strict';

  // 1. 元素获取
  const PAGES     = Array.from(document.querySelectorAll('.page'));
  const WRAP      = document.getElementById('scroll-wrap');
  const NAV_LINKS = Array.from(document.querySelectorAll('a[data-page]'));
  const PROG      = document.getElementById('progress-bar');
  const HAM       = document.getElementById('hamburger');
  const OVERLAY   = document.getElementById('mobile-overlay');

  // 2. 状态控制与参数设置
  let cur = 0;
  let isAnimating = false; // 核心翻页锁
  
  const ANIM_MS = 750;     // 翻页动画时长 (ms)
  const LOCK_MS = 850;     // 物理锁定时间 (ms)，需略大于 ANIM_MS 确保彻底停止
  const EASE    = 'cubic-bezier(0.16, 1, 0.3, 1)'; // 流畅指数曲线

  /** * 获取精准视口高度 
   * 使用 visualViewport 解决 iOS Safari 地址栏展开/收起导致的高度误差
   */
  function vh() {
    return window.visualViewport ? window.visualViewport.height : window.innerHeight;
  }

  /** * 更新 UI 状态 
   * 同步导航点、进度条及触发入场动画
   */
  function updateUI(i) {
    // A. 更新进度条
    if (PROG) {
      const per = ((i + 1) / PAGES.length) * 100;
      PROG.style.width = per + '%';
    }

    // B. 更新导航链接高亮
    NAV_LINKS.forEach((a, idx) => {
      a.classList.toggle('active', idx === i);
    });

    // C. 触发当前页面的 CSS 动画
    PAGES.forEach((page, idx) => {
      const reveals = page.querySelectorAll('.reveal');
      if (idx === i) {
        // 当前页：延迟 200ms 触发，等待翻页基本完成
        setTimeout(() => {
          reveals.forEach(el => el.classList.add('active'));
        }, 200);
      } else {
        // 非当前页：重置动画，以便下次进入时重新播放
        reveals.forEach(el => el.classList.remove('active'));
      }
    });
  }

  /** * 核心翻页执行函数 
   * @param {number} i 目标索引
   * @param {boolean} instant 是否立即跳转(无动画)
   */
  function goTo(i, instant = false) {
    if (i < 0 || i >= PAGES.length) return;
    if (isAnimating && !instant) return; // 关键：动画进行中直接拦截所有指令

    isAnimating = true;
    cur = i;

    const vh_val = vh();
    WRAP.style.transition = instant ? 'none' : `transform ${ANIM_MS}ms ${EASE}`;
    WRAP.style.transform  = `translateY(${-i * vh_val}px)`;

    // 动画计时器：结束后释放锁定，允许下一次滑动
    setTimeout(() => {
      isAnimating = false;
    }, instant ? 0 : LOCK_MS);

    updateUI(i);
  }

  // 3. 触摸滑动处理 (Touch Events)
  let ty, ttime;

  window.addEventListener('touchstart', e => {
    ty = e.touches[0].clientY;
    ttime = Date.now();
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    // 正在翻页动画时，禁止手指继续拉动产生的系统惯性
    if (isAnimating) e.preventDefault();
  }, { passive: false });

  window.addEventListener('touchend', e => {
    if (isAnimating) return;

    const dy = ty - e.changedTouches[0].clientY;
    const dt = Date.now() - ttime;

    /**
     * 判定逻辑优化：
     * 1. 快速掠过 (Flick)：距离 > 30px 且 时间极短 (< 250ms)
     * 2. 深度滑动 (Scroll)：距离 > 80px (大幅提高阈值，解决连跳)
     */
    const isFlick = Math.abs(dy) > 30 && dt < 250;
    const isScroll = Math.abs(dy) > 80;

    if (isFlick || isScroll) {
      goTo(dy > 0 ? cur + 1 : cur - 1);
    }
  }, { passive: true });

  // 4. 滚轮处理 (Mouse Wheel) - 针对 MacBook 触控板/高端鼠标优化
  let wheelTimer = null;
  window.addEventListener('wheel', e => {
    // 禁止默认的页面抖动
    if (e.cancelable) e.preventDefault();
    if (isAnimating) return;

    // 50ms 防抖：确保一次物理滚轮滑动只触发一次翻页指令
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      // 过滤微小滚轮抖动 (deltaY > 5)
      if (Math.abs(e.deltaY) > 5) {
        goTo(e.deltaY > 0 ? cur + 1 : cur - 1);
      }
    }, 50); 
  }, { passive: false });

  // 5. 键盘快捷键 (方向键/翻页键)
  window.addEventListener('keydown', e => {
    if (isAnimating) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      goTo(cur + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goTo(cur - 1);
    }
  });

  // 6. 导航链接点击处理 (支持移动端菜单自动关闭)
  document.querySelectorAll('a[data-page]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const targetPage = parseInt(a.getAttribute('data-page'));
      goTo(targetPage);

      // 如果移动端菜单打开着，点击后自动关闭
      if (OVERLAY && OVERLAY.classList.contains('open')) {
        OVERLAY.classList.remove('open');
        if (HAM) HAM.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // 7. 初始化与屏幕旋转自适应
  window.addEventListener('resize', () => {
    // 旋转屏幕或调整窗口大小时，立即校准位置，不显示动画
    const vh_val = vh();
    WRAP.style.transition = 'none';
    WRAP.style.transform  = `translateY(${-cur * vh_val}px)`;
  });

  // 暴露 API 给 ui.js 或其他脚本调用
  window.routerGoTo = (i) => goTo(i);

  // 启动：执行首次 UI 初始化
  updateUI(0);

})();
