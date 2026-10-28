(function(){
  "use strict";
  if (typeof NOTES === "undefined") return;
  var list = document.getElementById("notesList");
  if (!list) return;
  NOTES.forEach(function(n){
    var card = document.createElement("article");
    card.className = "card note-card";

    var meta = document.createElement("div"); meta.className = "note-meta mono"; meta.textContent = n.date;
    var title = document.createElement("h3"); title.textContent = n.title;
    var sum = document.createElement("p"); sum.style.color = "var(--mut)"; sum.textContent = n.summary;
    var more = document.createElement("a"); more.className = "note-more mono"; more.href = "/notes/" + n.id + "/"; more.textContent = "Read note →";

    card.appendChild(meta); card.appendChild(title); card.appendChild(sum); card.appendChild(more);
    list.appendChild(card);
  });
})();
