"use strict";

/* =========================================================
   This file replaces the inline <script> from the old index.html
   ========================================================= */

// ===== 1. Hash Chain Demo =====
var SEED=[["Member A contributes","500"],["Member B contributes","500"],["Loan to Member C","300"],["Repayment from C","320"]];
var entries;
function hex(buf){return Array.prototype.map.call(new Uint8Array(buf),function(b){return ("0"+b.toString(16)).slice(2>0?-2:0)}).join("")}
async function sha(s){return hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))}
async function chainHashes(list){var out=[],prev="0".repeat(64);for(var i=0;i<list.length;i++){prev=await sha(prev+"|"+list[i].d+"|"+list[i].a);out.push(prev)}return out}
async function renderChain(){
  var good=window.__good,now=await chainHashes(entries),box=document.getElementById("chain");if(!box)return;box.textContent="";var broken=-1;
  entries.forEach(function(e,i){var bad=good&&now[i]!==good[i];if(bad&&broken<0)broken=i;
    var inp=document.createElement("input");inp.type="number";inp.min="0";inp.value=e.a;inp.setAttribute("aria-label","Amount for entry "+(i+1));inp.oninput=function(){e.a=String(Math.max(0,parseInt(inp.value,10)||0));renderChain()};
    
    var card=document.createElement("div");
    card.className="card blk"+(bad?" bad":"");
    
    var title=document.createElement("div");
    title.className="mono";
    title.textContent="# "+(i+1)+(bad?" ✗ broken":" ✓ valid");
    
    var desc=document.createElement("p");
    desc.textContent=e.d;
    
    var hash=document.createElement("div");
    hash.className="hash";
    hash.textContent=now[i];
    
    card.appendChild(title);card.appendChild(desc);card.appendChild(inp);card.appendChild(hash);
    box.appendChild(card);
  });
  
  var msg=document.getElementById("chainMsg");
  if(msg){
    msg.className=broken<0?"ok":"bad-t";
    msg.textContent=broken<0?"Chain intact: every hash matches the original record.":"Tampering detected at entry "+(broken+1)+". Every later hash no longer matches.";
  }
}
async function initChain(){entries=SEED.map(function(s){return {d:s[0],a:s[1]}});window.__good=await chainHashes(entries);renderChain()}

var resetBtn = document.getElementById("chainReset");
if(resetBtn) resetBtn.onclick = initChain;
if(window.crypto&&crypto.subtle) initChain();

// ===== 2. Opportunities Panel =====
var OPPS = [
 {k:"Internships",on:true},{k:"Graduate / entry-level roles",on:true},{k:"Freelance projects",on:true},
 {k:"Open-source collaboration",on:false},{k:"Hackathons and innovation programs",on:true},{k:"Technical partnerships",on:false}
];

function renderOpps(){
  var box=document.getElementById("oppList");if(!box)return;box.textContent="";
  OPPS.forEach(function(o,i){
    var cb=document.createElement("input");cb.type="checkbox";cb.id="o"+i;cb.checked=o.on;cb.onchange=function(){o.on=cb.checked;renderOpps()};
    
    var label=document.createElement("label");label.htmlFor="o"+i;label.textContent=o.k;
    
    var tag=document.createElement("span");tag.className="tag";tag.style.marginLeft="auto";tag.textContent=o.on?"Open":"Not now";
    
    var row=document.createElement("div");row.className="sw";row.appendChild(cb);row.appendChild(label);row.appendChild(tag);
    box.appendChild(row);
  });
  
  var on=OPPS.filter(function(o){return o.on}).map(function(o){return o.k});
  var summary=document.getElementById("seekSummary");
  if(summary) summary.textContent=on.length?on.join(", "):"Not currently seeking opportunities";
}
renderOpps();

// ===== 3. Timeline + Notes (Homepage) =====
var TIMELINE=[["Expected 2027","Graduation, BSc Business Information Technology, Meru University of Science and Technology"],["Date to add","2nd Vice Chairperson, UFA Kenya (digital and communications work)"],["Date to add","Built and deployed the UFA Kenya website"],["Date to add","Developed Study Pro as the CCS 3353 research project"],["Date to add","KDF EDMS: schema, architecture and Django build under way"],["Date to add","TrustLedger proposal written"]];
var tl = document.getElementById("tl");
if(tl){
  TIMELINE.forEach(function(t){
    var li=document.createElement("li");li.style.padding="0 0 18px 18px";
    var when=document.createElement("div");when.className="mono lvl";when.textContent=t[0];
    var what=document.createElement("div");what.textContent=t[1];
    li.appendChild(when);li.appendChild(what);tl.appendChild(li);
  });
}

// ===== 4. Project Connection Map =====
function initConnectionMap() {
  if(typeof PROJECTS === "undefined") return;
  var mapP = document.getElementById("mapP");
  var mapT = document.getElementById("mapT");
  var mapOut = document.getElementById("mapOut");
  if(!mapP || !mapT || !mapOut) return;

  function uniq(a){return a.filter(function(v,i){return a.indexOf(v)===i})}
  var TECHS=uniq([].concat.apply([],PROJECTS.map(function(p){return p.tech}))).sort();
  
  function showMap(kind,name){
    mapOut.textContent="";
    if(kind==="p"){
      var p=PROJECTS.filter(function(x){return x.t===name})[0];
      var h=document.createElement("h3");h.textContent=p.t+" ("+p.s+")";mapOut.appendChild(h);
      var t=document.createElement("p");t.textContent="Technologies: "+p.tech.join(", ");mapOut.appendChild(t);
      var sk=document.createElement("p");sk.textContent="Skills shown: (linked in full skills view)";mapOut.appendChild(sk);
    } else {
      var h=document.createElement("h3");h.textContent=name;mapOut.appendChild(h);
      var ps=PROJECTS.filter(function(x){return x.tech.indexOf(name)>-1});
      var t=document.createElement("p");t.textContent="Used in "+ps.length+" project(s):";mapOut.appendChild(t);
      ps.forEach(function(x){
        var pTag=document.createElement("p");
        var a=document.createElement("a");a.href="/projects/"+x.slug+"/";a.textContent=x.t;
        var s=document.createElement("span");s.textContent=" ("+x.s+")";
        pTag.appendChild(a);pTag.appendChild(s);mapOut.appendChild(pTag);
      });
    }
    mapOut.focus();
  }

  PROJECTS.forEach(function(p){
    var b=document.createElement("button");b.className="btn";b.type="button";b.style.margin="0 6px 6px 0";b.textContent=p.t;
    b.onclick=function(){showMap("p",p.t)};mapP.appendChild(b);
  });
  TECHS.forEach(function(t){
    var b=document.createElement("button");b.className="btn";b.type="button";b.style.margin="0 6px 6px 0";b.textContent=t;
    b.onclick=function(){showMap("t",t)};mapT.appendChild(b);
  });
}
initConnectionMap();
