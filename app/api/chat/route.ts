import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import Anthropic from '@anthropic-ai/sdk'
import { anthropic } from '@/lib/anthropic'
import type { Message } from '@/types'

const app = new Hono().basePath('/api')

app.post('/chat', async (c) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return c.json({ error: 'ANTHROPIC_API_KEY is not configured' }, 500)
  }

  let messages: Message[]
  try {
    const body = await c.req.json()
    messages = body.messages
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return c.json({ error: 'messages must be a non-empty array' }, 400)
  }

  // Convert our Message type to Anthropic.MessageParam
  const anthropicMessages: Anthropic.MessageParam[] = messages.map(msg => ({
    role: msg.role,
    content: Array.isArray(msg.content)
      ? msg.content.map(part =>
          part.type === 'text'
            ? { type: 'text' as const, text: part.text }
            : {
                type: 'image' as const,
                source: {
                  type: 'base64' as const,
                  media_type: part.mediaType,
                  data: part.data,
                },
              }
        )
      : msg.content,
  }))

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: anthropicMessages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        stream.on('text', (delta) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(delta)}\n\n`))
        })
        await stream.done()
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        if (err instanceof Anthropic.APIError) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`)
          )
        }
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
})

export const POST = handle(app)
