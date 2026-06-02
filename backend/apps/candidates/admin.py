from django.contrib import admin
from .models import CandidateProfile, CandidateSkill, Experience


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'headline', 'country', 'city', 'employment_status', 'availability', 'profile_completion']
    list_filter = ['employment_status', 'availability', 'is_open_to_work']
    search_fields = ['user__email', 'user__first_name', 'headline']


@admin.register(CandidateSkill)
class CandidateSkillAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'name', 'proficiency']
    search_fields = ['name']


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'title', 'company_name', 'start_date', 'end_date', 'is_current']
