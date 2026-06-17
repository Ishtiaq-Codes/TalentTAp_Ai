from django.contrib import admin
from .models import Company, RecruiterProfile


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'industry', 'company_size', 'is_verified', 'created_at']
    list_filter = ['is_verified', 'industry', 'company_size']
    search_fields = ['name', 'industry']


@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'company', 'title', 'is_active']
    list_filter = ['is_active']
