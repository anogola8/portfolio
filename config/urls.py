from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.urls import include, path

from config.sitemaps import sitemaps
from contact import views
from django.contrib.auth import views as auth_views

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
    path("library/", views.library, name="library"),
    path("read/<int:pk>/", views.read_ebook, name="read_ebook"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("dashboard/add-ebook/", views.dashboard_add_ebook, name="dashboard_add_ebook"),
    path("dashboard/add-gated/", views.dashboard_add_gated, name="dashboard_add_gated"),
    path("dashboard/edit-ebook/<int:pk>/", views.dashboard_edit_ebook, name="dashboard_edit_ebook"),
    path("manage-secret/", auth_views.LoginView.as_view(template_name="registration/login.html"), name="login"),
    path("logout/", auth_views.LogoutView.as_view(next_page="/"), name="logout"),
    path("contact/", views.contact_page, name="contact"),
    path("now/", views.now, name="now"),

    # functional
    path("api/contact/", views.contact, name="api_contact"),
    path("access/", include("access.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


