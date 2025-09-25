// components/registration-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input'; // Импортируем компонент Input
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RegistrationModalProps {
  isOpen: boolean;
  userId: string;
  onRegistrationSuccess: () => void;
  affiliateLink: string;
}

const CHECK_STATUS_URL = 'https://dombyta-shoes.ru/api/check-registration.php';

export function RegistrationModal({
  isOpen,
  userId,
  onRegistrationSuccess,
  affiliateLink,
}: RegistrationModalProps) {
  const [oneWinId, setOneWinId] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!oneWinId || !/^\d+$/.test(oneWinId)) {
      setError('Please enter a valid numeric User ID.');
      return;
    }

    setIsChecking(true);
    setError('');

    try {
      const response = await fetch(`${CHECK_STATUS_URL}?oneWinId=${oneWinId}`);
      const data = await response.json();

      if (data.status === 'registered') {
        toast.success('Verification successful!');
        onRegistrationSuccess();
      } else {
        setError('Registration not found. Please check the ID or complete the registration.');
      }
    } catch (err) {
      setError('Verification failed. Please try again later.');
      console.error('Error verifying registration:', err);
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const fullAffiliateLink = `${affiliateLink}?sub1=${userId}`; // Используем sub1 для нашей внутренней связки

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md mx-4 p-6 bg-card border rounded-lg shadow-xl text-center">
        <h2 className="text-2xl font-semibold text-primary mb-3">Confirm Your Registration</h2>
        <p className="text-muted-foreground mb-4">
          After registering on 1win, find your User ID in your profile and enter it below to unlock full access.
        </p>
        
        <Button asChild size="lg" className="w-full mb-4">
          <a href={fullAffiliateLink} target="_blank" rel="noopener noreferrer">
            Step 1: Register on 1win
          </a>
        </Button>
        
        <div className="space-y-2 text-left">
          <label htmlFor="1winId" className="text-sm font-medium text-muted-foreground">
            Step 2: Enter your 1win User ID
          </label>
          <Input
            id="1winId"
            type="text"
            placeholder="e.g., 332214990"
            value={oneWinId}
            onChange={(e) => setOneWinId(e.target.value)}
            disabled={isChecking}
          />
        </div>

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        
        <Button
          size="lg"
          className="w-full mt-4"
          onClick={handleVerify}
          disabled={isChecking}
        >
          {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify and Continue
        </Button>
      </div>
    </div>
  );
}
