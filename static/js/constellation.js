/* Project constellation — reads PROJECTS/SKILLS defined in index.html */
(function(){
  "use strict";
  if (typeof PROJECTS === "undefined") return;

  var wrap = document.getElementById("constellation");
  if (!wrap) return;

  var W = 720, H = 420;
  var svgNS = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.setAttribute("class", "const-svg");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Project and technology constellation");

  var centerX = W/2, centerY = H/2;
  var projects = PROJECTS.slice(0, 6);
  var techSet = {};
  projects.forEach(function(p){ p.tech.forEach(function(t){ techSet[t] = true; }); });
  var techs = Object.keys(techSet);

  var nodes = [];
  /* project nodes on inner ring */
  projects.forEach(function(p, i){
    var a = (i / projects.length) * Math.PI * 2 - Math.PI/2;
    var r = 120;
    nodes.push({id:"p:"+p.id, label:p.t, kind:"project", x:centerX + Math.cos(a)*r, y:centerY + Math.sin(a)*r, project:p});
  });
  /* tech nodes on outer ring */
  techs.forEach(function(t, i){
    var a = (i / techs.length) * Math.PI * 2 - Math.PI/2 + 0.3;
    var r = 185;
    nodes.push({id:"t:"+t, label:t, kind:"tech", x:centerX + Math.cos(a)*r, y:centerY + Math.sin(a)*r, tech:t});
  });

  var edges = [];
  projects.forEach(function(p){
    p.tech.forEach(function(t){
      edges.push({a:"p:"+p.id, b:"t:"+t});
    });
  });

  var byId = {};
  nodes.forEach(function(n){ byId[n.id] = n; });

  /* draw edges */
  edges.forEach(function(e){
    var A = byId[e.a], B = byId[e.b];
    if (!A || !B) return;
    var line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", A.x); line.setAttribute("y1", A.y);
    line.setAttribute("x2", B.x); line.setAttribute("y2", B.y);
    line.dataset.a = e.a; line.dataset.b = e.b;
    svg.appendChild(line);
  });

  /* draw nodes */
  nodes.forEach(function(n){
    var g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "node"); g.dataset.id = n.id;

    var c = document.createElementNS(svgNS, "circle");
    c.setAttribute("cx", n.x); c.setAttribute("cy", n.y);
    c.setAttribute("r", n.kind === "project" ? 12 : 8);
    c.setAttribute("fill", n.kind === "project" ? "var(--acc)" : "var(--panel-2)");
    c.setAttribute("stroke", n.kind === "project" ? "var(--acc)" : "var(--line-2)");
    c.setAttribute("stroke-width", "1.5");
    g.appendChild(c);

    var t = document.createElementNS(svgNS, "text");
    t.setAttribute("x", n.x); t.setAttribute("y", n.y - 18);
    t.setAttribute("text-anchor", "middle");
    t.textContent = n.kind === "project" ? shorten(n.label) : n.label;
    g.appendChild(t);

    g.addEventListener("click", function(){ select(n.id); });
    g.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(n.id); } });
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", n.kind + ": " + n.label);

    svg.appendChild(g);
  });

  function shorten(s){ return s.length > 22 ? s.slice(0,20) + "…" : s; }

  var out = document.getElementById("constOut");
  function select(id){
    svg.querySelectorAll("line").forEach(function(l){
      l.parentNode.classList && l.parentNode.classList.remove && l.parentNode.classList.remove("hl");
      l.style.opacity = (l.dataset.a === id || l.dataset.b === id) ? "1" : "0.15";
    });
    svg.querySelectorAll(".node").forEach(function(n){
      n.style.opacity = (n.dataset.id === id) ? "1" : "0.55";
    });
    var node = byId[id];
    out.innerHTML = "";
    if (!node) return;
    if (node.kind === "project") {
      var p = node.project;
      out.innerHTML =
        "<h3>" + escapeHtml(p.t) + "</h3>" +
        "<p>" + escapeHtml(p.p) + "</p>" +
        "<p class='mono lvl'>" + escapeHtml(p.s) + "</p>" +
        "<p>Technologies: " + p.tech.map(escapeHtml).join(", ") + "</p>" +
        "<p><a href='#p-" + p.id + "'>Open case study</a></p>";
    } else {
      var users = projects.filter(function(p){ return p.tech.indexOf(node.tech) > -1; });
      out.innerHTML =
        "<h3>" + escapeHtml(node.tech) + "</h3>" +
        "<p>Used in " + users.length + " project(s):</p>" +
        "<ul>" + users.map(function(p){
          return "<li><a href='#p-" + p.id + "'>" + escapeHtml(p.t) + "</a></li>";
        }).join("") + "</ul>";
    }
    out.focus();
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
    });
  }

  wrap.appendChild(svg);
})();
