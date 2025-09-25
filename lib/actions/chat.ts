// lib/actions/chat.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'

// --- НАЧАЛО ИЗМЕНЕНИЙ ---
// ВСЯ ЛОГИКА REDIS ПОЛНОСТЬЮ УДАЛЕНА.
// Функции оставлены "пустышками", чтобы не вызывать ошибок импорта в других файлах.
// Они ничего не делают и возвращают пустые данные.

export async function getChats(userId?: string | null): Promise<Chat[]> {
  console.log('HISTORY DISABLED: getChats returning empty array.');
  return [];
}

export async function getChat(id: string, userId: string = 'anonymous'): Promise<Chat | null> {
  console.log('HISTORY DISABLED: getChat returning null.');
  return null;
}

export async function clearChats(userId: string = 'anonymous'): Promise<{ error?: string }> {
  console.log('HISTORY DISABLED: clearChats doing nothing.');
  // Для совместимости с UI, который может ожидать редирект, делаем его
  revalidatePath('/');
  redirect('/');
}

export async function saveChat(chat: Chat, userId: string = 'anonymous') {
  console.log('HISTORY DISABLED: saveChat doing nothing.');
  // Ничего не сохраняем
  return;
}

export async function getSharedChat(id: string): Promise<Chat | null> {
  console.log('HISTORY DISABLED: getSharedChat returning null.');
  return null;
}

export async function shareChat(id: string, userId: string = 'anonymous'): Promise<Chat | null> {
  console.log('HISTORY DISABLED: shareChat doing nothing.');
  return null;
}
// --- КОНЕЦ ИЗМЕНЕНИЙ ---
