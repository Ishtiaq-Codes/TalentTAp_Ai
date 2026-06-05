"""Blog models — SEO-optimised articles & categories."""
import uuid
from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model

User = get_user_model()


class BlogCategory(models.Model):
    """Article category (e.g. Hiring Tips, Market Trends)."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, help_text="Short description shown on the category listing page.")
    color = models.CharField(
        max_length=20,
        default='blue',
        help_text="Tailwind colour name (blue, green, purple, rose, amber, teal).",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Blog Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class BlogTag(models.Model):
    """Freeform keyword tag for additional SEO surface area."""
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class BlogPost(models.Model):
    """
    A blog / resource article.

    Designed to maximise on-page SEO:
    - Separate seo_title & seo_description give full meta-tag control.
    - Canonical URL slug enforces clean URLs.
    - JSON-LD structured data fields for Google rich-results.
    - Reading time automatically estimated from word count.
    """

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        ARCHIVED = 'archived', 'Archived'

    # ── Core ─────────────────────────────────────────────────────────────
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='blog_posts',
        help_text="Platform admin who wrote this article.",
    )
    category = models.ForeignKey(
        BlogCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts',
    )
    tags = models.ManyToManyField(BlogTag, blank=True, related_name='posts')

    # ── Content ───────────────────────────────────────────────────────────
    title = models.CharField(max_length=200, help_text="Main article headline (H1).")
    slug = models.SlugField(max_length=220, unique=True, blank=True, db_index=True)
    excerpt = models.TextField(
        max_length=300,
        help_text="Short teaser shown on listing page (150–160 chars ideal for SEO).",
    )
    content = models.TextField(
        help_text="Full article body. Supports HTML / Markdown from the editor.",
    )
    cover_image = models.ImageField(
        upload_to='blog/covers/',
        null=True, blank=True,
        help_text="Recommended size: 1200×630 px (OpenGraph standard).",
    )
    cover_image_alt = models.CharField(
        max_length=200, blank=True,
        help_text="Alt text for cover image — important for accessibility & image SEO.",
    )

    # ── SEO Overrides ─────────────────────────────────────────────────────
    seo_title = models.CharField(
        max_length=70, blank=True,
        help_text="Override the <title> tag (ideal: 50–60 chars). Leave blank to use main title.",
    )
    seo_description = models.CharField(
        max_length=160, blank=True,
        help_text="Meta description (ideal: 120–155 chars). Shown in Google search results.",
    )
    seo_keywords = models.CharField(
        max_length=300, blank=True,
        help_text="Comma-separated keywords. Not used by Google but useful for internal tracking.",
    )
    canonical_url = models.URLField(
        blank=True,
        help_text="Optional: Set if this content is syndicated from another URL.",
    )
    og_image = models.ImageField(
        upload_to='blog/og/',
        null=True, blank=True,
        help_text="Open Graph image for social sharing (overrides cover_image if set).",
    )

    # ── Publishing ────────────────────────────────────────────────────────
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.DRAFT, db_index=True,
    )
    is_featured = models.BooleanField(default=False, help_text="Show in Featured / Hero section.")
    allow_comments = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)

    # ── Analytics ─────────────────────────────────────────────────────────
    view_count = models.PositiveIntegerField(default=0, editable=False)
    reading_time_minutes = models.PositiveSmallIntegerField(default=1, editable=False)

    # ── Timestamps ────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title

    # ── Helpers ───────────────────────────────────────────────────────────
    @property
    def effective_seo_title(self):
        return self.seo_title or self.title

    @property
    def effective_og_image(self):
        return self.og_image or self.cover_image

    def _estimate_reading_time(self):
        """200 wpm average reading speed."""
        word_count = len(self.content.split())
        return max(1, round(word_count / 200))

    def save(self, *args, **kwargs):
        # Auto-slug
        if not self.slug:
            base = slugify(self.title)
            slug = base
            counter = 1
            while BlogPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{counter}'
                counter += 1
            self.slug = slug
        # Reading time
        self.reading_time_minutes = self._estimate_reading_time()
        super().save(*args, **kwargs)
