"""Blog URL configuration."""
from django.urls import path
from .views import BlogCategoryListView, BlogPostListView, BlogPostDetailView, BlogFeaturedView

urlpatterns = [
    path('categories/', BlogCategoryListView.as_view(), name='blog-categories'),
    path('featured/', BlogFeaturedView.as_view(), name='blog-featured'),
    path('posts/', BlogPostListView.as_view(), name='blog-posts'),
    path('posts/<slug:slug>/', BlogPostDetailView.as_view(), name='blog-post-detail'),
]
