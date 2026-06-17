import { useState } from 'react'
import { createPortal } from 'react-dom'
import { messagingAPI } from '@/api/messaging'
import { useNavigate } from 'react-router-dom'
import { Mail, X } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import UpgradeModal from '@/components/common/UpgradeModal'

export default function MessageButton({ recipientId, name, showText = true, className = "" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { user } = useAuth()

  // If no recipientId is provided, we can't send a message.
  if (!recipientId) return null

  const handleOpen = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Pro check
    if (user?.role === 'recruiter' || user?.role === 'company_admin') {
      if (user.is_pro === false) {
        setShowUpgradeModal(true)
        return
      }
    }
    setIsOpen(true)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!message.trim()) return
    setSending(true)
    try {
      await messagingAPI.startConversation({ recipient_id: recipientId, message: message.trim() })
      setIsOpen(false)
      setMessage('')
      success('Message sent successfully!')
    } catch (err) {
      error(err.response?.data?.detail || 'Error sending message')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors ${className}`}
        title="Send Message"
      >
        <Mail className="h-3.5 w-3.5" /> {showText && "Message"}
      </button>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        featureName="Direct Candidate Messaging" 
      />

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-100/80 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
          <div className="w-full max-w-md rounded-xl border bg-card shadow-lg relative">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-semibold">Message {name}</h2>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); }} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSend} className="p-4 space-y-4">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type your first message..."
                rows={4}
                className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); }} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted">
                  Cancel
                </button>
                <button type="submit" disabled={sending || !message.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
