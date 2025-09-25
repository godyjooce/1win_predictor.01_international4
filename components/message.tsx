// components/message.tsx
'use client'

import { cn } from '@/lib/utils'
import 'katex/dist/katex.min.css'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { Citing } from './custom-link'
import { CodeBlock } from './ui/codeblock'
import { MemoizedReactMarkdown } from './ui/markdown'

// --- НАЧАЛО ИЗМЕНЕНИЙ ---
// Новый компонент-обертка для текста, который будет анимирован
const AnimatedText = ({ children }: { children: React.ReactNode }) => {
  if (typeof children !== 'string') {
    return <>{children}</>;
  }

  // Разбиваем текст на слова и пробелы
  const words = children.split(/(\s+)/);

  return (
    <span className="word-animation">
      {words.map((word, index) => (
        <span
          key={index}
          style={{ animationDelay: `${index * 0.02}s` }}
        >
          {word}
        </span>
      ))}
    </span>
  );
};
// --- КОНЕЦ ИЗМЕНЕНИЙ ---

export function BotMessage({
  message,
  className
}: {
  message: string
  className?: string
}) {
  const containsLaTeX = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/.test(
    message || ''
  )

  const processedData = preprocessLaTeX(message || '')

  if (containsLaTeX) {
    // Для LaTeX оставляем старую логику, чтобы не сломать формулы
    return (
      <MemoizedReactMarkdown
        rehypePlugins={[
          [rehypeExternalLinks, { target: '_blank' }],
          [rehypeKatex]
        ]}
        remarkPlugins={[remarkGfm, remarkMath]}
        className={cn(
          'prose-sm prose-neutral prose-a:text-accent-foreground/50',
          className
        )}
      >
        {processedData}
      </MemoizedReactMarkdown>
    )
  }

  // --- НАЧАЛО ИЗМЕНЕНИЙ ---
  // Возвращаем MemoizedReactMarkdown, но переопределяем, как он рендерит параграфы <p>
  return (
    <MemoizedReactMarkdown
      rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }]]}
      remarkPlugins={[remarkGfm]}
      className={cn(
        'prose-sm prose-neutral prose-a:text-accent-foreground/50',
        className
      )}
      components={{
        // Переопределяем рендеринг параграфа
        p: ({ node, ...props }) => {
          // Внутри каждого параграфа используем наш анимированный компонент
          return <p {...props}><AnimatedText>{props.children}</AnimatedText></p>;
        },
        // Оставляем вашу логику для блоков кода и ссылок
        code({ node, inline, className, children, ...props }) {
          if (children.length) {
            if (children[0] == '▍') {
              return (
                <span className="mt-1 cursor-default animate-pulse">▍</span>
              )
            }
            children[0] = (children[0] as string).replace('`▍`', '▍')
          }
          const match = /language-(\w+)/.exec(className || '')
          if (inline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
          return (
            <CodeBlock
              key={Math.random()}
              language={(match && match[1]) || ''}
              value={String(children).replace(/\n$/, '')}
              {...props}
            />
          )
        },
        a: Citing
      }}
    >
      {message}
    </MemoizedReactMarkdown>
  )
  // --- КОНЕЦ ИЗМЕНЕНИЙ ---
}

const preprocessLaTeX = (content: string) => {
  const blockProcessedContent = content.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, equation) => `$$${equation}$$`
  )
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_, equation) => `$${equation}$`
  )
  return inlineProcessedContent
}

