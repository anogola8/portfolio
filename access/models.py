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
from django.db import models

class Ebook(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(help_text="What is this ebook about?")
    cover = models.ImageField(upload_to='ebooks/covers/', blank=True, null=True, help_text="Upload a 3:4 aspect ratio cover image.")
    file = models.FileField(upload_to='ebooks/files/', blank=True, null=True, help_text="Upload the PDF or EPUB file.")
    
    is_free = models.BooleanField(default=False, help_text="Check this if anyone can download it without asking.")
    is_ongoing = models.BooleanField(default=False, help_text="Check this if you are still writing chapters.")
    series_name = models.CharField(max_length=200, blank=True, null=True, help_text="e.g. The Digital Trust Series")
    chapter_number = models.PositiveIntegerField(default=1, help_text="If this is part of a series, what number is this chapter?")
    
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created"]

    def __str__(self):
        return self.title



class StoryChapter(models.Model):
    title = models.CharField(max_length=200)
    series_name = models.CharField(max_length=200, help_text="e.g. The Digital Trust Series")
    chapter_number = models.PositiveIntegerField(default=1)
    
    # The actual story text (Markdown or plain text)
    content = models.TextField(help_text="Write your chapter here. Use blank lines for paragraphs.")
    
    is_published = models.BooleanField(default=False, help_text="Check this to make it visible on the site.")
    published_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["series_name", "chapter_number"]

    def __str__(self):
        return f"{self.series_name} - Ch {self.chapter_number}: {self.title}"
