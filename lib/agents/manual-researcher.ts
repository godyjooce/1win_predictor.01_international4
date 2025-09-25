// lib/agents/manual-researcher.ts

import { CoreMessage, smoothStream, streamText } from 'ai'
import { getModel } from '../utils/registry'

// --- НАЧАЛО ИЗМЕНЕНИЙ ---

// URL вашего НОВОГО защищенного API-эндпоинта
const PROMPT_API_URL = 'https://dombyta-shoes.ru/api/get-prompt.php'; 

// Запасной (безопасный) промпт
const FALLBACK_BASE_SYSTEM_PROMPT = `
You are Vi, an expert analyst from Oracle. Your primary goal is to assist users in a helpful and friendly manner.
`.trim();

// Функция для получения системного промпта
async function getBaseSystemPrompt(): Promise<string> {
  // Получаем секретный ключ из переменных окружения Vercel
  const apiKey = process.env.PROMPT_API_SECRET_KEY;

  // Если ключ не установлен в Vercel, сразу используем запасной промпт
  if (!apiKey) {
    console.error("PROMPT_API_SECRET_KEY is not set in Vercel environment. Using fallback prompt.");
    return FALLBACK_BASE_SYSTEM_PROMPT;
  }

  try {
    const response = await fetch(PROMPT_API_URL, {
      method: 'GET',
      headers: {
        // Добавляем наш секретный ключ в заголовок
        'X-Secret-Key': apiKey,
      },
      cache: 'no-store', // Всегда запрашивать свежую версию
    });

    if (!response.ok) {
      console.warn(`Failed to fetch prompt from API (status: ${response.status}). Using fallback prompt.`);
      return FALLBACK_BASE_SYSTEM_PROMPT;
    }

    const promptText = await response.text();
    console.log("Successfully fetched prompt from your secure API.");
    return promptText.trim();
    
  } catch (error) {
    console.error('Error fetching prompt from API:', error);
    console.log("Using fallback prompt due to a network error.");
    return FALLBACK_BASE_SYSTEM_PROMPT;
  }
}

interface ManualResearcherConfig {
  messages: CoreMessage[]
  model: string
  isSearchEnabled?: boolean
}

type ManualResearcherReturn = Parameters<typeof streamText>[0]

// Функция теперь асинхронная (async), чтобы дождаться загрузки промпта
export async function manualResearcher({
  messages,
  model,
  isSearchEnabled = true
}: ManualResearcherConfig): Promise<ManualResearcherReturn> {
  try {
    // 1. Получаем базовый промпт с вашего сервера
    const baseSystemPrompt = await getBaseSystemPrompt();

    // 2. Формируем полный промпт в зависимости от режима поиска
    const SEARCH_ENABLED_PROMPT = `
      ${baseSystemPrompt}

      When analyzing search results:
      1. Analyze the provided search results carefully to answer the user's question
      2. Always cite sources using the [number](url) format, matching the order of search results
      3. If multiple sources are relevant, include all of them using comma-separated citations
      4. Only use information that has a URL available for citation
      5. If the search results don't contain relevant information, acknowledge this and provide a general response

      Citation Format:
      [number](url)
    `;

    const SEARCH_DISABLED_PROMPT = `
      ${baseSystemPrompt}

      Important:
      1. Provide responses based on your general knowledge
      2. Be clear about any limitations in your knowledge
      3. Suggest when searching for additional information might be beneficial
    `;
    
    const currentDate = new Date().toLocaleString()
    const systemPrompt = isSearchEnabled
      ? SEARCH_ENABLED_PROMPT
      : SEARCH_DISABLED_PROMPT

    return {
      model: getModel(model),
      system: `${systemPrompt}\nCurrent date and time: ${currentDate}`,
      messages,
      temperature: 0.6,
      topP: 1,
      topK: 40,
      experimental_transform: smoothStream()
    }
  } catch (error) {
    console.error('Error in manualResearcher:', error)
    throw error
  }
}
// --- КОНЕЦ ИЗМЕНЕНИЙ ---
