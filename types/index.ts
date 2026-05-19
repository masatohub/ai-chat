export type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

export type TextPart = {
  type: 'text'
  text: string
}

export type ImagePart = {
  type: 'image'
  mediaType: ImageMediaType
  data: string // base64 (without data: prefix)
}

export type ContentPart = TextPart | ImagePart

export type Message = {
  role: 'user' | 'assistant'
  content: string | ContentPart[]
}
