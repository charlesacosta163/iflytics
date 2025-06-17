'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { GrAlarm } from "react-icons/gr";
import { FaGlobeAsia, FaHome } from "react-icons/fa";

const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const THROTTLE_DELAY = 1000; // 1 second throttle

// Create context for managing timeout state
interface TimeoutContextType {
  isTimedOut: boolean;
  resetTimeout: () => void;
}

const TimeoutContext = createContext<TimeoutContextType | null>(null);

export const useMapTimeout = () => {
  const context = useContext(TimeoutContext);
  if (!context) {
    throw new Error('useMapTimeout must be used within MapActivityTimeout');
  }
  return context;
};

export default function MapActivityTimeout({ children }: { children: React.ReactNode }) {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isTimedOut, setIsTimedOut] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let lastResetTime = Date.now();

        const resetTimer = () => {
            // Don't reset timer if already timed out - user must explicitly resume
            if (isTimedOut) {
                return;
            }

            const now = Date.now();
            // Only reset if enough time has passed since last reset
            if (now - lastResetTime < THROTTLE_DELAY) {
                return;
            }
            
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            
            lastResetTime = now;
            timeoutId = setTimeout(() => {
                console.log('🕒 Map timeout triggered - stopping flight data fetching');
                setIsTimedOut(true);
                setShowPrompt(true);
            }, TIMEOUT_DURATION);
        };

        // Events to track user activity - but only if not timed out
        const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click', 'mousemove'];
        
        // Add event listeners
        events.forEach(event => {
            document.addEventListener(event, resetTimer);
        });

        // Initial timer only if not timed out
        if (!isTimedOut) {
            resetTimer();
        }

        // Cleanup
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => {
                document.removeEventListener(event, resetTimer);
            });
        };
    }, [isTimedOut]); // Remove showPrompt from dependency to prevent infinite loops

    const handleContinue = () => {
        console.log('🔄 Resuming flight data fetching');
        setShowPrompt(false);
        setIsTimedOut(false);
        // Timer will restart automatically due to useEffect dependency on isTimedOut
    };

    const handleGoHome = () => {
        console.log('🏠 Going back to home page');
        router.push('/');
    };

    const resetTimeout = () => {
        setIsTimedOut(false);
        setShowPrompt(false);
    };

    return (
        <TimeoutContext.Provider value={{ isTimedOut, resetTimeout }}>
            {children}
            
            <Dialog open={showPrompt} onOpenChange={() => {}} modal={true}>
                <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <GrAlarm className="text-orange-500" />
                            Flight Data Paused
                        </DialogTitle>
                        <DialogDescription className="text-left">
                            You've been inactive for 15 minutes. To comply with Infinite Flight API guidelines, 
                            we've stopped fetching live flight data.
                            <br/><br/>
                            Would you like to resume live updates or return to the home page?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={handleGoHome}
                            className="flex items-center gap-2"
                        >
                            <FaHome />
                            Go Home
                        </Button>
                        <Button
                            onClick={handleContinue}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                        >
                            <FaGlobeAsia />
                            Resume Updates
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TimeoutContext.Provider>
    );
}