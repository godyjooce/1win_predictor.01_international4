// components/faq-modal.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface FaqModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FaqModal({ isOpen, onClose }: FaqModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Frequently Asked Questions</DialogTitle>
          <DialogDescription>
            How the earning model works and what's in it for everyone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm text-foreground/80">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">How is the income generated?</h3>
            <p>
              There is a site called 1win where you can play gambling games like RocketQueen and Mines. It is on these games that we will be making money.
            </p>
            <p>
              If you play randomly, the chance of losing is 90%.
            </p>
            <p>
             I offer you to use the signals from my <strong>REAL AI</strong>, which I have developed. It predicts the outcome of the game with 99.9% accuracy. You will know the result in advance, so there will be no need to risk.
            </p>
            <p className="font-medium">⚠️ Signal accuracy is 99%, there are no risks.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">What's in it for me?</h3>
            <p>
              Due to my accounts being blocked (my IP is blacklisted by 1win), I cannot earn large sums directly through the game. Your IP is clean, so you are not at risk of being blocked.
            </p>
            <p>
              To compensate for these limitations, I share the signals by selling subscriptions. You get free access for 7 days, earn your first money, and then you can purchase a subscription for a month or for a lifetime.
            </p>
            <p>
              As a result, you earn money using my signals, and I receive income from subscriptions. It's mutually beneficial for both of us.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
