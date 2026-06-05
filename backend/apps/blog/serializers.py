"""Blog serializers."""
from rest_framework import serializers
from .models import BlogCategory, BlogTag, BlogPost


class BlogCategorySerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description', 'color', 'post_count']

    def get_post_count(self, obj):
        return obj.posts.filter(status='published').count()


class BlogTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogTag
        fields = ['id', 'name', 'slug']


class BlogPostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing pages."""
    category = BlogCategorySerializer(read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    author_name = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'cover_image_url', 'cover_image_alt',
            'category', 'tags', 'author_name', 'reading_time_minutes',
            'view_count', 'is_featured', 'published_at',
        ]

    def get_author_name(self, obj):
        return obj.author.full_name if obj.author else 'TalentTap Team'

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.cover_image.url) if request else obj.cover_image.url
        return None


class BlogPostDetailSerializer(BlogPostListSerializer):
    """Full serializer for individual article pages."""
    og_image_url = serializers.SerializerMethodField()
    effective_seo_title = serializers.CharField(read_only=True)

    class Meta(BlogPostListSerializer.Meta):
        fields = BlogPostListSerializer.Meta.fields + [
            'content', 'seo_title', 'seo_description', 'seo_keywords',
            'canonical_url', 'og_image_url', 'effective_seo_title',
            'allow_comments', 'created_at', 'updated_at',
        ]

    def get_og_image_url(self, obj):
        img = obj.og_image or obj.cover_image
        if img:
            request = self.context.get('request')
            return request.build_absolute_uri(img.url) if request else img.url
        return None
