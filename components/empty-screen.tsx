// components/empty-screen.tsx (или ваш путь)
'use client'

import { Button } from '@/components/ui/button';
import {
  Flame,
  BarChart3,
  HelpCircle,
  Target,
  Gift,
  // Для примера с картинки (если нужно будет адаптировать под него)
  Globe,       // Для "Why is Nvidia..."
  GitCompare,  // Для "Tesla vs Rivian" (или Repeat, RefreshCcw)
  PlaySquare,  // Для "Tell me about a video..."
  Link         // Для "Summary: https://..."
} from 'lucide-react';

// Ваш массив сообщений (оставляю как есть из вашего примера)
const exampleMessages = [
  {
    icon: Flame, // Используем иконку вместо эмодзи в heading
    heading: "Today's Hot Strategies",
    message: 'What are the most effective betting strategies on 1win today?'
  },
  {
    icon: BarChart3,
    heading: 'Analyze My Last Bet',
    message: 'Analyze my last bet and suggest how to improve the strategy.'
  },
  {
    icon: HelpCircle, // Или Lightbulb
    heading: 'Advice Before Playing Lucky Jet',
    message: 'Should I play Lucky Jet right now? What are the risks and chances?'
  },
];

// Для примера с картинки (если бы мы использовали его)
// const exampleMessagesFromImage = [
//   { icon: Globe, heading: 'Why is Nvidia growing rapidly?', message: 'Why is Nvidia growing rapidly?' },
//   { icon: GitCompare, heading: 'Tesla vs Rivian', message: 'Tesla vs Rivian' },
//   { icon: PlaySquare, heading: 'Tell me about a video that explains Cursor', message: 'Tell me about a video that explains Cursor' },
//   { icon: Link, heading: 'Summary: https://arxiv.org/pdf/2407.16833', message: 'Summarize https://arxiv.org/pdf/2407.16833' },
// ];

export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void;
  className?: string;
}) {
  return (
    // Контейнер для списка предложенных вопросов
    <div className={`mx-auto w-full px-1 sm:px-0 ${className}`}> {/* Небольшие отступы для мобильных */}
      <div className="flex flex-col items-start space-y-1.5"> {/* space-y-1 или space-y-1.5 для плотности */}
        {exampleMessages.map((item, index) => ( // Меняем на exampleMessagesFromImage если нужно
          <Button
            key={index}
            variant="ghost"
            className="group w-full h-auto justify-start text-left text-sm sm:text-base px-2.5 py-2 font-normal text-foreground/75 hover:text-foreground focus-visible:text-foreground rounded-md
                       transition-all duration-200 ease-out
                       hover:bg-muted/40 focus-visible:bg-muted/50"
            onClick={() => {
              submitMessage(item.message);
            }}
          >
            <item.icon // Динамическая иконка
              size={15}
              className="mr-2 text-muted-foreground flex-shrink-0 transition-colors duration-200 group-hover:text-primary group-focus-visible:text-primary"
            />
            <span className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5">
              {item.heading}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
