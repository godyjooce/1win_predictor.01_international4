// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Chat } from '@/components/chat';
import { GamePredictionSection } from '@/components/games/game-prediction';
import { Button } from '@/components/ui/button';
import { generateId } from 'ai';
import { type CreateMessage, type Message } from 'ai/react';
import { MessagesSquare, Gamepad2, ArrowRightLeft, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RegistrationModal } from '@/components/registration-modal';
import { FaqModal } from '@/components/faq-modal';
import { toast } from 'sonner';

const AFFILIATE_LINK = 'https://lkxe.pro/ded1';
const CHECK_STATUS_URL = 'https://dombyta-shoes.ru/api/check-registration.php';

export default function Page() {
  const [viewMode, setViewMode] = useState<'chat' | 'games'>('chat');
  const [chatComponentId, setChatComponentId] = useState(generateId());
  const [pendingGameMessage, setPendingGameMessage] = useState<CreateMessage | null>(null);
  const [hasMessages, setHasMessages] = useState(false);
  
  const [userId, setUserId] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);

  useEffect(() => {
    let currentUserId = localStorage.getItem('oracleUserId');
    if (!currentUserId) {
      currentUserId = generateId(16);
      localStorage.setItem('oracleUserId', currentUserId);
    }
    setUserId(currentUserId);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const localStatus = localStorage.getItem('oracleUserStatus');
    if (localStatus === 'registered') {
      setIsRegistered(true);
      return;
    }

    const checkInitialStatus = async () => {
      try {
        const response = await fetch(`${CHECK_STATUS_URL}?userId=${userId}`);
        const data = await response.json();
        if (data.status === 'registered') {
          setIsRegistered(true);
          localStorage.setItem('oracleUserStatus', 'registered');
        }
      } catch (error) {
        console.error('Initial registration check failed:', error);
      }
    };
    checkInitialStatus();
  }, [userId]);

  const handleGamePrediction = (gameName: string, predictionValue: string) => {
    const gameMessage: CreateMessage = {
      role: 'assistant',
      content: `🎲 Prediction for "${gameName}": ${predictionValue}`,
      createdAt: new Date(),
    };
    setPendingGameMessage(gameMessage);
  };

  const clearPendingGameMessage = () => {
    setPendingGameMessage(null);
  };

  const toggleViewMode = () => {
    if (hasMessages && !isRegistered) {
      setShowRegModal(true);
      return;
    }
    setViewMode(prevMode => (prevMode === 'chat' ? 'games' : 'chat'));
  };

  const SwitchButtonIcon = viewMode === 'chat' ? Gamepad2 : MessagesSquare;
  const switchButtonText = viewMode === 'chat' ? "Switch to Games" : "Switch to AI Chat";

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <main 
          className={cn(
            "flex-grow flex flex-col items-center w-full",
            "pt-12 md:pt-14",
            "pb-[82px]" // Оставляем постоянный отступ снизу
          )}
        >
          {viewMode === 'chat' ? (
            <Chat
              id={chatComponentId}
              pendingExternalMessage={pendingGameMessage}
              onExternalMessageConsumed={clearPendingGameMessage}
              className="flex-grow w-full"
              onMessagesChange={(messages: Message[]) => {
                // --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
                // Проверяем, что есть хотя бы одно сообщение с непустым текстом
                setHasMessages(messages.length > 0 && messages.some(m => m.content.trim() !== ''));
              }}
              isRegistered={isRegistered}
              onRegistrationGateTrigger={() => setShowRegModal(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col p-4 md:p-6">
              <GamePredictionSection onGeneratePrediction={handleGamePrediction} />
            </div>
          )}
        </main>
        
        {/* Условное отображение футера */}
        <footer className="sticky bottom-0 w-full bg-background/80 backdrop-blur-sm p-2 border-t z-50 animate-fadeInUp">
          <div className="max-w-md mx-auto flex justify-center">
            {!hasMessages ? (
              // Кнопка FAQ, если сообщений нет
              <Button
                onClick={() => setShowFaqModal(true)}
                variant="outline"
                size="lg"
                className="w-full md:w-auto min-w-[200px] shadow-lg hover:shadow-xl transition-all duration-300
                           bg-transparent text-foreground/80 hover:bg-accent/80
                           border border-border/50
                           active:scale-95 transform"
              >
                <HelpCircle className="h-5 w-5 mr-2" />
                FAQ
              </Button>
            ) : (
              // Кнопка переключения, если сообщения есть
              <Button
                onClick={toggleViewMode}
                variant="default"
                size="lg"
                className="w-full md:w-auto min-w-[200px] shadow-lg hover:shadow-xl transition-all duration-300
                           bg-transparent text-foreground/80 hover:bg-accent/80
                           border border-border/50
                           active:scale-95 transform"
              >
                <SwitchButtonIcon className="h-5 w-5 mr-2" />
                {switchButtonText}
                <ArrowRightLeft className="h-5 w-5 ml-2 opacity-70" />
              </Button>
            )}
          </div>
        </footer>
      </div>
      
      <RegistrationModal
        isOpen={showRegModal}
        userId={userId}
        affiliateLink={AFFILIATE_LINK}
        onRegistrationSuccess={() => {
          setIsRegistered(true);
          setShowRegModal(false);
          localStorage.setItem('oracleUserStatus', 'registered');
          toast.success('Registration confirmed! Full functionality is now available.');
        }}
      />
      
      <FaqModal isOpen={showFaqModal} onClose={() => setShowFaqModal(false)} />
    </>
  );
}





