// components/header.tsx

import React from 'react'

export const Header: React.FC = () => {
  return (
    // --- НАЧАЛО ИЗМЕНЕНИЯ ---
    // Удаляем все содержимое хедера, чтобы он был пустым,
    // но оставляем сам тег, чтобы сохранить структуру отступов.
    <header className="fixed w-full p-2 flex justify-between items-center z-10">
      {/* Логотип слева и контейнер истории справа полностью удалены */}
    </header>
    // --- КОНЕЦ ИЗМЕНЕНИЯ ---
  )
}

export default Header
