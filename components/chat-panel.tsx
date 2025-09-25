// components/chat-panel.tsx
'use client';

import { Model } from '@/lib/types/models'
import { cn } from '@/lib/utils'
import { Message } from 'ai'
import {
  ArrowUp,
  ChevronDown,
  MessageCirclePlus,
  Square,
  Sparkle,
  Gamepad2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Textarea from 'react-textarea-autosize'

import { EmptyScreen } from './empty-screen'
import { Button } from './ui/button'

const IconLogo = ({ className }: { className?: string }) => (
  <Sparkle className={cn('size-10 text-primary', className)} />
)

interface ChatPanelProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  messages: Message[]
  setMessages: (messages: Message[]) => void
  query?: string
  stop: () => void
  append: (message: any) => void
  models?: Model[]
  isAutoScroll: boolean
  toggleViewMode?: () => void;
}

export function ChatPanel({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  messages,
  setMessages,
  query,
  stop,
  append,
  isAutoScroll,
  toggleViewMode
}: ChatPanelProps) {
  const [showEmptyScreenSuggestions, setShowEmptyScreenSuggestions] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const isFirstRender = useRef(true)
  const [isComposing, setIsComposing] = useState(false)
  const [enterDisabled, setEnterDisabled] = useState(false)

  const [atBottom, setAtBottom] = useState(true)
  useEffect(() => {
    const handleScroll = () => {
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 30
      setAtBottom(isBottom)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCompositionStart = () => setIsComposing(true)
  const handleCompositionEnd = () => {
    setIsComposing(false)
    setEnterDisabled(true)
    setTimeout(() => setEnterDisabled(false), 100)
  }

  const handleNewChat = () => {
    setMessages([])
    router.push('/')
  }

  const isToolInvocationInProgress = () => {
    if (!messages.length) return false
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== 'assistant' || !lastMessage.parts) return false
    const parts = lastMessage.parts
    const lastPart = parts[parts.length - 1]
    return (
      lastPart?.type === 'tool-invocation' &&
      lastPart?.toolInvocation?.state === 'call'
    )
  }

  useEffect(() => {
    if (isFirstRender.current && query && query.trim().length > 0) {
      append({ role: 'user', content: query })
      isFirstRender.current = false
    }
  }, [query, append])

  useEffect(() => {
    if (isInputFocused && input.length === 0 && messages.length === 0) {
      setShowEmptyScreenSuggestions(true)
    } else {
      setShowEmptyScreenSuggestions(false)
    }
  }, [isInputFocused, input, messages])

  const animationStyles = `
    @keyframes fadeIn { from { opacity: 0; } to: { opacity: 1; } }
    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to: { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to: { opacity: 1; transform: translateY(0); } }
    @keyframes pulseSparkle {
      0%, 100% { opacity: 0.7; transform: scale(0.95) rotate(-8deg); }
      50% { opacity: 1; transform: scale(1.05) rotate(6deg); }
    }
    .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }
    .animate-fadeInDown { animation: fadeInDown 0.3s ease-in-out forwards; }
    .animate-fadeInUp { animation: fadeInUp 0.3s ease-in-out forwards; }
    .animate-pulseSparkle { animation: pulseSparkle 4.0s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  `
  // --- ИЗМЕНЕНИЕ: Уменьшаем высоту панели ---
  const footerHeight = 'bottom-[1.50rem]'; // Было 4.25rem

  return (
    <>
      <style jsx global>{animationStyles}</style>
      <div
        className={cn(
          'mx-auto w-full',
          messages.length > 0
            ? `fixed ${footerHeight} left-0 right-0 border-t border-border/10 bg-background/70 backdrop-blur-lg z-40`
            : `fixed ${footerHeight} left-0 right-0 top-16 flex flex-col items-center justify-center px-4`
        )}
      >
        {messages.length === 0 && (
          <div className="mb-10 flex flex-col items-center gap-4 text-center animate-fadeIn">
            <IconLogo className="size-12 animate-pulseSparkle" />
            <h1 className="text-3xl sm:text-4xl font-light text-foreground/90 tracking-tight">
              1win Games Predictor
            </h1>
            <p className="max-w-md text-sm text-foreground/60">
              AI-powered predictions for games on the 1win casino.
            </p>
          </div>
        )}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={cn(
            'max-w-xl lg:max-w-2xl w-full mx-auto relative',
            messages.length > 0 ? 'p-2 sm:p-3' : 'px-4'
          )}
        >
          {messages.length > 0 && !isAutoScroll && !atBottom && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute -top-12 right-4 z-30 size-9 bg-card/80 hover:bg-card text-muted-foreground hover:text-primary rounded-full shadow-lg backdrop-blur-md animate-fadeInDown transition-all hover:shadow-xl hover:scale-105"
              onClick={() =>
                window.scrollTo({
                  top: document.documentElement.scrollHeight,
                  behavior: 'smooth'
                })
              }
            >
              <ChevronDown size={18} />
            </Button>
          )}

          <div
            className={cn(
              'relative flex flex-col w-full bg-card shadow-xl hover:shadow-2xl focus-within:shadow-2xl rounded-xl border border-border/20 transition-shadow duration-300 ease-in-out',
              isInputFocused && 'border-primary/50 ring-2 ring-primary/50',
              (isLoading || isToolInvocationInProgress()) &&
                'opacity-60 cursor-not-allowed pointer-events-none'
            )}
          >
            <Textarea
              ref={inputRef}
              name="input"
              rows={1}
              maxRows={7}
              tabIndex={0}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder="Ask me anything..."
              spellCheck={false}
              value={input}
              disabled={isLoading || isToolInvocationInProgress()}
              className="resize-none w-full min-h-[50px] md:min-h-[54px] bg-transparent border-0 py-3.5 pl-4 pr-14 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-0 disabled:bg-transparent"
              onChange={(e) => handleInputChange(e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isComposing && !enterDisabled) {
                  if (input.trim().length === 0) { e.preventDefault(); return }
                  e.preventDefault();
                  (e.target as HTMLTextAreaElement).form?.requestSubmit()
                }
              }}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => {
                setTimeout(() => {
                  if (!document.activeElement?.closest('.empty-screen-suggestions')) {
                    setIsInputFocused(false)
                  }
                }, 150)
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              <Button
                type={isLoading ? 'button' : 'submit'}
                size={'icon'}
                variant={'ghost'}
                className={cn(
                  'rounded-full size-9 text-muted-foreground hover:text-primary hover:bg-primary/10 active:scale-95 transition-all duration-200 ease-in-out transform',
                  isLoading && 'animate-spin',
                  input.trim().length > 0 && !isLoading && 'text-primary scale-105',
                  (input.trim().length === 0 && !isLoading) && "opacity-50"
                )}
                disabled={ (input.trim().length === 0 && !isLoading) || isToolInvocationInProgress() }
                onClick={isLoading ? stop : undefined}
                aria-label={isLoading ? "Stop generation" : "Send message"}
              >
                {isLoading ? <Square size={18} /> : <ArrowUp size={18} />}
              </Button>
            </div>
          </div>

          {messages.length === 0 && (
            <EmptyScreen
              submitMessage={(message) => {
                handleInputChange({ target: { value: message } } as React.ChangeEvent<HTMLTextAreaElement>)
                setIsInputFocused(false)
                setTimeout(() => inputRef.current?.focus(), 0)
              }}
              className={cn(
                'empty-screen-suggestions transition-opacity duration-300 ease-in-out absolute top-full left-0 right-0 mt-2.5 w-full z-20',
                'max-h-[40vh] sm:max-h-[280px] md:max-h-[320px] lg:max-h-[360px]',
                'overflow-y-auto rounded-lg bg-card/90 shadow-lg p-1.5 scrollbar-thin scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent',
                showEmptyScreenSuggestions
                  ? 'opacity-100 pointer-events-auto translate-y-0 visible'
                  : 'opacity-0 pointer-events-none -translate-y-1 invisible'
              )}
            />
          )}

          {messages.length > 0 && (
            // --- ИЗМЕНЕНИЕ: Уменьшаем верхний отступ pt-2.5 до pt-1.5 ---
            <div
              className="flex items-center justify-between pt-1.5 pb-0.5 px-1 opacity-0 animate-fadeInUp"
              style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}
            >
              <Button
                onClick={toggleViewMode}
                variant="outline"
                size="sm"
                className="shrink-0 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 group transition-colors duration-200"
              >
                <Gamepad2 className="size-3.5 mr-1.5" />
                Switch to Games
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="shrink-0 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 group transition-colors duration-200"
                type="button"
                disabled={isLoading || isToolInvocationInProgress()}
              >
                <MessageCirclePlus className="size-3.5 mr-1.5 group-hover:rotate-12 transition-transform duration-300 ease-out" />
                New Chat
              </Button>
            </div>
          )}
        </form>
      </div>
    </>
  )
}

