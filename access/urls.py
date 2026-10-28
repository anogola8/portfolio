from django.urls import path

from . import views

app_name = "access"

urlpatterns = [
    path("p/<slug:slug>/", views.project_view, name="project"),
]
