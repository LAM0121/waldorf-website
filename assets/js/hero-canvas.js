/**
 * hero-canvas.js
 * Canvas 2D 全球金融网络动画
 * 在 #heroCanvas 上渲染旋转地球 ↔ 平面地图的过渡效果
 */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  const COLORS = {
    bg: '#002614',
    accent: '#c8a84b',
    accentBright: '#fff2cc',
  };

  const cities = [
    { name: 'TOKYO',       lon: 139,  lat: 35  },
    { name: 'SHANGHAI',    lon: 121,  lat: 31  },
    { name: 'HONG KONG',   lon: 114,  lat: 22  },
    { name: 'SINGAPORE',   lon: 103,  lat: 1   },
    { name: 'DUBAI',       lon: 55,   lat: 25  },
    { name: 'LONDON',      lon: 0,    lat: 51  },
    { name: 'FRANKFURT',   lon: 8,    lat: 50  },
    { name: 'NEW YORK',    lon: -74,  lat: 40  },
    { name: 'CHICAGO',     lon: -87,  lat: 41  },
    { name: 'LOS ANGELES', lon: -118, lat: 34  },
  ];

  let transition = 0, targetTransition = 0;
  setInterval(() => { targetTransition = targetTransition === 0 ? 1 : 0; }, 8000);

  function resize() {
  // 获取设备像素比（Retina 屏通常为 2 或 3）
  const dpr = window.devicePixelRatio || 1;
  W = window.innerWidth;
  H = window.innerHeight;
  
  // 设置 Canvas 物理像素
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  
  // 缩放上下文，让后续绘制代码依然使用逻辑像素坐标
  ctx.scale(dpr, dpr);
}
  window.addEventListener('resize', resize, { passive: true });
  resize();

  function getCoords(lon, lat, time) {
    const radius = Math.min(W, H) * 0.26;
    const rot = time * 0.003;
    const rl  = (lon * Math.PI / 180) + rot;
    const rla = lat * Math.PI / 180;
    const x3  = W / 2 + radius * Math.cos(rla) * Math.sin(rl);
    const y3  = H / 2 - radius * Math.sin(rla) - 100;
    const z3  = radius * Math.cos(rla) * Math.cos(rl);
    const x2  = W / 2 + (lon / 180) * (W * 0.45);
    const y2  = H / 2 - (lat / 90) * (H * 0.35) - 100;
    return {
      x: x3 + (x2 - x3) * transition,
      y: y3 + (y2 - y3) * transition,
      z: z3,
      alpha: (z3 + radius) / (radius * 2)
    };
  }

  let animPaused = false;
  document.addEventListener('visibilitychange', () => { animPaused = document.hidden; });

  function render() {
    if (animPaused) { requestAnimationFrame(render); return; }

    const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W);
    bg.addColorStop(0, '#003a22');
    bg.addColorStop(1, COLORS.bg);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    transition += (targetTransition - transition) * 0.04;
    t++;

    ctx.save();
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const p1 = getCoords(cities[i].lon, cities[i].lat, t);
        const p2 = getCoords(cities[j].lon, cities[j].lat, t);
        if (transition > 0.5 || (p1.z > -60 && p2.z > -60)) {
          const d  = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          const op = (transition > 0.5 ? 0.15 : p1.alpha * 0.25) * (1 - d / (W * 0.6));
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(200,168,75,${op})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          const pt = (t * 0.008 + i) % 1;
          ctx.fillStyle = COLORS.accent;
          ctx.shadowBlur = 12;
          ctx.shadowColor = COLORS.accent;
          ctx.beginPath();
          ctx.arc(p1.x + (p2.x - p1.x) * pt, p1.y + (p2.y - p1.y) * pt, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }
    ctx.restore();

    cities
      .map((city, i) => ({ city, i, pos: getCoords(city.lon, city.lat, t) }))
      .sort((a, b) => a.pos.z - b.pos.z)
      .forEach(({ city, i, pos }) => {
        if (transition > 0.5 || pos.z > -120) {
          ctx.save();
          const da = transition > 0.5 ? 1 : Math.max(0.3, pos.alpha);
          const ds = transition > 0.5 ? 1 : (0.6 + pos.alpha * 0.4);
          ctx.globalAlpha = da;
          ctx.fillStyle = COLORS.accent;
          ctx.shadowBlur = 10;
          ctx.shadowColor = COLORS.accent;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 4 * ds, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          const r = (8 + Math.sin(t * 0.06 + i) * 6) * ds;
          ctx.strokeStyle = COLORS.accent;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
          ctx.stroke();
          const fs = transition > 0.5 ? 11 : Math.max(8, 11 * ds);
          ctx.fillStyle = transition > 0.5 ? '#fff' : COLORS.accentBright;
          ctx.font = `bold ${fs}px Arial`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#000';
          let ox = transition > 0.5 ? 15 : 12, oy = 5;
          ctx.textAlign = 'left';
          if (transition < 0.5) {
            if (pos.x > W * 0.6) { ctx.textAlign = 'right'; ox = -12; }
            if (pos.y < H * 0.4) oy = fs + 8;
          }
          ctx.fillText(city.name, pos.x + ox, pos.y + oy);
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      });

    requestAnimationFrame(render);
  }

  render();
})();
