from django.contrib import admin
from .models import Job, JobSkill


class JobSkillInline(admin.TabularInline):
    model = JobSkill
    extra = 1


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'status', 'employment_type', 'is_remote', 'created_at']
    list_filter = ['status', 'employment_type', 'is_remote']
    search_fields = ['title', 'company__name']
    inlines = [JobSkillInline]
