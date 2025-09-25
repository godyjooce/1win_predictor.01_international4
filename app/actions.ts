// app/actions.ts
'use server'

import { Model } from '@/lib/types/models'
import { getModels as getModelsFromServer } from '@/lib/config/models'

// Эта функция остается без изменений, она нужна для загрузки моделей
export async function fetchModelsAction(): Promise<Model[]> {
  try {
    const models = getModelsFromServer()
    return models
  } catch (error) {
    console.error("Error fetching models in action:", error)
    throw new Error("Failed to fetch models"); 
  }
}

// --- НАЧАЛО ИЗМЕНЕНИЙ ---
// Ниже мы "обезвреживаем" все функции, связанные с историей чата.

// Эта функция пыталась получить один чат. Теперь она всегда возвращает null.
export async function getChat(id: string, userId: string) {
  console.log('Chat history is disabled. Returning null for getChat.');
  return null;
}

// Эта функция пыталась получить список всех чатов. Теперь она возвращает пустой массив.
export async function getChats(userId?: string | null) {
  console.log('Chat history is disabled. Returning empty array for getChats.');
  return [];
}

// Эта функция пыталась удалить чат. Теперь она ничего не делает.
export async function removeChat({ id, path }: { id: string; path: string }) {
  console.log('Chat history is disabled. Skipping removeChat.');
  return {
    error: 'Chat history is disabled.'
  };
}

// Эта функция пыталась очистить историю. Теперь ничего не делает.
export async function clearChats() {
  console.log('Chat history is disabled. Skipping clearChats.');
  return {
    error: 'Chat history is disabled.'
  };
}

// Эта функция пыталась получить общий доступ к чату. Теперь ничего не делает.
export async function getSharedChat(id: string) {
  console.log('Chat history is disabled. Returning null for getSharedChat.');
  return null;
}

// Эта функция пыталась сохранить чат. Теперь ничего не делает.
export async function shareChat(chat: any) { // Тип 'any' для простоты, так как функция пустая
  console.log('Chat history is disabled. Skipping shareChat.');
  return {
    error: 'Chat history is disabled.'
  };
}

// --- КОНЕЦ ИЗМЕНЕНИЙ ---
