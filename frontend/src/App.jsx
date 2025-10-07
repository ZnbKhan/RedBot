import React from 'react'
import ChatWindow from './components/ChatWindow'

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ChatWindow initialLang="en" />
    </div>
  )
}
