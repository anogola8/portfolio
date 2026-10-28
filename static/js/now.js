/* Currently-building strip: rotates through a small, editable list */
(function(){
  "use strict";
  var el = document.getElementById("nowStrip");
  if (!el) return;

  /* Edit this list — truth only. Use a date string you can vouch for. */
  var ITEMS = [
    {tag:"Building", text:"Converting the KDF EDMS prototype from Figma into a functional Django app.", date:"2026"},
    {tag:"Studying", text:"Hash chains, digital signatures, and offline-first reconciliation for ChamaTrust.", date:"2026"},
    {tag:"Writing",  text:"Technical notes on M-Pesa Daraja integration and Supabase migration lessons.", date:"2026"}
  ];

  if (!ITEMS.length) { el.hidden = true; return; }
  var i = 0;
  function show(){
    var it = ITEMS[i % ITEMS.length];
    el.querySelector(".now-tag").textContent = it.tag;
    el.querySelector(".now-text").textContent = it.text;
    el.querySelector(".now-date").textContent = it.date;
    i++;
  }
  show();
  setInterval(show, 7000);
})();
