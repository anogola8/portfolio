

import json
from pathlib import Path
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST
from .models import Message
from .github import get_github_projects

LIMIT, WINDOW = 5, 3600  # 5 attempts per IP per hour
LIMITS = {"name": (1, 80), "email": (3, 120), "subject": (1, 100), "message": (10, 1500)}


@ensure_csrf_cookie
def index(request):
    from django.shortcuts import render
    return render(request, "index.html")

def _bad(msg, status=400):
    return JsonResponse({"error": msg}, status=status)

@require_POST
def contact(request):
    # REMOTE_ADDR is correct only when the server sees real client IPs; behind a proxy, configure it properly.
    key = "contact:" + request.META.get("REMOTE_ADDR", "unknown")
    cache.add(key, 0, WINDOW)
    if cache.incr(key) > LIMIT:
        return _bad("Too many messages. Please try again later.", 429)
    try:
        data = json.loads(request.body[:10000] or b"{}")
    except ValueError:
        return _bad("Invalid request.")
    if not isinstance(data, dict):
        return _bad("Invalid request.")
    if data.get("website"):  # honeypot filled: bot
        return JsonResponse({"ok": True})
    clean = {}
    for field, (lo, hi) in LIMITS.items():
        val = data.get(field)
        if not isinstance(val, str) or not lo <= len(val.strip()) <= hi:
            return _bad(f"Please check the {field} field.")
        clean[field] = val.strip()
    try:
        validate_email(clean["email"])
    except ValidationError:
        return _bad("Please enter a valid email address.")
    Message.objects.create(**clean)
    return JsonResponse({"ok": True})

def now(request):
    html = (Path(__file__).resolve().parent.parent / "templates" / "now.html").read_text(encoding="utf-8")
    return HttpResponse(html)

# ---- multi-page views ----

import re
from django.conf import settings

