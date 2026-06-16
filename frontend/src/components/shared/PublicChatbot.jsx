import { MessageSquare, Sparkles } from 'lucide-react'
import BaseChatbot from './BaseChatbot'

export default function PublicChatbot() {
  const initialMessage = "Hi there! 👋 I'm the TalentTap AI Assistant. Have any questions about our platform, features, or pricing?"

  return (
    <BaseChatbot
      endpoint="/chat/public/stream/"
      initialMessage={initialMessage}
      headerIcon={Sparkles}
      headerTitle="TalentTap AI"
      headerSubtitle="Sales & Support Assistant"
      headerClassName="bg-primary"
      headerTextClassName="text-primary-foreground"
      buttonClassName="bg-primary text-primary-foreground hover:-translate-y-1 hover:bg-primary/90"
      buttonContent={
        <>
          <MessageSquare className="h-5 w-5" />
          <span className="font-semibold text-sm">Ask AI</span>
        </>
      }
      userBubbleClassName="bg-indigo-600 text-white rounded-tr-sm"
      requiresAuth={false}
    />
  )
}
