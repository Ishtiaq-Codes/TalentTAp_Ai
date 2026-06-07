import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles, Bot, User } from 'lucide-react'
import client from '@/api/client'

export default function CopilotChatbot({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const initialMessage = user?.role === 'recruiter' 
    ? "Hi! I'm your AI Copilot. How can I help you with recruiting today?" 
    : user?.role === 'company_admin'
    ? "Hi! I'm your AI Admin Copilot. How can I help you manage your company profile and settings today?"
    : "Hi! I'm your AI Career Copilot. How can I help you optimize your profile or find jobs today?";

  const [messages, setMessages] = useState([
    { role: 'assistant', content: initialMessage }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return
    
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsTyping(true)
    
    // Add empty assistant message placeholder
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])
    
    try {
      const baseURL = client.defaults.baseURL || 'http://localhost:8000/api/v1'
      const token = localStorage.getItem('access_token')
      
      const response = await fetch(`${baseURL}/chat/stream/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: userMsg })
      })
      
      if (!response.ok) throw new Error('Network response was not ok')
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder("utf-8")
      let done = false
      
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMsg = newMessages[newMessages.length - 1]
            newMessages[newMessages.length - 1] = { ...lastMsg, content: lastMsg.content + chunk }
            return newMessages
          })
        }
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1].content = "Sorry, I'm having trouble connecting right now."
        return newMessages
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
        className={`fixed bottom-6 right-6 h-14 w-14 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-300 z-40 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <Sparkles className="h-6 w-6 text-ai" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}`} style={{ height: '600px', maxHeight: 'calc(100vh - 48px)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2 text-white">
            <div className="bg-ai/20 p-1.5 rounded-lg">
              <Bot className="h-5 w-5 text-ai" />
            </div>
            <div>
              <h3 className="font-bold text-sm">TalentTap AI</h3>
              <p className="text-[10px] text-slate-300">
                {user?.role === 'recruiter' ? 'Recruiter Copilot' : user?.role === 'company_admin' ? 'Admin Copilot' : 'Career Copilot'}
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
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
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-sm'}`}>
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
