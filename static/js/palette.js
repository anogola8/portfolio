/* Command palette — Ctrl/Cmd+K Global Search */
(function(){
  "use strict";
  var backdrop = null, input = null, list = null, items = [], filtered = [], idx = 0;
  
  // Easter Egg variables
  var clickCount = 0;
  var clickTimer = null;

  function getSearchData(){
    var results = [];
    
    // 1. Add Sections
    document.querySelectorAll("#navList a").forEach(function(a){
      results.push({ label: a.textContent.trim(), group: "Section", href: a.getAttribute("href"), hint: "Navigate" });
    });

    // 2. Add Projects
    if (typeof PROJECTS !== "undefined") {
      PROJECTS.forEach(function(p) {
        results.push({ 
          label: p.t, 
          group: "Project", 
          href: "/projects/" + (p.slug || p.id) + "/", 
          hint: "Case Study" 
        });
      });
    }

    // 3. Add Notes
    if (typeof NOTES !== "undefined") {
      NOTES.forEach(function(n) {
        results.push({ 
          label: n.title, 
          group: "Note", 
          href: "/notes/" + n.id + "/", 
          hint: "Read" 
        });
      });
    }

    // 3.5. Add Ebooks
    if (typeof window.SEARCH_EBOOKS !== "undefined") {
      window.SEARCH_EBOOKS.forEach(function(b) {
        results.push({ label: b.label, group: b.group, href: b.href, hint: b.hint });
      });
    }

    // 3.6. Add Stories
    if (typeof window.SEARCH_STORIES !== "undefined") {
      window.SEARCH_STORIES.forEach(function(s) {
        results.push({ label: s.label, group: s.group, href: s.href, hint: s.hint });
      });
    }

    // 4. Add Actions
    results.push({ label:"Toggle theme", group:"Action", action:function(){
      var d = document.documentElement;
      var cur = d.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      var nxt = cur === "dark" ? "light" : "dark";
      d.setAttribute("data-theme", nxt);
      try { localStorage.setItem("theme", nxt); } catch(e){}
    }, hint:"Theme"});
    
    results.push({ label:"Download CV", group:"Action", href:"/cv/", hint:"Resume" });
    
    return results;
  }

  // ... (rest of the search and modal code) ...

  // Easter Egg Logic
  var cmdkBtn = document.getElementById("cmdkBtn");
  if (cmdkBtn) {
    cmdkBtn.addEventListener("click", function(e) {
      clickCount++;
      
      // If they click 5 times
      if (clickCount === 5) {
        window.location.href = "/manage-secret/";
      }
      
      // Reset counter if they stop clicking for 2 seconds
      clearTimeout(clickTimer);
      clickTimer = setTimeout(function() {
        clickCount = 0;
      }, 2000);
    });
  }

  document.addEventListener("keydown", function(e){
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); }
    else if (e.key === "Escape") close();
  });

  // ... (rest of the code) ...
})();
