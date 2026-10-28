/* Bokeh Dust Drift — Parallax Particle Field */
(function() {
  "use strict";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.getElementById("bgCanvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var W = 0, H = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var mouse = { x: -9999, y: -9999, active: false };
  var time = 0;

  // === CONFIGURATION (Matching your description) ===
  var CONFIG = {
    colors: ["#3fe0f0", "#7d9bff", "#ffffff", "#ffb866"], // Cyan, Blue, White, Warm Gold
    density: 0.6,       // 0.1 to 1
    speed: 0.5,         // Slow premium drift
    size: 0.7,          // Scale of the particles
    angle: 90,          // Upward rising dust
    turbulence: 0.4,    // Gentle wind
    glow: 0.8,          // Brightness
    twinkle: 0.5,       // Pulsing
    mouse: 0.8          // Repulsion strength
  };

  var layers = [];

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Generate 3 layers of particles
    layers = [
      { count: Math.floor(W * H / 20000 * CONFIG.density), depth: 0.3, maxSize: 1.5, blur: 0 }, // Background
      { count: Math.floor(W * H / 40000 * CONFIG.density), depth: 0.6, maxSize: 3, blur: 0 },   // Midground
      { count: Math.floor(W * H / 120000 * CONFIG.density), depth: 1.0, maxSize: 15, blur: 0 }  // Foreground Bokeh
    ];

    layers.forEach(function(layer, index) {
      layer.particles = [];
      for (var i = 0; i < layer.count; i++) {
        var isBokeh = index === 2;
        var color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
        
        layer.particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          size: (Math.random() * layer.maxSize + 0.5) * CONFIG.size,
          color: color,
          depth: layer.depth,
          // Add random wander
          vx: (Math.random() - 0.5) * CONFIG.speed,
          vy: (Math.random() - 0.5) * CONFIG.speed,
          phase: Math.random() * Math.PI * 2, // For twinkle
          // Anamorphic streak (only for some mid/foreground particles)
          streak: Math.random() > 0.8 && index > 0,
          // Foreground discs are heavily blurred
          blur: isBokeh ? Math.random() * 5 + 2 : 0 
        });
      }
    });
  }

  function hexA(hex, a) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function(c){return c+c;}).join("");
    var r = parseInt(hex.substr(0,2),16), g = parseInt(hex.substr(2,2),16), b = parseInt(hex.substr(4,2),16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }

  function tick() {
    time += 0.02 * CONFIG.speed;
    ctx.clearRect(0, 0, W, H);

    // 1. Draw Atmospheric Haze (Background Base)
    var haze = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W);
    haze.addColorStop(0, hexA(CONFIG.colors[1], 0.15)); // Center blue
    haze.addColorStop(1, "rgba(11, 18, 32, 0)");       // Fades to transparent
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, W, H);

    // 2. Draw layers
    layers.forEach(function(layer) {
      layer.particles.forEach(function(p) {
        // Movement based on angle
        var rad = CONFIG.angle * Math.PI / 180;
        var dx = Math.cos(rad) * p.depth * CONFIG.speed;
        var dy = Math.sin(rad) * p.depth * CONFIG.speed;

        // Turbulence (organic wander)
        var turbX = Math.sin(time * 0.5 + p.phase) * CONFIG.turbulence;
        var turbY = Math.cos(time * 0.3 + p.phase) * CONFIG.turbulence;

        p.x += p.vx + dx + turbX;
        p.y += p.vy + dy + turbY;

        // Wrap around edges
        if (p.x < -50) p.x = W + 50;
        if (p.x > W + 50) p.x = -50;
        if (p.y < -50) p.y = H + 50;
        if (p.y > H + 50) p.y = -50;

        // Mouse repulsion (parallax)
        if (mouse.active) {
          var mx = p.x - mouse.x;
          var my = p.y - mouse.y;
          var dist = Math.sqrt(mx*mx + my*my);
          var radius = 200 * p.depth; // Larger radius for foreground
          
          if (dist < radius && dist > 0) {
            var force = (radius - dist) / radius;
            // Foreground swings widest, background barely stirs
            p.x += (mx / dist) * force * (10 * p.depth) * CONFIG.mouse;
            p.y += (my / dist) * force * (10 * p.depth) * CONFIG.mouse;
          }
        }

        // Twinkle (brightness oscillation)
        var twinkleFactor = 1;
        if (p.depth < 0.8) { // Strongest on background
          twinkleFactor = 1 + Math.sin(time + p.phase) * 0.5 * CONFIG.twinkle;
        }

        // Draw Anamorphic Streak
        if (p.streak) {
          ctx.strokeStyle = hexA(p.color, 0.4 * twinkleFactor * CONFIG.glow);
          ctx.lineWidth = p.size * 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x - p.size * 4, p.y);
          ctx.lineTo(p.x + p.size * 4, p.y);
          ctx.stroke();
        }

        // Draw Particle
        ctx.fillStyle = hexA(p.color, 0.8 * twinkleFactor * CONFIG.glow);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    requestAnimationFrame(tick);
  }

  window.addEventListener("mousemove", function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener("mouseleave", function() {
    mouse.active = false;
  });

  window.addEventListener("resize", resize);
  resize();
  tick();
})();
