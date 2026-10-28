from django.core.cache import cache
from django.test import Client, TestCase
from .models import Message

GOOD = {"name": "Ada", "email": "ada@example.com", "subject": "Hello", "message": "I would like to collaborate."}

class ContactTests(TestCase):
    def setUp(self):
        cache.clear()
    def post(self, data, client=None):
        return (client or self.client).post("/api/contact/", data, content_type="application/json")
    def test_valid_message_saved(self):
        self.assertEqual(self.post(GOOD).status_code, 200)
        self.assertEqual(Message.objects.count(), 1)
    def test_invalid_email_rejected(self):
        r = self.post({**GOOD, "email": "nope"})
        self.assertEqual(r.status_code, 400); self.assertEqual(Message.objects.count(), 0)
    def test_short_message_rejected(self):
        self.assertEqual(self.post({**GOOD, "message": "hi"}).status_code, 400)
    def test_non_string_rejected(self):
        self.assertEqual(self.post({**GOOD, "name": ["x"]}).status_code, 400)
    def test_honeypot_not_saved(self):
        self.post({**GOOD, "website": "http://spam"}); self.assertEqual(Message.objects.count(), 0)
    def test_rate_limit(self):
        codes = [self.post(GOOD).status_code for _ in range(6)]
        self.assertEqual(codes[-1], 429); self.assertEqual(Message.objects.count(), 5)
    def test_csrf_enforced(self):
        self.assertEqual(self.post(GOOD, Client(enforce_csrf_checks=True)).status_code, 403)
    def test_get_not_allowed(self):
        self.assertEqual(self.client.get("/api/contact/").status_code, 405)
    def test_index_sets_csrf_and_csp(self):
        r = self.client.get("/")
        self.assertIn("csrftoken", r.cookies); self.assertIn("Content-Security-Policy", r)
    def test_admin_requires_login(self):
        r = self.client.get("/manage-site/")
        self.assertEqual(r.status_code, 302); self.assertIn("login", r["Location"])

# ---- portfolio route smoke tests ----
from django.test import TestCase


class HomepageTests(TestCase):
    def test_home_returns_200(self):
        r = self.client.get("/")
        self.assertEqual(r.status_code, 200)

    def test_home_contains_title(self):
        r = self.client.get("/")
        self.assertContains(r, "The Digital Workshop")

    def test_home_references_extracted_css(self):
        r = self.client.get("/")
        self.assertContains(r, "/static/css/portfolio.css")

    def test_home_has_favicon_link(self):
        r = self.client.get("/")
        self.assertContains(r, "/static/img/favicon.svg")


class ContactApiTests(TestCase):
    url = "/api/contact/"

    def test_rejects_empty(self):
        r = self.client.post(self.url, data="{}", content_type="application/json")
        self.assertEqual(r.status_code, 400)

    def test_rejects_invalid_email(self):
        payload = '{"name":"A","email":"nope","subject":"Hi","message":"Hello there"}'
        r = self.client.post(self.url, data=payload, content_type="application/json")
        self.assertEqual(r.status_code, 400)

    def test_accepts_valid(self):
        payload = (
            '{"name":"Tester","email":"t@example.com",'
            '"subject":"Hello","message":"This is a test message body."}'
        )
        r = self.client.post(self.url, data=payload, content_type="application/json")
        self.assertEqual(r.status_code, 200)
        self.assertJSONEqual(r.content, {"ok": True})
