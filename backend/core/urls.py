"""TalentTap AI — URL Configuration."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/companies/', include('apps.companies.urls')),
    path('api/v1/candidates/', include('apps.candidates.urls')),
    path('api/v1/jobs/', include('apps.jobs.urls')),
    path('api/v1/applications/', include('apps.applications.urls')),
    path('api/v1/interviews/', include('apps.interviews.urls')),
    path('api/v1/matching/', include('apps.matching.urls')),
    path('api/v1/messages/', include('apps.messaging.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/admin/', include('apps.analytics.urls')),
    path('api/v1/analytics/activities/', __import__('apps.analytics.views').analytics.views.RecruiterActivityListView.as_view(), name='recruiter-activities'),
    path('api/v1/blog/', include('apps.blog.urls')),
    
    # Copilot Chatbot
    path('api/v1/chat/stream/', __import__('apps.core.views').core.views.CopilotView.as_view(), name='chat-stream'),
    path('api/v1/chat/public/stream/', __import__('apps.core.views').core.views.PublicChatView.as_view(), name='public-chat-stream'),

    # CKEditor image uploader
    path('ckeditor/', include('ckeditor_uploader.urls')),

    # API docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
