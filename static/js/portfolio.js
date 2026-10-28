/* The Digital Workshop — interactions */
(function(){
  "use strict";

  /* ---- reveal on scroll ---- */
  var reveals = document.querySelectorAll("[data-reveal]");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, {rootMargin: "0px 0px -10% 0px", threshold: 0.05});
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add("in"); });
  }

  /* ---- card cursor glow ---- */
  document.querySelectorAll(".card").forEach(function(card){
    card.addEventListener("pointermove", function(ev){
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((ev.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      card.style.setProperty("--my", ((ev.clientY - r.top)  / r.height * 100).toFixed(1) + "%");
    });
  });

  /* ---- toast ---- */
  window.dwToast = function(msg, ms){
    var t = document.querySelector(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._t);
    t._t = setTimeout(function(){ t.classList.remove("show"); }, ms || 2400);
  };

  /* ---- copy-to-clipboard for [data-copy] ---- */
  document.querySelectorAll("[data-copy]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var text = btn.getAttribute("data-copy");
      var done = function(){ window.dwToast("Copied: " + text); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch(e){}
        document.body.removeChild(ta);
        done();
      }
    });
  });

  /* ---- last updated badge ---- */
  var stamp = document.querySelector("[data-last-updated]");
  if (stamp) {
    stamp.textContent = new Date(document.lastModified).toLocaleDateString(undefined,
      {year:"numeric",month:"short",day:"numeric"});
  }
})();
