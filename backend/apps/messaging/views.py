"""Messaging views."""
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .models import Conversation, ConversationParticipant, Message
from .serializers import ConversationListSerializer, MessageSerializer, StartConversationSerializer

User = get_user_model()


class ConversationListView(generics.ListAPIView):
    """List conversations for the current user."""
    serializer_class = ConversationListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants__user=self.request.user,
        ).prefetch_related('participants__user', 'messages').distinct()


class StartConversationView(APIView):
    """Start a new conversation with a user."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = StartConversationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        recipient_id = serializer.validated_data['recipient_id']
        try:
            recipient = User.objects.get(pk=recipient_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if conversation already exists
        existing = Conversation.objects.filter(
            participants__user=request.user,
        ).filter(
            participants__user=recipient,
        ).first()

        if existing:
            conversation = existing
        else:
            conversation = Conversation.objects.create()
            ConversationParticipant.objects.create(conversation=conversation, user=request.user)
            ConversationParticipant.objects.create(conversation=conversation, user=recipient)

        Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=serializer.validated_data['message'],
        )
        conversation.save()  # updates updated_at

        return Response(
            ConversationListSerializer(conversation, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class ConversationDetailView(generics.ListAPIView):
    """Get messages in a conversation."""
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(
            conversation_id=self.kwargs['pk'],
            conversation__participants__user=self.request.user,
        ).select_related('sender')


class SendMessageView(APIView):
    """Send a message in a conversation."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Verify user is a participant
        if not ConversationParticipant.objects.filter(conversation_id=pk, user=request.user).exists():
            return Response({'detail': 'Not a participant.'}, status=status.HTTP_403_FORBIDDEN)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'detail': 'Message cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(
            conversation_id=pk,
            sender=request.user,
            content=content,
        )
        # Update conversation timestamp
        Conversation.objects.filter(pk=pk).update(updated_at=timezone.now())

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class MarkConversationReadView(APIView):
    """Mark a conversation as read."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        participant = ConversationParticipant.objects.filter(
            conversation_id=pk, user=request.user,
        ).first()
        if not participant:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        participant.last_read_at = timezone.now()
        participant.save(update_fields=['last_read_at'])
        return Response({'detail': 'Marked as read.'})
