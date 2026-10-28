from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.urls import include, path

from config.sitemaps import sitemaps
from contact import views

urlpatterns = [
    path(settings.ADMIN_PATH, admin.site.urls),

    # SEO
    path("sitemap.xml", sitemap, {"sitemaps": sitemaps}, name="django.contrib.sitemaps.views.sitemap"),
    path("robots.txt", views.robots_txt, name="robots_txt"),

    # pages
    path("", views.index, name="home"),
    path("about/", views.about, name="about"),
    path("projects/", views.projects, name="projects"),
    path("projects/<slug:slug>/", views.project_detail, name="project_detail"),
    path("skills/", views.skills, name="skills"),
    path("experience/", views.experience, name="experience"),
    path("cv/", views.cv, name="cv"),
    path("notes/", views.notes, name="notes"),
    path("notes/<slug:slug>/", views.note, name="note"),
    path("contact/", views.contact_page, name="contact"),
    path("now/", views.now, name="now"),

    # functional
    path("api/contact/", views.contact, name="api_contact"),
    path("access/", include("access.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
