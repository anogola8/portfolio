# Security notes

## Implemented and tested (10 passing tests)

* Server-side validation of every field; types and lengths checked; JSON body capped.
* CSRF enforced on the contact API (tested: 403 without token).
* Per-IP rate limiting (tested: 6th request returns 429).
* Honeypot field to drop simple bots.
* Admin requires login and lives at a configurable secret path (tested: redirects to login).
* Output is rendered with textContent on the page and escaped by Django admin, which reduces XSS risk.
* Secrets come from environment variables; the app refuses to start in production without DJANGO\_SECRET\_KEY.
* Production mode enables HTTPS redirect, HSTS, secure cookies; CSP, nosniff, frame denial and referrer policy headers are sent.

## Known limitations

* CSP allows inline scripts and styles because the page is a single file. Moving JS and CSS to static files would allow a stricter policy.
* Rate limiting uses in-memory cache and REMOTE\_ADDR. Behind a proxy, set DJANGO\_BEHIND\_PROXY=1 and use a shared cache (Redis) for multiple workers.
* No CAPTCHA, no email verification, no admin 2FA.
* Stored messages contain personal data: delete old ones regularly.
* This has not had an independent security review. It is not "completely secure".

## Before deploying

1. Generate a long random DJANGO\_SECRET\_KEY. 2. Set DJANGO\_DEBUG=0, DJANGO\_ALLOWED\_HOSTS, ADMIN\_PATH. 3. Serve over HTTPS. 4. Run `python manage.py check --deploy`. 5. Use a strong admin password. 6. Back up db.sqlite3. 7. Update Django regularly.# Security
2. 
3. This document describes what is actually implemented, what is intentionally absent, and what the residual risks are.
4. 
5. Last reviewed: 2026-10.
6. 
7. \## Summary
8. 
9. The public portfolio is read-only for visitors. The only writing endpoint is `POST /api/contact/`, which stores validated messages and is read only through the Django admin at `/<ADMIN\_PATH>/`.
10. 
11. There are no user accounts, no sessions for visitors, no file uploads, and no third-party trackers.
12. 
13. \## What is implemented
14. 
15. \### Configuration
16. \- `SECRET\_KEY` required in production. `settings.py` refuses to start without it when `DEBUG=0`.
17. \- `DEBUG` env-driven (`DJANGO\_DEBUG`), defaults off.
18. \- `ALLOWED\_HOSTS` env-driven, default `localhost,127.0.0.1`.
19. \- `ADMIN\_PATH` env-driven (default `manage-site/`).
20. 
21. \### Transport (when `DEBUG=0`)
22. \- `SECURE\_SSL\_REDIRECT = True`
23. \- `SECURE\_HSTS\_SECONDS = 31536000`
24. \- `SECURE\_PROXY\_SSL\_HEADER` when `DJANGO\_BEHIND\_PROXY=1`
25. 
26. \*\*Verified\*\*: `python manage.py check --deploy` with `DJANGO\_DEBUG=0` returns zero issues.
27. 
28. \### Cookies
29. \- `SESSION\_COOKIE\_HTTPONLY = True`
30. \- `SESSION\_COOKIE\_SAMESITE = "Lax"`
31. \- `CSRF\_COOKIE\_SAMESITE = "Lax"`
32. \- `SESSION\_COOKIE\_SECURE = CSRF\_COOKIE\_SECURE = True` when `DEBUG=0`.
33. 
34. \### Headers
35. \- `X-Content-Type-Options: nosniff`
36. \- `X-Frame-Options: DENY`
37. \- `Referrer-Policy: same-origin`
38. \- `Content-Security-Policy`
39. \- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
40. 
41. \### Content-Security-Policy
42. 


### GitHub API Integration
- The /projects/ page fetches public repo metadata using a personal access token (GITHUB_TOKEN in .env).
- The token requires **zero scopes** (public read-only). It cannot access private repositories.
- Responses are cached in memory for 12 hours to avoid rate limits.
