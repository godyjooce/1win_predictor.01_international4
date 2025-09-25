// components/history-container.tsx
import React from 'react'
import { History } from './history'
import { HistoryList } from './history-list'

const HistoryContainer: React.FC = () => {
  // Проверяем оба варианта переменной для надежности.
  const isHistoryEnabled = 
    process.env.NEXT_PUBLIC_ENABLE_SAVE_CHAT_HISTORY === 'true' || 
    process.env.ENABLE_SAVE_CHAT_HISTORY === 'true';

  // Если история отключена, компонент ничего не рендерит.
  if (!isHistoryEnabled) {
    return null
  }

  // Этот код будет выполнен только если история явно включена.
  return (
    <div>
      <History>
        <HistoryList userId="anonymous" />
      </History>
    </div>
  )
}

export default HistoryContainer
