// app/api/chat/route.ts

import { createManualToolStreamResponse } from '@/lib/streaming/create-manual-tool-stream'
import { createToolCallingStreamResponse } from '@/lib/streaming/create-tool-calling-stream'
import { Model } from '@/lib/types/models'
import { isProviderEnabled } from '@/lib/utils/registry'
import { cookies } from 'next/headers'

export const maxDuration = 30

const DEFAULT_MODEL: Model = {
      "id": "gemini-2.0-flash",
      "name": "Gemini 2.0 Flash",
      "provider": "Google Generative AI",
      "providerId": "google",
      "enabled": true,
      "toolCallType": "manual"
}

export async function POST(req: Request) {
  try {
    const { messages, id: chatId } = await req.json()

    if (!messages || messages.length === 0) {
      return new Response('Messages array cannot be empty.', {
        status: 400,
        statusText: 'Bad Request'
      });
    }

    const referer = req.headers.get('referer')
    const isSharePage = referer?.includes('/share/')

    if (isSharePage) {
      return new Response('Chat API is not available on share pages', {
        status: 403,
        statusText: 'Forbidden'
      })
    }

    const cookieStore = await cookies()
    // --- НАЧАЛО ИЗМЕНЕНИЯ ---
    // Жестко отключаем режим поиска. Он всегда будет false.
    const searchMode = false;
    // --- КОНЕЦ ИЗМЕНЕНИЯ ---

    // Логика выбора модели остается, но она всегда будет выбирать DEFAULT_MODEL,
    // так как cookie 'selectedModel' больше не будет устанавливаться на клиенте.
    let selectedModel = DEFAULT_MODEL
    const modelJson = cookieStore.get('selectedModel')?.value
    if (modelJson) {
      try {
        selectedModel = JSON.parse(modelJson) as Model
      } catch (e) {
        console.error('Failed to parse selected model:', e)
      }
    }

    if (
      !isProviderEnabled(selectedModel.providerId) ||
      selectedModel.enabled === false
    ) {
      return new Response(
        `Selected provider is not enabled ${selectedModel.providerId}`,
        {
          status: 404,
          statusText: 'Not Found'
        }
      )
    }

    const supportsToolCalling = selectedModel.toolCallType === 'native'

    return supportsToolCalling
      ? createToolCallingStreamResponse({
          messages,
          model: selectedModel,
          chatId,
          searchMode // Всегда будет false
        })
      : createManualToolStreamResponse({
          messages,
          model: selectedModel,
          chatId,
          searchMode // Всегда будет false
        })
  } catch (error) {
    if (error instanceof Error && error.message.includes('messages must not be empty')) {
        console.warn("Caught an empty message error that should have been handled earlier.");
        return new Response('Messages array cannot be empty.', { status: 400 });
    }
    console.error('API route error:', error)
    return new Response('Error processing your request', {
      status: 500,
      statusText: 'Internal Server Error'
    })
  }
}
