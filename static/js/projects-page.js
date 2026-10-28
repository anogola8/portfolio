(function(){
  "use strict";
  if (typeof PROJECTS === "undefined") return;

  function uniq(a){ return a.filter(function(v,i){ return a.indexOf(v) === i; }); }

  var fs = document.getElementById("fs");
  var ft = document.getElementById("ft");
  var q  = document.getElementById("q");
  var list = document.getElementById("projList");

  uniq(PROJECTS.map(function(p){ return p.s; })).forEach(function(s){
    var o = document.createElement("option"); o.value = s; o.textContent = s; fs.appendChild(o);
  });
  uniq([].concat.apply([], PROJECTS.map(function(p){ return p.tech; }))).sort().forEach(function(t){
    var o = document.createElement("option"); o.value = t; o.textContent = t; ft.appendChild(o);
  });

  function render(){
    var qq = q.value.toLowerCase();
    var fstatus = fs.value;
    var ftech = ft.value;
    list.innerHTML = "";
    var items = PROJECTS.filter(function(p){
      return (!fstatus || p.s === fstatus)
          && (!ftech || p.tech.indexOf(ftech) > -1)
          && (!qq || (p.t + " " + p.p).toLowerCase().indexOf(qq) > -1);
    });
    if (!items.length){
      var empty = document.createElement("p");
      empty.textContent = "No projects match those filters.";
      list.appendChild(empty);
      return;
    }
    items.forEach(function(p){
      var card = document.createElement("article");
      card.className = "card";
      card.id = "p-" + p.id;
      var pill = document.createElement("span");
      pill.className = "st" + (p.s === "Concept" ? " concept" : "");
      pill.textContent = p.s;
      var h = document.createElement("h3");
      h.textContent = p.t;
      var problem = document.createElement("p");
      problem.textContent = p.p;
      card.appendChild(pill); card.appendChild(h); card.appendChild(problem);

      if (p.isSynced) {
        var badge = document.createElement("div");
        badge.className = "mono";
        badge.style.cssText = "font-size:.75rem;color:var(--acc);margin-bottom:6px";
        badge.innerHTML = "● Live on GitHub · Updated " + p.lastUpdated;
        card.appendChild(badge);
      }

      var tags = document.createElement("div");
      p.tech.forEach(function(t){
        var tg = document.createElement("span"); tg.className = "tag"; tg.textContent = t; tags.appendChild(tg);
      });
      card.appendChild(tags);

      var actions = document.createElement("div");
      actions.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin-top:8px";
      var view = document.createElement("a");
      view.className = "btn p"; view.href = "/projects/" + (p.slug || p.id) + "/";
      view.textContent = "View case study";
      actions.appendChild(view);
      var quick = document.createElement("button");
      quick.className = "btn"; quick.type = "button";
      quick.textContent = "Quick view";
      quick.setAttribute("data-open-project", p.id);
      actions.appendChild(quick);
      card.appendChild(actions);

      list.appendChild(card);
    });
  }
  q.addEventListener("input", render);
  fs.addEventListener("change", render);
  ft.addEventListener("change", render);
  render();
})();


