'use client'

import { useState } from 'react'
import type { Message } from '@/types'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (text: string) => {
    const userMessage: Message = { role: 'user', content: text }
    const nextMessages: Message[] = [...messages, userMessage]
    setMessages(nextMessages)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })

      if (!response.ok || !response.body) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }))
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `エラー: ${err.error ?? 'Unknown error'}` },
        ])
        return
      }

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            if (typeof parsed === 'string') {
              setMessages(prev => {
                const last = prev[prev.length - 1]
                return [
                  ...prev.slice(0, -1),
                  { ...last, content: last.content + parsed },
                ]
              })
            } else if (parsed?.error) {
              setMessages(prev => {
                const last = prev[prev.length - 1]
                return [
                  ...prev.slice(0, -1),
                  { ...last, content: `エラー: ${parsed.error}` },
                ]
              })
            }
          } catch {
            // malformed SSE line — skip
          }
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'ネットワークエラーが発生しました。' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-dvh bg-white">
      <header className="shrink-0 flex items-center justify-center h-12 border-b border-gray-200 bg-white">
        <span className="text-sm font-semibold text-gray-700 tracking-wide">AI Chat</span>
      </header>
      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  )
}
