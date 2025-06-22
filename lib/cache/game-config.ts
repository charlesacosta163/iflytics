export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export interface DifficultyConfig {
  pilots: number;
  timeLimit: number;
  maxPoints: number;
  description: string;
}

export const difficultySettings: Record<Difficulty, DifficultyConfig> = {
  easy: {
    pilots: 100,
    timeLimit: 45,
    maxPoints: 15,
    description: "100 pilots, 45 seconds"
  },
  medium: {
    pilots: 250,
    timeLimit: 75,
    maxPoints: 25,
    description: "250 pilots, 75 seconds"
  },
  hard: {
    pilots: 500,
    timeLimit: 90,
    maxPoints: 35,
    description: "500 pilots, 90 seconds"
  },
  extreme: {
    pilots: 1000,
    timeLimit: 90,
    maxPoints: 50,
    description: "1000 pilots, 90 seconds"
  }
};

export function calculatePoints(completionTime: number, difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      if (completionTime == 45) return 0;
      if (completionTime <= 8) return 15;
      if (completionTime <= 15) return 12;
      if (completionTime <= 25) return 9;
      if (completionTime <= 35) return 6;
      if (completionTime <= 45) return 3;

    case 'medium':
      if (completionTime == 75) return 0;
      if (completionTime <= 12) return 25;
      if (completionTime <= 25) return 20;
      if (completionTime <= 40) return 15;
      if (completionTime <= 55) return 10;
      if (completionTime <= 75) return 5;
      return 0;

    case 'hard':
      if (completionTime == 90) return 0;
      if (completionTime <= 18) return 35;
      if (completionTime <= 36) return 28;
      if (completionTime <= 54) return 21;
      if (completionTime <= 72) return 14;
      if (completionTime <= 90) return 8;
      return 0;

    case 'extreme':
      if (completionTime == 90) return 0;
      if (completionTime <= 18) return 50;
      if (completionTime <= 36) return 40;
      if (completionTime <= 54) return 30;
      if (completionTime <= 72) return 20;
      if (completionTime < 91) return 10;
      return 0;

    default:
      return 0;
  }
}

export function getPerformanceLevel(completionTime: number, difficulty: Difficulty): string {
  const points = calculatePoints(completionTime, difficulty);
  const config = difficultySettings[difficulty];
  
  if (points === 0) return "💀 Failed!";
  if (points === config.maxPoints) return "⚡ Lightning Fast!";
  if (points >= config.maxPoints * 0.8) return "🔥 Very Fast!";
  if (points >= config.maxPoints * 0.6) return "⭐ Fast!";
  if (points >= config.maxPoints * 0.4) return "✅ Good!";
  if (points > 0) return "😅 Just Made It!";
  
  return "⏰ Time's Up!";
}