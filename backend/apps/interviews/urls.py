from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.interviews.views import AIInterviewViewSet

router = DefaultRouter()
router.register(r'', AIInterviewViewSet, basename='interview')

urlpatterns = [
    path('', include(router.urls)),
]
