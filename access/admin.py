from django.contrib import admin, messages
from django.utils import timezone
from django.utils.html import format_html

from .models import AccessLog, ProjectGated


class AccessLogInline(admin.TabularInline):
    model = AccessLog
    extra = 0
    readonly_fields = ("at",)
    can_delete = True
    max_num = 20
    verbose_name = "recent access"
    verbose_name_plural = "recent access (last 20, newest first)"


@admin.register(ProjectGated)
class ProjectGatedAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "active", "updated", "link_preview")
    list_filter = ("active",)
    search_fields = ("title", "slug", "narrative")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("token", "created", "updated", "share_link", "rotate_button")
    inlines = [AccessLogInline]

    fieldsets = (
        ("Identity", {"fields": ("title", "slug")}),
        ("Public", {"fields": ("public_summary",)}),
        ("Gated content", {"fields": ("narrative", "decisions", "private_repo_url")}),
        ("Gate", {
            "fields": ("active", "token", "share_link", "rotate_button"),
            "description": "Send share_link to a specific person. Rotate the token to revoke all existing links.",
        }),
        ("Metadata", {"fields": ("created", "updated"), "classes": ("collapse",)}),
    )

    actions = ["rotate_tokens"]

    @admin.display(description="share link")
    def share_link(self, obj):
        if not obj.pk:
            return "Save first."
        url = self._share_url(obj)
        return format_html('<a href="{}" target="_blank" rel="noopener">{}</a>', url, url)

    @admin.display(description="link")
    def link_preview(self, obj):
        if not obj.pk:
            return ""
        return format_html('<a href="{}" target="_blank" rel="noopener">open</a>', self._share_url(obj))

    @admin.display(description="rotate token")
    def rotate_button(self, obj):
        if not obj.pk:
            return ""
        return format_html(
            '<a class="button" href="{}">Rotate now (invalidates current links)</a>',
            f"rotate/",
        )

    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom = [
            path("<int:pk>/rotate/", self.admin_site.admin_view(self.rotate_view), name="access_projectgated_rotate"),
        ]
        return custom + urls

    def rotate_view(self, request, pk):
        from django.shortcuts import redirect
        obj = ProjectGated.objects.get(pk=pk)
        obj.rotate_token()
        self.message_user(request, f"Token rotated for {obj.title}. Previous links are now invalid.", level=messages.SUCCESS)
        return redirect(request.META.get("HTTP_REFERER", "../../"))

    @admin.action(description="Rotate token on selected projects")
    def rotate_tokens(self, request, queryset):
        n = 0
        for obj in queryset:
            obj.rotate_token()
            n += 1
        self.message_user(request, f"Rotated tokens on {n} project(s).", level=messages.SUCCESS)

    def _share_url(self, obj):
        base = self._request_base() if hasattr(self, "_request_base") else ""
        return f"{base}/access/p/{obj.slug}/?t={obj.token}"

    def changelist_view(self, request, extra_context=None):
        self._request_base = request.build_absolute_uri("/").rstrip("/")
        return super().changelist_view(request, extra_context)

    def change_view(self, request, object_id, form_url="", extra_context=None):
        self._request_base = request.build_absolute_uri("/").rstrip("/")
        return super().change_view(request, object_id, form_url, extra_context)


@admin.register(AccessLog)
class AccessLogAdmin(admin.ModelAdmin):
    list_display = ("project", "at")
    list_filter = ("project",)
    date_hierarchy = "at"
    readonly_fields = ("project", "at")

from .models import ProjectGated, AccessLog, Ebook, StoryChapter

@admin.register(Ebook)
class EbookAdmin(admin.ModelAdmin):
    list_display = ("title", "series_name", "chapter_number", "is_free", "created")
    search_fields = ("title", "description")
    prepopulated_fields = {"title": ("title",)} # Not strictly necessary, but helpful


@admin.register(StoryChapter)
class StoryChapterAdmin(admin.ModelAdmin):
    list_display = ("series_name", "chapter_number", "title", "is_published")
    list_filter = ("series_name", "is_published")
    search_fields = ("title", "content")
