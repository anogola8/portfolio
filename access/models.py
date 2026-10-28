import secrets
from django.db import models
from django.utils import timezone


def new_token():
    return secrets.token_urlsafe(32)


class ProjectGated(models.Model):
    """Narrative + optional private-repo link for a project that only
    the holder of the token URL can read. NOT an auth system."""

    slug = models.SlugField(unique=True, max_length=80)
    title = models.CharField(max_length=120)

    # short public summary — safe to show on the public project card
    public_summary = models.TextField(
        blank=True,
        help_text="Shown to everyone. Keep it one sentence.",
    )

    # gated content
    narrative = models.TextField(
        blank=True,
        help_text="Approach, hard part, result, lessons. Shown only to the token holder.",
    )
    decisions = models.TextField(
        blank=True,
        help_text="Design decisions / trade-offs, one per line.",
    )
    private_repo_url = models.URLField(
        blank=True,
        help_text="Optional. A URL the recipient can already access (e.g. GitHub repo they were invited to). Never a credential.",
    )

    # gate
    token = models.CharField(max_length=64, unique=True, default=new_token, editable=False)
    active = models.BooleanField(
        default=True,
        help_text="Uncheck to revoke all current links without deleting the content.",
    )

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated"]
        verbose_name = "gated project"
        verbose_name_plural = "gated projects"

    def __str__(self):
        return f"{self.title} ({self.slug})"

    def rotate_token(self):
        self.token = new_token()
        self.save(update_fields=["token", "updated"])


class AccessLog(models.Model):
    """Audit trail: when a token URL was hit. No IP, no user-agent."""

    project = models.ForeignKey(ProjectGated, on_delete=models.CASCADE, related_name="access_log")
    at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-at"]

    def __str__(self):
        return f"{self.project.slug} @ {self.at:%Y-%m-%d %H:%M}"
