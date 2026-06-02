"""Messaging URL routes."""
from django.urls import path
from . import views

app_name = 'messaging'

urlpatterns = [
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/start/', views.StartConversationView.as_view(), name='conversation-start'),
    path('conversations/<uuid:pk>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<uuid:pk>/send/', views.SendMessageView.as_view(), name='send-message'),
    path('conversations/<uuid:pk>/read/', views.MarkConversationReadView.as_view(), name='mark-read'),
]