# Minimal notes data — must match templates/partials/projects_data.html
_NOTES = {

    "github-sync": {
        "title": "Syncing my portfolio with the GitHub API",
        "date": "2026",
        "summary": "I wanted my portfolio to automatically show my latest repos without manually updating a JSON array. Here is how I built a cached API fetcher in Django.",
        "body": [
            "The problem: I was manually copying and pasting my project descriptions into a static array. When I updated a repo on GitHub, my portfolio stayed stale.",
            "The solution: I wrote a small utility in Django that hits the GitHub REST API, fetches my public repos, and caches the JSON response in memory for 12 hours. This keeps me well under the 60 requests/hour rate limit.",
            "The hard part: Rate limits. Unauthenticated API calls are capped aggressively. I had to add a Personal Access Token (PAT) to the request headers. The token requires zero scopes, so it can only read public data — it cannot touch private repos.",
            "The merge logic: I use JavaScript on the client side to match the GitHub repo names (e.g., 'ufa_website') to my manual project slugs (e.g., 'ufa'). If a match is found, it updates the description and adds a 'Live on GitHub' badge."
        ],
    },
    "token-gated-pages": {
        "title": "Token-gated case studies without user accounts",
        "date": "2026",
        "summary": "How I built private project pages for recruiters without building a full authentication system.",
        "body": [
            "The problem: Some of my ongoing projects are private. I wanted to share the architecture and case study with specific recruiters, but I didn't want to build a full login/registration flow.",
            "The solution: I built a 'Magic Link' system. Each private project has a unique, 32-byte URL-safe token. The link looks like /access/p/edms-private/?t=xyz.",
            "The Django model: I created a ProjectGated model. It stores the narrative, the design decisions, and the token. The view checks if the token in the URL matches the token in the database.",
            "Security: If the token is wrong or missing, the site does not return a 404 (which would confirm the page exists). Instead, it returns a 200 OK with a generic 'Request Access' message. This prevents attackers from enumerating which projects are private.",
            "Revocation: If a link is leaked, I can click 'Rotate Token' in the Django admin. The old link instantly dies, and I can send the new one to the client."
        ],
    },
    "canvas-depth": {
        "title": "Creating cinematic depth with Canvas and CSS",
        "date": "2026",
        "summary": "I wanted the hero section to feel like a deep, 3D data mesh. Here is how I used a 2D canvas with CSS blur to fake depth of field.",
        "body": [
            "The goal: A background that felt like a deep server room or a holographic data stream, without using heavy WebGL libraries like Three.js.",
            "The canvas: I wrote a particle system that draws glowing nodes and connects them with lines if they are close to each other. I added a subtle mouse-repulsion force so the mesh reacts to the user.",
            "The CSS magic: A 2D canvas looks flat by default. To create depth, I applied filter: blur(60px) saturate(1.5) to the canvas via CSS. This blurs the particles into soft, out-of-focus lights.",
            "The mask: I used mask-image: radial-gradient(...) to fade the canvas into the background at the edges. This creates a 'spotlight' effect behind the hero text.",
            "Result: A cinematic, 3D-looking environment that runs at 60fps on mobile and respects prefers-reduced-motion for accessibility."
        ],
    },
    "hash-chains": {
        "title": "Hash chains detect tampering. They don't prevent it.",
        "date": "2026",
        "summary": "When I built the ChamaTrust hash-chain demo, the question was: so it's tamper-proof? No. Here's why that distinction matters.",
        "body": [
            "A hash chain makes editing history visible. Each record stores the SHA-256 of the previous record plus its own content. Change one record, and every later hash no longer matches. The chain itself has no mechanism to stop you from editing — it can only tell the next reader that you did.",
            "That's a real property, and it's worth having. But it isn't the same as immutability, and it doesn't prove who did what. An attacker who controls the storage layer can rewrite the whole chain from scratch and it will look internally consistent.",
            "The fixes: sign the chain head with a key held outside the storage layer, and store the head somewhere the attacker doesn't control. The chain proves order. The signature proves authorship. Neither alone is enough."
        ],
    },
    "supabase-migration": {
        "title": "Moving UFA Kenya's site from MySQL to Supabase",
        "date": "2026",
        "summary": "Not a connection-string swap. Every query was audited, and the migration taught me more than the initial build.",
        "body": [
            "The initial build used MySQL on Render. When the free tier got expensive, Supabase was the obvious target. I assumed I'd change an env var and be done in an hour. It took two days.",
            "The first surprise was dialect differences. AUTO_INCREMENT doesn't exist in Postgres; SERIAL does. String concatenation is CONCAT() in MySQL and || in Postgres. I found most of these by running the migration and reading errors — not how I'd do it next time.",
            "What I'd do differently: a query audit before migration, and a staging environment."
        ],
    },
    "rbac-edms": {
        "title": "Designing role-based access for a document system",
        "date": "2026",
        "summary": "Role-based access sounds simple until you have 63 tables and need MFA. What I'd keep, and what I'd change.",
        "body": [
            "KDF EDMS needed RBAC from the first commit, not later. That meant the user model had to be designed around roles, not added to afterwards. Django's swap-user recommendation saved me a week of migration cascades.",
            "I modelled roles as data, not code. A Role row has a name and permissions. A User belongs to a Role. Permissions are checked by middleware, not scattered through views. Adding a new role is an admin action, not a deployment.",
            "MFA was the part that almost broke the design. Django doesn't ship a second-factor framework, so I used TOTP with a custom verification view. Design the auth flow as its own subsystem."
        ],
    },
}


def _render(request, name):
    from django.shortcuts import render
    return render(request, name)


def about(request):
    return _render(request, "about.html")


def projects(request):
    from django.shortcuts import render
    github_data = get_github_projects()
    return render(request, "projects.html", {"github_projects": github_data})


def skills(request):
    return _render(request, "skills.html")


def experience(request):
    return _render(request, "experience.html")


def cv(request):
    return _render(request, "cv.html")


def notes(request):
    return _render(request, "notes.html")


def note(request, slug):
    from django.http import Http404
    n = _NOTES.get(slug)
    if not n:
        raise Http404
    from django.shortcuts import render
    return render(request, "note_detail.html", {"note": n})


def contact_page(request):
    return _render(request, "contact.html")

def project_detail(request, slug):
    from django.shortcuts import render
    return render(request, "project_detail.html", {"slug": slug})



def robots_txt(request):
    from django.shortcuts import render
    return render(request, "robots.txt", content_type="text/plain")

