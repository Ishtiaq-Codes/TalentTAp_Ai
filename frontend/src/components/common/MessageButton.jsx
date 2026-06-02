import { useState } from 'react'
import { messagingAPI } from '@/api/messaging'
import { useNavigate } from 'react-router-dom'
import { Mail, X } from 'lucide-react'

export default function MessageButton({ recipientId, name }) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()

  // If no recipientId is provided, we can't send a message.
  if (!recipientId) return null

  const handleSend = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    try {
      await messagingAPI.startConversation({ recipient_id: recipientId, message: message.trim() })
      setIsOpen(false)
      setMessage('')
      alert('Message sent successfully!')
      // Optionally navigate to messages page to view conversation
      // navigate('/recruiter/messages')
    } catch (err) {
      alert(err.response?.data?.detail || 'Error sending message')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
        title="Send Message"
      >
        <Mail className="h-3.5 w-3.5" /> Message
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-semibold">Message {name}</h2>
              <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
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
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted">
                  Cancel
                </button>
                <button type="submit" disabled={sending || !message.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
