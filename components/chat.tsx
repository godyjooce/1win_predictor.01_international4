// components/chat.tsx
'use client'

import { CHAT_ID } from '@/lib/constants'
import { useAutoScroll } from '@/lib/hooks/use-auto-scroll'
import { Model } from '@/lib/types/models' 
import { useChat } from '@ai-sdk/react'
import { ChatRequestOptions } from 'ai'
import { Message, CreateMessage } from 'ai/react' 
import { useEffect } from 'react'
import { toast } from 'sonner'
import { ChatMessages } from './chat-messages'
import { ChatPanel } from './chat-panel'
import { cn } from '@/lib/utils'

interface ChatProps {
  id: string;
  savedMessages?: Message[];
  query?: string;
  models?: Model[];
  pendingExternalMessage?: CreateMessage | null;
  onExternalMessageConsumed?: () => void;
  className?: string;
  onMessagesChange?: (messages: Message[]) => void;
  toggleViewMode?: () => void;
  // --- НАЧАЛО ИЗМЕНЕНИЙ ---
  isRegistered: boolean;
  onRegistrationGateTrigger: () => void;
  // --- КОНЕЦ ИЗМЕНЕНИЙ ---
}

export function Chat({
  id,
  savedMessages = [],
  query,
  models,
  pendingExternalMessage,
  onExternalMessageConsumed,
  className,
  onMessagesChange,
  toggleViewMode,
  // --- НАЧАЛО ИЗМЕНЕНИЙ ---
  isRegistered,
  onRegistrationGateTrigger,
  // --- КОНЕЦ ИЗМЕНЕНИЙ ---
}: ChatProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    setMessages,
    stop,
    append,
    data,
    setData,
    addToolResult,
    reload
  } = useChat({
    initialMessages: savedMessages,
    id: CHAT_ID, 
    body: { id },
    onFinish: () => { 
      // window.history.replaceState({}, '', `/search/${id}`) 
    },
    onError: error => { toast.error(`Error in chat: ${error.message}`) },
    sendExtraMessageFields: false,
    experimental_throttle: 100
  })

  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  const isLoading = status === 'submitted' || status === 'streaming'

  const { anchorRef, isAutoScroll } = useAutoScroll({
    isLoading,
    dependency: messages.length,
    isStreaming: () => false
  })

  useEffect(() => {
    if (pendingExternalMessage && onExternalMessageConsumed) {
      append(pendingExternalMessage);
      onExternalMessageConsumed();
    }
  }, [pendingExternalMessage, onExternalMessageConsumed, append]);

  useEffect(() => {
    // setMessages(savedMessages) 
  }, [id, savedMessages, setMessages])

  const onQuerySelect = (queryText: string) => {
    append({ role: 'user', content: queryText })
  }

   // --- НАЧАЛО НОВЫХ ИЗМЕНЕНИЙ ---
  const checkRegistrationGate = () => {
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    if (userMessageCount >= 1 && !isRegistered) {
      onRegistrationGateTrigger();
      return true; // Гейт сработал
    }
    return false; // Гейт не сработал
  };

  const handleInterceptSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (checkRegistrationGate()) return;
    setData(undefined);
    handleSubmit(e);
  }

  const handleUpdateAndReloadMessage = async (messageId: string, newContent: string) => {
    if (checkRegistrationGate()) return;
    const updatedMessages = messages.map(msg => msg.id === messageId ? { ...msg, content: newContent } : msg);
    setMessages(updatedMessages);
    try {
      const messageIndex = updatedMessages.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) return;
      const messagesUpToEdited = updatedMessages.slice(0, messageIndex + 1);
      setMessages(messagesUpToEdited);
      setData(undefined);
      await reload({ body: { chatId: id, regenerate: true } });
    } catch (error) {
      toast.error(`Failed to reload conversation: ${(error as Error).message}`);
    }
  }

  const handleReloadFrom = async (messageId: string, options?: ChatRequestOptions) => {
    if (checkRegistrationGate()) return undefined; // Возвращаем undefined, чтобы соответствовать типу
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      const userMessageIndex = messages.slice(0, messageIndex).findLastIndex(m => m.role === 'user');
      if (userMessageIndex !== -1) {
        setMessages(messages.slice(0, userMessageIndex + 1));
        return await reload(options);
      }
    }
    return await reload(options);
  }
  // --- КОНЕЦ НОВЫХ ИЗМЕНЕНИЙ ---

  const chatPanelEstimatedHeightRem = 0.5;

  return (
    <div className={cn("flex flex-col w-full max-w-3xl mx-auto h-full", className)}>
      <div 
        className="flex-grow overflow-y-auto"
        style={{ paddingBottom: `${chatPanelEstimatedHeightRem}rem` }}
      >
        <ChatMessages
          messages={messages}
          data={data}
          onQuerySelect={onQuerySelect}
          isLoading={isLoading}
          chatId={id}
          addToolResult={addToolResult}
          anchorRef={anchorRef}
          onUpdateMessage={handleUpdateAndReloadMessage}
          reload={handleReloadFrom}
        />
      </div>
      <ChatPanel
        input={input}
        handleInputChange={handleInputChange}
        // --- ИЗМЕНЕНИЕ: Передаем нашу новую функцию вместо стандартной ---
        handleSubmit={handleInterceptSubmit}
        isLoading={isLoading}
        messages={messages}
        setMessages={setMessages}
        stop={stop}
        query={query}
        append={append}
        models={models}
        isAutoScroll={isAutoScroll}
        toggleViewMode={toggleViewMode}
      />
    </div>
  )
}


