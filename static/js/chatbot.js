(function() {
  "use strict";

  var form = document.getElementById("chat-form");
  var input = document.getElementById("chat-input");
  var chatWindow = document.getElementById("chat-window");

  if (!form || !input || !chatWindow) return;

  // ==========================================
  // THE KNOWLEDGE BASE (Semantic Matching)
  // ==========================================
  var KNOWLEDGE = [
    {
      intent: "greeting",
      keywords: ["hello", "hi", "hey", "greetings", "morning", "afternoon"],
      reply: "Hello! I'm Jappy's AI assistant. I can tell you about his projects, his tech stack, his education, or how to contact him. What would you like to know?"
    },
    {
      intent: "python_django",
      keywords: ["python", "django", "backend", "api", "server", "rest"],
      reply: "Dericks specializes in <strong>Python and Django</strong>. He built the EDMS (a massive 63-table system) and developed secure REST APIs using Django REST Framework. He's also familiar with Express and Node.js."
    },
    {
      intent: "security",
      keywords: ["security", "secure", "auth", "login", "mfa", "2fa", "csrf", "hash", "crypto", "rate limit"],
      reply: "Security is a core focus. He implements <strong>Role-Based Access Control (RBAC)</strong>, CSRF protection, and rate-limiting. He has also built TOTP (Time-based One-Time Password) MFA flows for Django and uses cryptographic hash-chains for tamper detection."
    },
    {
      intent: "frontend",
      keywords: ["frontend", "front end", "ui", "ux", "design", "css", "html", "javascript", "react", "svelte"],
      reply: "On the frontend, he works with <strong>SvelteKit</strong> and <strong>React</strong>. He designs in Figma and translates those designs into responsive, accessible code. He also built the custom animated canvas backgrounds and the dark/light theme toggle on this very site."
    },
    {
      intent: "database",
      keywords: ["database", "sql", "mysql", "postgres", "supabase", "schema", "data", "model"],
      reply: "He has strong data-modelling skills. He designed a <strong>63-table normalised schema</strong> for the EDMS using MySQL. For UFA Kenya, he built and migrated the database to <strong>Supabase (PostgreSQL)</strong>."
    },
    {
      intent: "edms",
      keywords: ["edms", "Enterprise", "document", "enterprise"],
      reply: "The <strong>EDMS</strong> is a flagship project. It's a Django-based enterprise document management system. He converted a 52-screen Figma prototype into a working app with a custom user model, RBAC, and MFA."
    },
    {
      intent: "ufa",
      keywords: ["ufa", "kenya", "mpesa", "payment", "daraja", "civic"],
      reply: "The <strong>UFA Kenya website</strong> is a deployed civic platform. He built it with Node/Express and Supabase, and integrated the <strong>M-Pesa Daraja API</strong> for payments. He also solved a callback reliability issue on Render using a database retry queue."
    },
    {
      intent: "trustledger",
      keywords: ["trustledger", "gig", "attestation", "verify", "worker"],
      reply: "<strong>TrustLedger</strong> is a concept for verifiable work history. It allows informal and gig workers to hold digitally signed work attestations that anyone can verify via QR code without an account."
    },
    {
      intent: "chamatrust",
      keywords: ["chamatrust", "chama", "ledger", "sacco", "offline"],
      reply: "<strong>ChamaTrust</strong> is an offline-first audit ledger concept. It uses hash-chains and digital signatures to detect tampering in chama and SACCO records, solving the problem of unreliable connectivity in the field."
    },
    {
      intent: "availability",
      keywords: ["hire", "available", "internship", "job", "freelance", "open", "work", "opportunity", "role"],
      reply: "Dericks is currently seeking <strong>internships, entry-level roles, and freelance work</strong> in backend or full-stack development. He is based in Kenya and is open to remote opportunities globally."
    },
    {
      intent: "education",
      keywords: ["education", "degree", "university", "school", "study", "student", "graduate"],
      reply: "He is a final-year <strong>Business Information Technology</strong> student at Meru University of Science and Technology, expected to graduate in 2027."
    },
    {
      intent: "cv",
      keywords: ["cv", "resume", "download", "pdf", "portfolio"],
      reply: "You can view and download his full CV by clicking the <strong>'CV'</strong> link in the top navigation bar, or by visiting <code>/cv/</code>."
    },
    {
      intent: "contact",
      keywords: ["contact", "email", "reach", "message", "talk", "connect"],
      reply: "You can use the contact form right below this chat, or connect with him on <a href='https://github.com/anogola8' target='_blank' style='color:var(--acc);'>GitHub</a>."
    },
    {
      intent: "location",
      keywords: ["location", "where", "based", "country", "remote", "kenya"],
      reply: "Dericks is based in <strong>Kenya</strong> but is fully equipped for remote work and open to international opportunities."
    }
  ];

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  function addMessage(html, isUser) {
    var div = document.createElement("div");
    div.style.marginBottom = "8px";
    div.style.lineHeight = "1.5";
    div.style.fontSize = "0.85rem";
    
    if (isUser) {
      div.style.color = "var(--ink)";
      div.innerHTML = '<span style="color: var(--mut);">You:</span> ' + html;
    } else {
      div.style.color = "var(--acc)";
      div.innerHTML = '<span style="color: var(--mut);">Bot:</span> ' + html;
    }
    
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function processQuery(query) {
    var q = query.toLowerCase();
    
    // Score each intent based on how many keywords match
    var bestMatch = null;
    var highestScore = 0;

    KNOWLEDGE.forEach(function(item) {
      var score = 0;
      item.keywords.forEach(function(kw) {
        // If the query contains the keyword, add to score
        if (q.indexOf(kw) !== -1) score += 1;
      });
      
      // Add a small bonus if the query matches the intent name exactly
      if (q.indexOf(item.intent.replace("_", " ")) !== -1) score += 2;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    });

    // Threshold to prevent random matches
    if (bestMatch && highestScore > 0) {
      return bestMatch.reply;
    } else {
      return "I'm not entirely sure about that. Try asking about his <strong>projects</strong> (like EDMS or UFA), his <strong>tech stack</strong> (Python, Django), <strong>security</strong> experience, or <strong>availability</strong>. Alternatively, just leave a message in the contact form below!";
    }
  }

  // ==========================================
  // EVENT LISTENERS
  // ==========================================

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    var query = input.value.trim();
    if (!query) return;

    // 1. Show user message
    addMessage(query, true);
    input.value = "";
    input.focus();

    // 2. Show typing indicator
    var typingId = "typing-" + Date.now();
    var typingDiv = document.createElement("div");
    typingDiv.id = typingId;
    typingDiv.style.color = "var(--mut)";
    typingDiv.innerHTML = '<span style="color: var(--mut);">Bot:</span> <em>analyzing...</em>';
    chatWindow.appendChild(typingDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // 3. Process and respond after delay
    setTimeout(function() {
      var typingEl = document.getElementById(typingId);
      if (typingEl) chatWindow.removeChild(typingEl);

      var reply = processQuery(query);
      addMessage(reply, false);
    }, 500 + Math.random() * 400); // Randomize delay slightly for realism
  });
})();

