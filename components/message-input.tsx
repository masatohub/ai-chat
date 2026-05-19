'use client'

import { useRef } from 'react'

type Props = {
  onSend: (text: string) => void
  isLoading: boolean
}

export function MessageInput({ onSend, isLoading }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const submit = () => {
    const text = ref.current?.value.trim()
    if (!text || isLoading) return
    onSend(text)
    if (ref.current) {
      ref.current.value = ''
      ref.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  return (
    <div className="flex items-end gap-2 px-4 py-3 border-t border-gray-200 bg-white">
      <textarea
        ref={ref}
        rows={1}
        onKeyDown={handleKeyDown}
        onChange={handleInput}
        disabled={isLoading}
        placeholder="メッセージを入力… (Enter で送信 / Shift+Enter で改行)"
        className="flex-1 resize-none overflow-y-auto rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 leading-relaxed"
        style={{ maxHeight: 200 }}
      />
      <button
        onClick={submit}
        disabled={isLoading}
        className="shrink-0 rounded-xl bg-blue-500 px-5 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '送信中…' : '送信'}
      </button>
    </div>
  )
}
