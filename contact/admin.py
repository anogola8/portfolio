from django.contrib import admin
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("subject", "name", "email", "created")
    readonly_fields = ("name", "email", "subject", "message", "created")
    def has_add_permission(self, request):
        return False
