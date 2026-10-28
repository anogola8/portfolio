from django.contrib.sitemaps import Sitemap
from django.urls import reverse


class StaticViewSitemap(Sitemap):
    """Public pages. Gated/private pages are intentionally excluded."""

    protocol = "https"
    changefreq = "monthly"
    priority = 0.7

    def items(self):
        # Removed the "project_detail" placeholder that was causing duplicate home URLs
        return [
            ("home", 1.0),
            ("projects", 0.9),
            ("skills", 0.8),
            ("experience", 0.7),
            ("cv", 0.6),
            ("notes", 0.8),
            ("about", 0.8),
            ("contact", 0.7),
            ("now", 0.6),
        ]

    def location(self, item):
        name, _priority = item
        return reverse(name)

    def priority(self, item):
        return item[1]


class ProjectsSitemap(Sitemap):
    """One URL per public project."""

    protocol = "https"
    changefreq = "monthly"
    priority = 0.8

    # Updated to include the two new projects
    _slugs = ["edms", "ufa", "study", "trustledger", "chamatrust", "certverify", "ufa-django"]

    def items(self):
        return self._slugs

    def location(self, slug):
        return reverse("project_detail", kwargs={"slug": slug})


class NotesSitemap(Sitemap):
    """One URL per note."""

    protocol = "https"
    changefreq = "yearly"
    priority = 0.7

    def items(self):
        from contact.views import _NOTES
        return list(_NOTES.keys())

    def location(self, slug):
        return reverse("note", kwargs={"slug": slug})


sitemaps = {
    "static": StaticViewSitemap,
    "projects": ProjectsSitemap,
    "notes": NotesSitemap,
}
