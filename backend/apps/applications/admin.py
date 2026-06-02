from django.contrib import admin
from .models import Application, Shortlist


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'job', 'status', 'created_at']
    list_filter = ['status']


@admin.register(Shortlist)
class ShortlistAdmin(admin.ModelAdmin):
    list_display = ['recruiter', 'candidate', 'job', 'created_at']
