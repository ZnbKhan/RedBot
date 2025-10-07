import React, { useState, useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

function getWelcome(l) {
  return l === 'hi'
    ? 'नमस्ते — मैं RedBot हूँ। कैसे मदद करूँ? (उदाहरण: "मेरा पीरियड लेट है")'
    : 'Hi — I’m RedBot. How can I help today? (e.g., "My period is late")'
}

export default function ChatWindow({ initialLang = 'en' }) {
  const [lang, setLang] = useState(initialLang)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem('redbot:history')
      return raw ? JSON.parse(raw) : [{ role: 'bot', text: getWelcome(initialLang) }]
    } catch {
      return [{ role: 'bot', text: getWelcome(initialLang) }]
    }
  })
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('redbot:history', JSON.stringify(messages))
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  useEffect(() => {
    setMessages((m) => [...m, { role: 'bot', text: getWelcome(lang) }])
  }, [lang])

  function getSessionId() {
    let id = localStorage.getItem('redbot:sessionId')
    if (!id) {
      id = 's_' + Math.random().toString(36).slice(2, 10)
      localStorage.setItem('redbot:sessionId', id)
    }
    return id
  }

  async function sendMessage(text) {
    if (!text.trim()) return
    const userMsg = { role: 'user', text, ts: Date.now() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    const sessionId = getSessionId()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, lang, sessionId })
      })
      if (!res.ok) throw new Error('Network response not OK')
      const data = await res.json()
      if (Array.isArray(data.messages)) {
        setMessages((m) => [...m, ...data.messages.map((t) => ({ role: t.role, text: t.text }))])
      } else if (data.text) {
        setMessages((m) => [...m, { role: 'bot', text: data.text }])
      } else {
        setMessages((m) => [...m, { role: 'bot', text: 'Sorry — I could not parse the response.' }])
      }
    } catch (err) {
      console.error(err)
      setMessages((m) => [...m, { role: 'bot', text: 'Network error — please try again later.' }])
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  function quickReply(text) {
    sendMessage(text)
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col h-[640px]">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center">❤️</div>
          <div>
            <div className="font-semibold">RedBot</div>
            <div className="text-xs text-gray-500">Your menstrual health companion</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="Switch language" onClick={() => setLang((l) => (l === 'en' ? 'hi' : 'en'))} className="text-sm text-gray-600 hover:text-gray-900">
            {lang === 'en' ? 'EN' : 'हिन्दी'}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
        {messages.map((m, idx) => (
          <MessageBubble key={idx} role={m.role}>{m.text}</MessageBubble>
        ))}
        <div ref={endRef} />
      </main>

      <div className="p-3 border-t">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={lang === 'hi' ? 'अपना संदेश टाइप करें...' : 'Type your message...'} className="flex-1 rounded-full px-4 py-2 border focus:outline-none" aria-label="Message input" />
          <button type="submit" disabled={loading} className="rounded-full px-4 py-2 bg-pink-500 text-white disabled:opacity-60">
            {loading ? '...' : lang === 'hi' ? 'भेजें' : 'Send'}
          </button>
        </form>

        <div className="mt-2 flex gap-2">
          <button onClick={() => quickReply(lang === 'hi' ? 'मुझे दर्द हो रहा है' : "I'm having cramps")} className="text-xs px-2 py-1 border rounded-full">{lang === 'hi' ? 'मासिक धर्म में दर्द' : 'Cramps'}</button>
          <button onClick={() => quickReply(lang === 'hi' ? 'मेरा पीरियड लेट है' : 'My period is late')} className="text-xs px-2 py-1 border rounded-full">{lang === 'hi' ? 'पीरियड लेट' : 'Period late'}</button>
          <button onClick={() => quickReply(lang === 'hi' ? 'मुझे मदद चाहिए' : 'I need help')} className="text-xs px-2 py-1 border rounded-full">{lang === 'hi' ? 'मदद' : 'Help'}</button>
        </div>
      </div>
    </div>
  )
}
