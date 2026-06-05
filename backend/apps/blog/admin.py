"""Blog Admin — professional CMS-like interface with CKEditor."""
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from ckeditor.widgets import CKEditorWidget
from django import forms
from .models import BlogCategory, BlogTag, BlogPost


class BlogPostAdminForm(forms.ModelForm):
    """Use CKEditor for the content field."""
    content = forms.CharField(widget=CKEditorWidget(config_name='full'))

    class Meta:
        model = BlogPost
        fields = '__all__'


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'color', 'post_count', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}

    def post_count(self, obj):
        return obj.posts.filter(status='published').count()
    post_count.short_description = 'Published Posts'


@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'post_count']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}

    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = 'Posts'


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    form = BlogPostAdminForm

    # ── List view ──────────────────────────────────────────────────────────
    list_display = [
        'title', 'category', 'author', 'status', 'is_featured',
        'reading_time_minutes', 'view_count', 'published_at',
    ]
    list_filter = ['status', 'is_featured', 'category', 'tags']
    search_fields = ['title', 'excerpt', 'content', 'seo_keywords']
    date_hierarchy = 'published_at'
    ordering = ['-created_at']
    readonly_fields = ['id', 'view_count', 'reading_time_minutes', 'created_at', 'updated_at', 'seo_preview']
    filter_horizontal = ['tags']
    prepopulated_fields = {'slug': ('title',)}

    # ── Fieldsets (grouped layout like a real CMS) ─────────────────────────
    fieldsets = (
        ('📝 Content', {
            'fields': (
                'title', 'slug', 'author', 'category', 'tags',
                'excerpt', 'content',
            ),
        }),
        ('🖼️ Media', {
            'fields': ('cover_image', 'cover_image_alt', 'og_image'),
            'description': 'Cover image: 1200×630 px. OG image overrides cover for social sharing.',
        }),
        ('🔍 SEO Settings', {
            'fields': (
                'seo_title', 'seo_description', 'seo_keywords', 'canonical_url',
                'seo_preview',
            ),
            'description': (
                '✅ seo_title: 50–60 characters ideal. '
                '✅ seo_description: 120–155 characters ideal. '
                '✅ Leave seo_title blank to use the article title.'
            ),
        }),
        ('📣 Publishing', {
            'fields': ('status', 'is_featured', 'allow_comments', 'published_at'),
        }),
        ('📊 Stats', {
            'fields': ('view_count', 'reading_time_minutes', 'created_at', 'updated_at', 'id'),
            'classes': ('collapse',),
        }),
    )

    # ── Actions ────────────────────────────────────────────────────────────
    actions = ['publish_selected', 'archive_selected', 'feature_selected']

    def publish_selected(self, request, queryset):
        now = timezone.now()
        updated = queryset.filter(status='draft').update(status='published', published_at=now)
        self.message_user(request, f'{updated} article(s) published.')
    publish_selected.short_description = '✅ Publish selected articles'

    def archive_selected(self, request, queryset):
        updated = queryset.update(status='archived')
        self.message_user(request, f'{updated} article(s) archived.')
    archive_selected.short_description = '📦 Archive selected articles'

    def feature_selected(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} article(s) featured.')
    feature_selected.short_description = '⭐ Feature selected articles'

    # ── SEO preview (read-only field in admin) ─────────────────────────────
    def seo_preview(self, obj):
        if not obj.pk:
            return '—'
        title = obj.seo_title or obj.title or '(No title)'
        desc = obj.seo_description or obj.excerpt or '(No description)'
        slug = obj.slug or 'article-slug'
        return format_html(
            '<div style="font-family:Arial,sans-serif;border:1px solid #ddd;border-radius:8px;padding:16px;max-width:540px;background:#fff;">'
            '<p style="margin:0 0 2px;font-size:12px;color:#202124;">talenttap.ai › blog › <b>{}</b></p>'
            '<p style="margin:0 0 4px;font-size:18px;color:#1a0dab;font-weight:500;">{}</p>'
            '<p style="margin:0;font-size:13px;color:#4d5156;">{}</p>'
            '</div>',
            slug, title[:60], desc[:155]
        )
    seo_preview.short_description = '🔍 Google Search Preview'
