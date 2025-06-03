'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogoutButton } from './logout-button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const THROTTLE_DELAY = 1000; // 1 second throttle

export default function ActivityTimeout() {
    const [showPrompt, setShowPrompt] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // console.log('ActivityTimeout component mounted');
        let timeoutId: NodeJS.Timeout;
        let lastResetTime = Date.now();

        const resetTimer = () => {
            const now = Date.now();
            // Only reset if enough time has passed since last reset
            if (now - lastResetTime < THROTTLE_DELAY) {
                return;
            }
            
           // console.log('Timer reset');
            if (timeoutId) {
                // console.log('Clearing existing timeout');
                clearTimeout(timeoutId);
            }
            if (showPrompt) setShowPrompt(false);
            
            lastResetTime = now;
            // console.log('Setting new timeout');
            timeoutId = setTimeout(() => {
                // console.log('Timeout triggered - showing prompt');
                setShowPrompt(true);
            }, TIMEOUT_DURATION);
        };

        // Events to track user activity
        const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
        
        // Add event listeners
        events.forEach(event => {
            document.addEventListener(event, resetTimer);
            // console.log(`Added listener for ${event}`);
        });

        // Initial timer
        resetTimer();

        // Cleanup
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => {
                document.removeEventListener(event, resetTimer);
            });
            // console.log('Cleanup performed');
        };
    }, [showPrompt]);

    const handleContinue = () => {
        // console.log('Continue clicked');
        setShowPrompt(false);
        router.refresh();
    };

    const handleCancel = () => {
        setShowPrompt(false);
    };

    return (
        <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Session Timeout</DialogTitle>
                    <DialogDescription>
                        You've been inactive for 15 minutes due to Infinite Flight API guidelines. 
                        Would you like to continue browsing or sign out?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <LogoutButton />
                    <Button
                        onClick={handleContinue}
                    >
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}