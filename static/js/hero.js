/* Hero constellation — lightweight particle network on canvas */
(function(){
  "use strict";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.getElementById("heroCanvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, nodes = [], mouse = {x: -9999, y: -9999, active: false};
  var LINK = 130, MOUSE_R = 180, COUNT_BASE = 46;
  var raf = null, running = false;

  function resize(){
    var r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.max(20, Math.min(COUNT_BASE, Math.floor(W * H / 14000)));
    nodes = [];
    for (var i = 0; i < count; i++){
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1.2 + Math.random() * 1.6
      });
    }
  }

  function css(name){
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function tick(){
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    var accent = css("--acc") || "#3fe0f0";
    var lineCol = accent;

    for (var i = 0; i < nodes.length; i++){
      var n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      if (mouse.active){
        var dx = n.x - mouse.x, dy = n.y - mouse.y;
        var d = Math.sqrt(dx*dx + dy*dy);
        if (d < MOUSE_R && d > 0){
          var f = (MOUSE_R - d) / MOUSE_R * 0.35;
          n.x += (dx / d) * f;
          n.y += (dy / d) * f;
        }
      }

      for (var j = i + 1; j < nodes.length; j++){
        var m = nodes[j];
        var ddx = n.x - m.x, ddy = n.y - m.y;
        var dd = ddx*ddx + ddy*ddy;
        if (dd < LINK * LINK){
          var alpha = (1 - Math.sqrt(dd) / LINK) * 0.35;
          ctx.strokeStyle = hexA(lineCol, alpha);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
        }
      }

      ctx.fillStyle = hexA(lineCol, 0.9);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }

  function hexA(hex, a){
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function(c){return c+c;}).join("");
    if (hex.length !== 6) return "rgba(63,224,240," + a + ")";
    var r = parseInt(hex.substr(0,2),16);
    var g = parseInt(hex.substr(2,2),16);
    var b = parseInt(hex.substr(4,2),16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }

  function start(){ if (!running){ running = true; tick(); } }
  function stop(){ running = false; if (raf){ cancelAnimationFrame(raf); raf = null; } }

  canvas.addEventListener("pointermove", function(e){
    var r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
  });
  canvas.addEventListener("pointerleave", function(){ mouse.active = false; mouse.x = -9999; mouse.y = -9999; });

  window.addEventListener("resize", resize);

  /* pause when offscreen */
  if ("IntersectionObserver" in window){
    new IntersectionObserver(function(entries){
      entries.forEach(function(en){ en.isIntersecting ? start() : stop(); });
    }, {threshold: 0}).observe(canvas);
  } else { start(); }

  resize();
  start();
})();
