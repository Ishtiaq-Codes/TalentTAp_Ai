import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles, Bot, User } from 'lucide-react'
import client from '@/api/client'

export default function PublicChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const initialMessage = "Hi there! 👋 I'm the TalentTap AI Assistant. Have any questions about our platform, features, or pricing?"

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
      
      const response = await fetch(`${baseURL}/chat/public/stream/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
      {/* Floating Button - Pill shaped to look like a chat box */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 px-6 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-xl hover:bg-primary/90 transition-all duration-300 z-40 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="h-5 w-5" />
        <span className="font-semibold text-sm">Ask AI</span>
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[340px] sm:w-[400px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}`} style={{ height: '600px', maxHeight: 'calc(100vh - 48px)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between bg-primary px-4 py-3 shrink-0">
          <div className="flex items-center gap-2 text-primary-foreground">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">TalentTap AI</h3>
              <p className="text-[10px] text-primary-foreground/80 font-medium">Sales & Support Assistant</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-primary-foreground/70 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-2">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <p className="text-xs text-slate-500 font-medium">Chat started today</p>
          </div>

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-primary text-white'}`}>
                {msg.role === 'user' ? <User className="h-4 w-4 text-indigo-600" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
              }`}>
                {msg.role === 'assistant' && msg.content === '' ? (
                  <div className="flex gap-1 items-center h-5">
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full bg-slate-100 text-slate-900 text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              disabled={isTyping}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-1.5 h-9 w-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-sm"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </form>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" /> Powered by TalentTap AI
            </p>
          </div>
        </div>
        
      </div>
    </>
  )
}
