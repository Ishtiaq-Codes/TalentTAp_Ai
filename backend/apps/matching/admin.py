from django.contrib import admin
from .models import MatchScore


@admin.register(MatchScore)
class MatchScoreAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'job', 'overall_score', 'skills_score', 'experience_score', 'created_at']
    list_filter = ['overall_score']
    ordering = ['-overall_score']
