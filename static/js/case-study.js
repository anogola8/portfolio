/* Case-study modal: opens #project-id from cards or deep links */
(function(){
  "use strict";
  if (typeof PROJECTS === "undefined") return;

  var dlg = document.getElementById("csDialog");
  if (!dlg || !dlg.showModal) return;

  var body = dlg.querySelector(".cs-body");
  var title = dlg.querySelector(".cs-title");
  var closeBtn = dlg.querySelector(".cs-close");
  var back = document.getElementById("csBackdrop");

  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
    });
  }

  function byId(id){ for (var i=0;i<PROJECTS.length;i++) if (PROJECTS[i].id === id) return PROJECTS[i]; return null; }

  function render(p){
    title.textContent = p.t;

    /* meta */
    var meta = [
      ["Status", p.s],
      ["Problem", p.p],
      ["Intended users", p.u]
    ];

    /* narrative */
    var narrative = [
      ["My contribution", p.c],
      ["Approach", p.approach],
      ["The hard part", p.hardPart],
      ["Result", p.result],
      ["What I learned", p.lessons]
    ];

    /* spec-sheet */
    var spec = [
      ["Main features", p.f && p.f.join("; ")],
      ["Security", p.sec],
      ["Current status", p.status],
      ["Next", p.future]
    ];

    function dl(rows){
      return "<dl>" + rows.filter(function(r){return r[1];}).map(function(r){
        return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>";
      }).join("") + "</dl>";
    }

    var decisions = "";
    if (p.decisions && p.decisions.length){
      decisions =
        "<section class='cs-decisions'><h3>Design decisions & trade-offs</h3><ul>" +
        p.decisions.map(function(d){ return "<li>" + esc(d) + "</li>"; }).join("") +
        "</ul></section>";
    }

    body.innerHTML =
      "<div class='cs-meta'>" + dl(meta) + "</div>" +
      "<section class='cs-narrative'>" + dl(narrative) + "</section>" +
      decisions +
      "<section class='cs-spec'><h3>Details</h3>" + dl(spec) + "</section>" +
      "<div class='cs-tags'>" + (p.tech || []).map(function(t){
        return "<span class='tag'>" + esc(t) + "</span>";
      }).join("") + "</div>" +
      (p.link ? "<p><a href='" + esc(p.link) + "' rel='noopener' target='_blank'>Source code ↗</a></p>" : "");
  }

  function open(id){
    var p = byId(id);
    if (!p) return;
    render(p);
    dlg.showModal();
    document.documentElement.style.overflow = "hidden";
    if (history.replaceState) history.replaceState(null, "", "#project-" + id);
  }

  function close(){
    dlg.close();
    document.documentElement.style.overflow = "";
    if (history.replaceState && location.hash.indexOf("#project-") === 0){
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  closeBtn.addEventListener("click", close);
  if (back) back.addEventListener("click", close);
  dlg.addEventListener("cancel", function(e){ e.preventDefault(); close(); });

  /* open from any link/button with data-open-project="<id>" */
  document.addEventListener("click", function(e){
    var t = e.target.closest ? e.target.closest("[data-open-project]") : null;
    if (t) { e.preventDefault(); open(t.getAttribute("data-open-project")); }
  });

  /* deep-link on load: #project-<id> */
  function fromHash(){
    var m = location.hash.match(/^#project-(.+)$/);
    if (m) open(m[1]);
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();
})();

