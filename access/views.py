from django.http import Http404, HttpResponse
from django.shortcuts import render
from django.utils import timezone

from .models import AccessLog, ProjectGated


def _get_project(slug, token):
    if not token:
        return None
    try:
        return ProjectGated.objects.get(slug=slug, token=token, active=True)
    except ProjectGated.DoesNotExist:
        return None


def project_view(request, slug):
    """
    Public: shows the summary and a 'private' notice.
    With ?t=<token>: shows the gated narrative.
    Wrong / missing / revoked token always shows the public view (no 404 —
    we don't want to leak which slugs exist).
    """
    try:
        project = ProjectGated.objects.get(slug=slug)
    except ProjectGated.DoesNotExist:
        raise Http404

    token = request.GET.get("t", "")
    unlocked = project.active and token and token == project.token

    if unlocked:
        AccessLog.objects.create(project=project)

    return render(
        request,
        "access/project.html",
        {
            "project": project,
            "unlocked": unlocked,
        },
        status=200,
    )
