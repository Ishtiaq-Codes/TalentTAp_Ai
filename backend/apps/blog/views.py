"""Blog API views - fully public, read-only."""
from django.db.models import F
from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import BlogCategory, BlogPost
from .serializers import BlogCategorySerializer, BlogPostListSerializer, BlogPostDetailSerializer


class BlogCategoryListView(generics.ListAPIView):
    """List all categories with published post counts."""
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Return all categories in one shot


class BlogPostListView(generics.ListAPIView):
    """
    List published articles with filtering, searching, and ordering.
    Supports: ?category=<slug>  ?tag=<slug>  ?search=<term>  ?featured=true
    """
    serializer_class = BlogPostListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'excerpt', 'content', 'seo_keywords', 'tags__name']
    ordering_fields = ['published_at', 'view_count', 'reading_time_minutes']
    ordering = ['-published_at']

    def get_queryset(self):
        qs = BlogPost.objects.filter(status='published').select_related(
            'category', 'author'
        ).prefetch_related('tags')

        # Filter by category slug
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)

        # Filter by tag slug
        tag = self.request.query_params.get('tag')
        if tag:
            qs = qs.filter(tags__slug=tag)

        # Filter featured only
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            qs = qs.filter(is_featured=True)

        return qs


class BlogPostDetailView(generics.RetrieveAPIView):
    """Return a single published article by slug and increment view count."""
    serializer_class = BlogPostDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return BlogPost.objects.filter(status='published').select_related(
            'category', 'author'
        ).prefetch_related('tags')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Atomic view count increment (no race conditions)
        BlogPost.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class BlogFeaturedView(APIView):
    """Return 3 featured articles for hero sections."""
    permission_classes = [AllowAny]

    def get(self, request):
        posts = BlogPost.objects.filter(
            status='published', is_featured=True
        ).select_related('category', 'author').prefetch_related('tags')[:3]
        serializer = BlogPostListSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)
