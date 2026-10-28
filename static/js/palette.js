/* Command palette — Ctrl/Cmd+K */
(function(){
  "use strict";
  var backdrop = null, input = null, list = null, items = [], filtered = [], idx = 0;

  function sectionLinks(){
    var out = [];
    document.querySelectorAll("#navList a").forEach(function(a){
      out.push({
        label: a.textContent.trim(),
        group: "Section",
        href: a.getAttribute("href"),
        hint: a.getAttribute("href")
      });
    });
    out.push({label:"GitHub: anogola8", group:"Link", href:"https://github.com/anogola8", hint:"↗"});
    out.push({label:"Print CV", group:"Action", action:function(){ window.print(); }, hint:"⌘P"});
    out.push({label:"Toggle theme", group:"Action", action:function(){
      var d = document.documentElement;
      var cur = d.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      var nxt = cur === "dark" ? "light" : "dark";
      d.setAttribute("data-theme", nxt);
      try { localStorage.setItem("theme", nxt); } catch(e){}
    }, hint:"T"});
    out.push({label:"Copy email", group:"Action", action:function(){
      var a = document.querySelector('a[href^="mailto:"]');
      var addr = a ? a.getAttribute("href").replace(/^mailto:/,"") : "";
      if (!addr) { window.dwToast("No email configured in the page"); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(addr).then(function(){ window.dwToast("Copied: " + addr); });
    }, hint:"@"});
    return out;
  }

  function build(){
    if (backdrop) return;
    backdrop = document.createElement("div");
    backdrop.className = "cmdk-backdrop";
    backdrop.innerHTML =
      '<div class="cmdk" role="dialog" aria-modal="true" aria-label="Command palette">' +
        '<input type="text" placeholder="Jump to section, run an action…" autocomplete="off" aria-label="Search commands">' +
        '<ul role="listbox"></ul>' +
      '</div>';
    document.body.appendChild(backdrop);

    input = backdrop.querySelector("input");
    list  = backdrop.querySelector("ul");
    items = sectionLinks();

    input.addEventListener("input", filter);
    input.addEventListener("keydown", onKey);
    backdrop.addEventListener("click", function(e){ if (e.target === backdrop) close(); });
  }

  function filter(){
    var q = input.value.trim().toLowerCase();
    filtered = !q ? items.slice() : items.filter(function(it){
      return it.label.toLowerCase().indexOf(q) > -1 || it.group.toLowerCase().indexOf(q) > -1;
    });
    idx = 0;
    render();
  }

  function render(){
    list.innerHTML = "";
    if (!filtered.length) {
      var d = document.createElement("div");
      d.className = "cmdk-empty"; d.textContent = "No matches";
      list.appendChild(d);
      return;
    }
    filtered.forEach(function(it, i){
      var li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", i === idx ? "true" : "false");
      li.innerHTML = '<span>' + escape(it.label) + '</span>' +
                     '<span class="kbd">' + escape(it.hint || "") + '</span>';
      li.addEventListener("mouseenter", function(){ idx = i; paint(); });
      li.addEventListener("click", function(){ choose(it); });
      list.appendChild(li);
    });
  }
  function paint(){
    Array.prototype.forEach.call(list.children, function(li, i){
      li.setAttribute("aria-selected", i === idx ? "true" : "false");
    });
  }
  function onKey(e){
    if (e.key === "ArrowDown") { e.preventDefault(); idx = Math.min(idx + 1, filtered.length - 1); paint(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); idx = Math.max(idx - 1, 0); paint(); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[idx]) choose(filtered[idx]); }
    else if (e.key === "Escape") { close(); }
  }
  function choose(it){
    close();
    if (it.action) { it.action(); return; }
    if (it.href && it.href.charAt(0) === "#") {
      var el = document.querySelector(it.href);
      if (el) { el.scrollIntoView({behavior:"smooth",block:"start"}); }
    } else if (it.href) { window.open(it.href, "_blank", "noopener"); }
  }
  function open(){
    build(); backdrop.classList.add("open"); input.value = ""; filter(); setTimeout(function(){ input.focus(); }, 20);
  }
  function close(){
    if (backdrop) backdrop.classList.remove("open");
  }

  document.addEventListener("keydown", function(e){
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); }
    else if (e.key === "Escape") close();
  });

  function escape(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
    });
  }

  window.dwOpenPalette = open;
})();
