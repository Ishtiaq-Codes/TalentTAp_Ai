"""Notification serializers."""
from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'type', 'title', 'message', 'is_read', 'action_url', 'created_at']
        read_only_fields = ['id', 'type', 'title', 'message', 'action_url', 'created_at']
