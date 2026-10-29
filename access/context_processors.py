from access.models import Ebook, StoryChapter

def search_data(request):
    return {
        "ebooks": Ebook.objects.all()[:20],
        "story_chapters": StoryChapter.objects.filter(is_published=True)[:20],
    }
