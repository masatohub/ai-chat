'use client'

import { useEffect, useRef } from 'react'
import type { Message } from '@/types'

type Props = {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const lastIsAssistant =
    messages.length > 0 && messages[messages.length - 1].role === 'assistant'

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 select-none">
          <span className="text-4xl">💬</span>
          <p className="text-sm">Claude に何でも聞いてみましょう</p>
        </div>
      )}
      {messages.map((msg, i) => {
        const isStreamingThis =
          isLoading && i === messages.length - 1 && msg.role === 'assistant'

        return (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm break-words leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {typeof msg.content === 'string' ? (
                <>
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                  {isStreamingThis && (
                    <span className="inline-block w-0.5 h-3.5 bg-gray-500 ml-0.5 align-middle animate-pulse" />
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  {msg.content.map((part, j) =>
                    part.type === 'image' ? (
                      <img
                        key={j}
                        src={`data:${part.mediaType};base64,${part.data}`}
                        alt="添付画像"
                        className="rounded-lg max-w-full block"
                      />
                    ) : (
                      part.text && (
                        <p key={j} className="whitespace-pre-wrap">
                          {part.text}
                        </p>
                      )
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
      {isLoading && !lastIsAssistant && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-2xl px-4 py-3 flex gap-1 items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
