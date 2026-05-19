'use client'

import { useRef, useState } from 'react'
import type { ImageMediaType, ImagePart } from '@/types'

type Props = {
  onSend: (text: string, image?: ImagePart) => void
  isLoading: boolean
}

const VALID_TYPES: ImageMediaType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

export function MessageInput({ onSend, isLoading }: Props) {
  const textRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingImage, setPendingImage] = useState<{
    part: ImagePart
    previewUrl: string
  } | null>(null)

  const submit = () => {
    const text = textRef.current?.value.trim() ?? ''
    if ((!text && !pendingImage) || isLoading) return

    onSend(text, pendingImage?.part)

    if (textRef.current) {
      textRef.current.value = ''
      textRef.current.style.height = 'auto'
    }
    setPendingImage(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (!VALID_TYPES.includes(file.type as ImageMediaType)) {
      alert('JPEG / PNG / GIF / WebP のみ対応しています')
      return
    }
    if (file.size > MAX_BYTES) {
      alert('ファイルサイズは 5MB 以下にしてください')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const [header, data] = dataUrl.split(',')
      const mediaType = header.match(/:(.*?);/)?.[1] as ImageMediaType
      setPendingImage({
        part: { type: 'image', mediaType, data },
        previewUrl: dataUrl,
      })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="border-t border-gray-200 bg-white">
      {pendingImage && (
        <div className="px-4 pt-3 flex items-start gap-2">
          <div className="relative inline-block">
            <img
              src={pendingImage.previewUrl}
              alt="添付画像"
              className="h-20 w-20 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={() => setPendingImage(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-gray-800"
              aria-label="画像を削除"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="flex items-end gap-2 px-4 py-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isLoading}
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          aria-label="画像を添付"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <textarea
          ref={textRef}
          rows={1}
          onKeyDown={handleKeyDown}
          onChange={handleTextInput}
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
    </div>
  )
}
