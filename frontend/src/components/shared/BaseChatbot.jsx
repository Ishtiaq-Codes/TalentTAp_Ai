import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, User } from 'lucide-react'
import { streamFetch } from '@/api/streamFetch'

/**
 * Shared chatbot shell used by both CopilotChatbot (authenticated) and PublicChatbot (unauthenticated).
 * Accepts configuration props to customize appearance and behavior.
 */
export default function BaseChatbot({
  endpoint,
  initialMessage,
  headerIcon: HeaderIcon,
  headerTitle = 'TalentTap AI',
  headerSubtitle = 'AI Assistant',
  headerClassName = 'bg-slate-900',
  headerTextClassName = 'text-white',
  buttonClassName = 'bg-slate-900 text-white',
  buttonContent,
  userBubbleClassName = 'bg-slate-900 text-white rounded-tr-sm',
  requiresAuth = true,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: initialMessage }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsTyping(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      await streamFetch(
        endpoint,
        { method: 'POST', body: { message: userMsg }, auth: requiresAuth },
        (chunk) => {
          setMessages(prev => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            updated[updated.length - 1] = { ...last, content: last.content + chunk }
            return updated
          })
        }
      )
    } catch (err) {
      console.error(err)
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: "Sorry, I'm having trouble connecting right now." }
        return updated
      })
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-300 z-40 ${buttonClassName} ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'} ${buttonContent ? 'px-6 gap-2' : 'w-14'}`}
      >
        {buttonContent || (HeaderIcon && <HeaderIcon className="h-6 w-6" />)}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}`}
        style={{ height: '600px', maxHeight: 'calc(100vh - 48px)' }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 shrink-0 ${headerClassName}`}>
          <div className={`flex items-center gap-2 ${headerTextClassName}`}>
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{headerTitle}</h3>
              <p className="text-[10px] opacity-80">{headerSubtitle}</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-ai/20'}`}>
                {msg.role === 'user' ? <User className="h-4 w-4 text-slate-600" /> : <Bot className="h-4 w-4 text-ai" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${msg.role === 'user' ? userBubbleClassName : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-sm'}`}>
                {msg.content}
                {isTyping && idx === messages.length - 1 && msg.content === '' && (
                  <span className="flex gap-1 items-center h-5">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ai/50 focus:border-ai/50 transition-all"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-1.5 p-1.5 rounded-full bg-slate-900 text-white disabled:bg-slate-300 transition-colors"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
