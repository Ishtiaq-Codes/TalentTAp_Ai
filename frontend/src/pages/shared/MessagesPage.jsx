import { useState } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { messagingAPI } from '@/api/messaging'
import { useAuth } from '@/contexts/AuthContext'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import EmptyState from '@/components/common/EmptyState'
import { timeAgo } from '@/lib/utils'
import { MessageSquare, Send, ArrowLeft } from 'lucide-react'

export default function MessagesPage() {
 const { user } = useAuth()
 const { data: conversations, loading, refetch } = useFetch(() => messagingAPI.getConversations())
 const [activeConvo, setActiveConvo] = useState(null)
 const [messages, setMessages] = useState([])
 const [input, setInput] = useState('')
 const [loadingMsgs, setLoadingMsgs] = useState(false)

 const openConversation = async (convo) => {
  setActiveConvo(convo)
  setLoadingMsgs(true)
  try {
   const { data } = await messagingAPI.getMessages(convo.id)
   setMessages(Array.isArray(data) ? data : data?.results || [])
   await messagingAPI.markRead(convo.id)
  } catch { setMessages([]) }
  setLoadingMsgs(false)
 }

 const sendMessage = async () => {
  if (!input.trim() || !activeConvo) return
  try {
   const { data } = await messagingAPI.sendMessage(activeConvo.id, input.trim())
   setMessages([...messages, data])
   setInput('')
   refetch(true)
  } catch { }
 }

 const convoList = Array.isArray(conversations) ? conversations : []

 return (
  <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border bg-card">
   {/* Conversations list */}
   <div className={`w-full border-r sm:w-80 ${activeConvo ? 'hidden sm:block' : ''}`}>
    <div className="border-b p-4">
     <h2 className="font-semibold">Messages</h2>
    </div>
    {loading ? (
     <div className="p-4 text-sm text-muted-foreground">Loading...</div>
    ) : convoList.length === 0 ? (
     <EmptyState icon={MessageSquare} title="No messages"description="Start a conversation from a candidate or recruiter profile."/>
    ) : (
     <div className="divide-y overflow-y-auto">
      {convoList.map((convo) => (
       <button key={convo.id} onClick={() => openConversation(convo)}
        className={`flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors ${activeConvo?.id === convo.id ? 'bg-muted' : ''}`}>
        <ProfileAvatar name={convo.other_user_name} src={convo.other_user_avatar} size="sm"/>
        <div className="flex-1 overflow-hidden">
         <div className="flex items-center justify-between">
          <p className="text-sm font-medium truncate">{convo.other_user_name}</p>
          {convo.unread_count > 0 && (
           <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{convo.unread_count}</span>
          )}
         </div>
         <p className="text-xs text-muted-foreground truncate">{convo.last_message?.content}</p>
        </div>
       </button>
      ))}
     </div>
    )}
   </div>

   {/* Chat area */}
   <div className={`flex flex-1 flex-col ${!activeConvo ? 'hidden sm:flex' : ''}`}>
    {activeConvo ? (
     <>
      <div className="flex items-center gap-3 border-b p-4">
       <button onClick={() => setActiveConvo(null)} className="sm:hidden"><ArrowLeft className="h-5 w-5"/></button>
       <ProfileAvatar name={activeConvo.other_user_name} src={activeConvo.other_user_avatar} size="sm"/>
       <p className="font-medium">{activeConvo.other_user_name}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
       {loadingMsgs ? (
        <p className="text-center text-sm text-muted-foreground">Loading messages...</p>
       ) : messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}>
         <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          <p>{msg.content}</p>
          <p className={`mt-1 text-[10px] ${msg.sender === user?.id ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
           {timeAgo(msg.created_at)}
          </p>
         </div>
        </div>
       ))}
      </div>
      <div className="border-t p-4">
       <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..."
         onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
         className="flex-1 rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
        <button onClick={sendMessage} className="rounded-lg bg-primary p-2.5 text-primary-foreground hover:bg-primary/90">
         <Send className="h-4 w-4"/>
        </button>
       </div>
      </div>
     </>
    ) : (
     <div className="flex flex-1 items-center justify-center text-muted-foreground">
      <p>Select a conversation to start messaging</p>
     </div>
    )}
   </div>
  </div>
 )
}
