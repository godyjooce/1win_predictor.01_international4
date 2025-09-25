// lib/config/models.ts

import { Model } from '@/lib/types/models';
// ПРЯМОЙ ИМПОРТ: Мы импортируем JSON напрямую, вместо того чтобы его запрашивать по сети.
import defaultModelsConfig from './default-models.json';

// Функция валидации остается без изменений.
export function validateModel(model: any): model is Model {
  return (
    typeof model.id === 'string' &&
    typeof model.name === 'string' &&
    typeof model.provider === 'string' &&
    typeof model.providerId === 'string' &&
    typeof model.enabled === 'boolean' &&
    (model.toolCallType === 'native' || model.toolCallType === 'manual') &&
    (model.toolCallModel === undefined ||
      typeof model.toolCallModel === 'string')
  );
}

// УПРОЩЕННАЯ ФУНКЦИЯ getModels:
// Она теперь не асинхронная и просто возвращает проверенные модели из импортированного файла.
// Это надежно, быстро и не зависит от сети или заголовков.
export function getModels(): Model[] {
  try {
    const models = defaultModelsConfig.models;

    // Проверяем, что модели в файле соответствуют нужному формату.
    if (Array.isArray(models) && models.every(validateModel)) {
      // console.log('Successfully loaded models directly from import.'); // Можно раскомментировать для отладки
      return models;
    } else {
      console.warn('Default models from models.json are invalid.');
      return []; // Возвращаем пустой массив, если структура неверна.
    }
  } catch (error) {
    console.error('Failed to load or validate default models:', error);
    return []; // Возвращаем пустой массив в случае любой ошибки.
  }
}
