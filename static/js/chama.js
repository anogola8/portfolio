/* ChamaTrust architecture explorer */
(function(){
  "use strict";
  var wrap = document.getElementById("chamaDiagram");
  if (!wrap) return;

  /* ---- EDITABLE: component data ---- */
  var COMPONENTS = [
    {
      id:"client",
      label:"Mobile client (offline)",
      x:70, y:60, w:200, h:90,
      layer:"client",
      why:"Field officers record transactions with no network. The UI must never block on a server call.",
      decisions:[
        "Local SQLite as source of truth; server is a reconciler, not an authority",
        "Operations are append-only — no edits, only reversals",
        "Every record is signed on-device before it leaves the phone"
      ],
      tradeoffs:"Append-only costs storage and means the UI must show reversal chains. Accepted: auditability > simplicity.",
      failures:"Device clock skew can reorder local entries. Mitigation: logical clocks (Lamport counters) stamped per chama."
    },
    {
      id:"ledger",
      label:"Local hash chain",
      x:320, y:60, w:200, h:90,
      layer:"storage",
      why:"Each record commits to the previous record's hash, so editing history breaks every later link.",
      decisions:[
        "SHA-256 over canonical JSON (sorted keys, fixed field order)",
        "Chain head is signed with the treasurer's Ed25519 key",
        "Chain per-chama, not per-user — matches the trust boundary"
      ],
      tradeoffs:"A hash chain proves order but not authorship. We add signatures on top; neither alone is enough.",
      failures:"If the signing key is compromised, an attacker can forge a new chain from any point. Mitigation: key rotation events are themselves chained."
    },
    {
      id:"signer",
      label:"Signature layer",
      x:320, y:190, w:200, h:90,
      layer:"crypto",
      why:"Detect tampering, but also prove who recorded what. Hash chains alone don't do that.",
      decisions:[
        "Ed25519 over ECDSA: smaller keys, faster verification, no random-nonce footgun",
        "One key per officer per device; keys escrowed with the chama admin",
        "Signatures are detached and stored alongside the record"
      ],
      tradeoffs:"Key management is the hard part. We accept the operational cost of onboarding and rotation because the integrity model demands it.",
      failures:"An officer who loses a device loses their key. Recovery requires a quorum of two other officers to re-attest. Documented, not yet built."
    },
    {
      id:"sync",
      label:"Sync layer",
      x:560, y:120, w:200, h:90,
      layer:"network",
      why:"When connectivity returns, both sides exchange chain heads and missing records — never blindly overwrite.",
      decisions:[
        "Exchange only chain heads first; fetch missing records only on mismatch",
        "Conflicts resolved by longest-chain-wins within a chama — the chain order IS the tiebreak",
        "Retry with exponential backoff; sync is idempotent"
      ],
      tradeoffs:"Longest-chain-wins is a heuristic, not a consensus protocol. Acceptable for chama-scale (3–20 officers); not suitable for adversarial networks.",
      failures:"Two officers offline for weeks could produce very long competing chains. Mitigation: reconciliation UI shows both branches and asks a human to confirm."
    },
    {
      id:"merkle",
      label:"Reconciliation engine",
      x:560, y:250, w:200, h:90,
      layer:"server",
      why:"Efficiently detect which specific records diverge between two chains — not just that they diverge.",
      decisions:[
        "Merkle tree over the chain, rebuilt nightly",
        "Compare root hashes; on mismatch, recurse down tree to the first divergent leaf",
        "O(log n) reconciliation instead of O(n) full replay"
      ],
      tradeoffs:"Extra compute on the server to maintain trees. Worth it: reconciliation windows shrink from minutes to seconds.",
      failures:"Merkle proofs don't reveal *why* divergence happened, only *where*. Human review is still required."
    },
    {
      id:"auditor",
      label:"Auditor view",
      x:70, y:250, w:200, h:90,
      layer:"client",
      why:"External auditors need a read-only, verifiable view without trusting the server.",
      decisions:[
        "Auditor downloads the signed chain and verifies hashes + signatures locally",
        "No server trust required for integrity verification",
        "Export is a single self-contained HTML file with inlined JS verifier"
      ],
      tradeoffs:"Offline verification means the auditor runs the math, not the server. Loses convenience, gains independence.",
      failures:"Does not protect against a compromised treasurer key. Documented as an explicit trust assumption."
    }
  ];

  /* ---- EDITABLE: connections between components ---- */
  var EDGES = [
    ["client","ledger"],
    ["ledger","signer"],
    ["ledger","sync"],
    ["signer","sync"],
    ["sync","merkle"],
    ["merkle","auditor"],
    ["client","auditor"]
  ];

  /* ---- render ---- */
  var svgNS = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 820 380");
  svg.setAttribute("class", "chama-svg");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "ChamaTrust architecture diagram");

  var byId = {};
  COMPONENTS.forEach(function(c){ byId[c.id] = c; });

  /* edges */
  EDGES.forEach(function(pair){
    var A = byId[pair[0]], B = byId[pair[1]];
    if (!A || !B) return;
    var l = document.createElementNS(svgNS, "line");
    l.setAttribute("x1", A.x + A.w/2); l.setAttribute("y1", A.y + A.h/2);
    l.setAttribute("x2", B.x + B.w/2); l.setAttribute("y2", B.y + B.h/2);
    l.dataset.a = pair[0]; l.dataset.b = pair[1];
    l.setAttribute("class", "edge");
    svg.appendChild(l);
  });

  /* nodes */
  COMPONENTS.forEach(function(c){
    var g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "chama-node layer-" + c.layer);
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", c.label);
    g.dataset.id = c.id;

    var r = document.createElementNS(svgNS, "rect");
    r.setAttribute("x", c.x); r.setAttribute("y", c.y);
    r.setAttribute("width", c.w); r.setAttribute("height", c.h);
    r.setAttribute("rx", "10");
    g.appendChild(r);

    var t = document.createElementNS(svgNS, "text");
    t.setAttribute("x", c.x + c.w/2);
    t.setAttribute("y", c.y + c.h/2 + 4);
    t.setAttribute("text-anchor", "middle");
    t.textContent = c.label;
    g.appendChild(t);

    function activate(){ select(c.id); }
    g.addEventListener("click", activate);
    g.addEventListener("keydown", function(e){
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
    });

    svg.appendChild(g);
  });

  var out = document.getElementById("chamaOut");

  function escapeHtml(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(x){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[x];
    });
  }

  function select(id){
    svg.querySelectorAll(".chama-node").forEach(function(n){
      n.classList.toggle("selected", n.dataset.id === id);
      n.classList.toggle("dimmed", n.dataset.id !== id);
    });
    svg.querySelectorAll(".edge").forEach(function(e){
      var on = (e.dataset.a === id || e.dataset.b === id);
      e.classList.toggle("hl", on);
      e.classList.toggle("dim", !on);
    });

    var c = byId[id];
    if (!c) return;
    out.innerHTML =
      "<h3>" + escapeHtml(c.label) + "</h3>" +
      "<p><strong>Why this exists.</strong> " + escapeHtml(c.why) + "</p>" +
      "<p><strong>Design decisions</strong></p>" +
      "<ul>" + c.decisions.map(function(d){ return "<li>" + escapeHtml(d) + "</li>"; }).join("") + "</ul>" +
      "<p><strong>Trade-offs</strong> " + escapeHtml(c.tradeoffs) + "</p>" +
      "<p><strong>Failure modes</strong> " + escapeHtml(c.failures) + "</p>";
    out.focus();
  }

  wrap.appendChild(svg);

  /* first selection so the panel isn't empty */
  var first = svg.querySelector(".chama-node");
  if (first) select(first.dataset.id);
})();
