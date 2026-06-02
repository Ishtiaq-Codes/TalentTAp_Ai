"""Messaging serializers."""
from rest_framework import serializers
from .models import Conversation, Message, ConversationParticipant


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_avatar = serializers.ImageField(source='sender.avatar', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_name', 'sender_avatar', 'content', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']


class ConversationListSerializer(serializers.ModelSerializer):
    """Conversation list with last message and other participant info."""
    other_user_name = serializers.SerializerMethodField()
    other_user_avatar = serializers.SerializerMethodField()
    other_user_id = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'other_user_name', 'other_user_avatar', 'other_user_id',
            'last_message', 'unread_count', 'updated_at',
        ]

    def _get_other_participant(self, obj):
        user = self.context['request'].user
        return obj.participants.exclude(user=user).select_related('user').first()

    def get_other_user_name(self, obj):
        p = self._get_other_participant(obj)
        return p.user.full_name if p else None

    def get_other_user_avatar(self, obj):
        p = self._get_other_participant(obj)
        if p and p.user.avatar:
            request = self.context.get('request')
            return request.build_absolute_uri(p.user.avatar.url) if request else p.user.avatar.url
        return None

    def get_other_user_id(self, obj):
        p = self._get_other_participant(obj)
        return str(p.user.id) if p else None

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return {'content': msg.content[:100], 'sender_name': msg.sender.full_name, 'created_at': msg.created_at}
        return None

    def get_unread_count(self, obj):
        user = self.context['request'].user
        participant = obj.participants.filter(user=user).first()
        if not participant or not participant.last_read_at:
            return obj.messages.exclude(sender=user).count()
        return obj.messages.exclude(sender=user).filter(created_at__gt=participant.last_read_at).count()


class StartConversationSerializer(serializers.Serializer):
    recipient_id = serializers.UUIDField()
    message = serializers.CharField()
