import React from 'react'

export default function MessageBubble({ role = 'bot', children }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] px-4 py-2 rounded-xl ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="whitespace-pre-wrap">{children}</div>
      </div>
    </div>
  )
}
