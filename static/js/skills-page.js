(function(){
  "use strict";
  if (typeof SKILLS === "undefined" || typeof PROJECTS === "undefined") return;

  function uniq(a){ return a.filter(function(v,i){ return a.indexOf(v) === i; }); }

  var sq = document.getElementById("sq");
  var sc = document.getElementById("sc");
  var list = document.getElementById("skillList");
  var detail = document.getElementById("skillDetail");
  var selected = null;

  uniq(SKILLS.map(function(s){ return s.c; })).forEach(function(c){
    var o = document.createElement("option"); o.value = c; o.textContent = c; sc.appendChild(o);
  });

  function render(){
    var q = sq.value.toLowerCase();
    var cat = sc.value;
    list.innerHTML = "";
    var items = SKILLS.filter(function(s){
      return (!cat || s.c === cat) && (!q || s.n.toLowerCase().indexOf(q) > -1);
    });
    if (!items.length){
      var p = document.createElement("p"); p.textContent = "No skills match.";
      list.appendChild(p); return;
    }
    items.forEach(function(s){
      var b = document.createElement("button");
      b.type = "button";
      b.className = "card skill";
      b.setAttribute("aria-pressed", selected === s.n ? "true" : "false");
      var strong = document.createElement("strong"); strong.textContent = s.n;
      var lvl = document.createElement("div"); lvl.className = "lvl"; lvl.textContent = s.l;
      var cat2 = document.createElement("div"); cat2.style.color = "var(--mut)"; cat2.style.fontSize = ".85rem"; cat2.textContent = s.c;
      b.appendChild(strong); b.appendChild(lvl); b.appendChild(cat2);
      b.addEventListener("click", function(){
        selected = s.n; render(); showDetail(s);
      });
      list.appendChild(b);
    });
  }

  function showDetail(s){
    detail.innerHTML = "";
    var h = document.createElement("h3"); h.textContent = s.n + " — " + s.l; detail.appendChild(h);
    if (!s.p.length){
      var p = document.createElement("p");
      p.textContent = "No project evidence yet. This level is self-assessed.";
      detail.appendChild(p);
      return;
    }
    var ul = document.createElement("ul");
    s.p.forEach(function(id){
      var proj = PROJECTS.filter(function(x){ return x.id === id; })[0];
      if (!proj) return;
      var li = document.createElement("li");
      var a = document.createElement("a"); a.href = "/projects/#p-" + id; a.textContent = proj.t;
      li.appendChild(a);
      li.appendChild(document.createTextNode(" (" + proj.s + ")"));
      ul.appendChild(li);
    });
    detail.appendChild(ul);
    detail.focus();
  }

  sq.addEventListener("input", render);
  sc.addEventListener("change", render);
  render();
})();
