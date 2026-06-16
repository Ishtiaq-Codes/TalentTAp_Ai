import { Sparkles } from 'lucide-react'
import BaseChatbot from './BaseChatbot'

export default function CopilotChatbot({ user }) {
  const initialMessage = user?.role === 'recruiter'
    ? "Hi! I'm your AI Copilot. How can I help you with recruiting today?"
    : user?.role === 'company_admin'
    ? "Hi! I'm your AI Admin Copilot. How can I help you manage your company profile and settings today?"
    : "Hi! I'm your AI Career Copilot. How can I help you optimize your profile or find jobs today?"

  const subtitle = user?.role === 'recruiter'
    ? 'Recruiter Copilot'
    : user?.role === 'company_admin'
    ? 'Admin Copilot'
    : 'Career Copilot'

  return (
    <BaseChatbot
      endpoint="/chat/stream/"
      initialMessage={initialMessage}
      headerIcon={Sparkles}
      headerSubtitle={subtitle}
      buttonContent={<Sparkles className="h-6 w-6 text-ai" />}
      requiresAuth={true}
    />
  )
}
