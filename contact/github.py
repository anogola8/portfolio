
import os
import requests
from django.core.cache import cache

def get_github_projects(username="anogola8"):
    cache_key = f"github_repos_{username}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    try:
        url = f"https://api.github.com/users/{username}/repos?sort=updated&per_page=20"
        headers = {"Accept": "application/vnd.github.v3+json"}
        
        # Use token if available to avoid rate limits
        token = os.environ.get("GITHUB_TOKEN")
        if token:
            headers["Authorization"] = f"token {token}"

        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            repos = response.json()
            projects = []
            for r in repos:
                if r.get("fork"): continue
                projects.append({
                    "name": r["name"],
                    "description": r["description"] or "No description provided.",
                    "url": r["html_url"],
                    "language": r["language"] or "Code",
                    "updated_at": r["updated_at"],
                    "topics": r.get("topics", [])
                })
            cache.set(cache_key, projects, timeout=86400)
            return projects
        else:
            print(f"GitHub API error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"GitHub fetch failed: {e}")
    
    return []

