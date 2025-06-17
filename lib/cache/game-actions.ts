export type Difficulty = 'easy' | 'medium' | 'hard';

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
    maxPoints: 40,
    description: "500 pilots, 90 seconds"
  }
};

export function calculatePoints(completionTime: number, difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      // 🟢 EASY MODE (100 pilots, 45 seconds) - Max: 15 points
      if (completionTime <= 8) return 15;   // ⚡ Lightning Fast!
      if (completionTime <= 15) return 12;  // 🔥 Very Fast!
      if (completionTime <= 25) return 9;   // ⭐ Fast!
      if (completionTime <= 35) return 6;   // ✅ Good!
      if (completionTime <= 45) return 3;   // 😅 Just Made It!
      return 0; // Time's up

    case 'medium':
      // 🟡 MEDIUM MODE (250 pilots, 75 seconds) - Max: 25 points
      if (completionTime <= 12) return 25;  // ⚡ Lightning Fast!
      if (completionTime <= 25) return 20;  // 🔥 Very Fast!
      if (completionTime <= 40) return 15;  // ⭐ Fast!
      if (completionTime <= 55) return 10;  // ✅ Good!
      if (completionTime <= 75) return 5;   // 😅 Just Made It!
      return 0; // Time's up

    case 'hard':
      // 🔴 HARD MODE (500 pilots, 90 seconds) - Max: 35 points
      if (completionTime <= 15) return 40;  // ⚡ Lightning Fast!
      if (completionTime <= 30) return 32;  // 🔥 Very Fast!
      if (completionTime <= 50) return 24;  // ⭐ Fast!
      if (completionTime <= 70) return 16;  // ✅ Good!
      if (completionTime <= 90) return 8;   // 😅 Just Made It!
      return 0; // Time's up

    default:
      return 0;
  }
}

export function getPerformanceLevel(completionTime: number, difficulty: Difficulty): string {
  const points = calculatePoints(completionTime, difficulty);
  const config = difficultySettings[difficulty];
  
  if (points === config.maxPoints) return "⚡ Lightning Fast!";
  if (points >= config.maxPoints * 0.8) return "🔥 Very Fast!";
  if (points >= config.maxPoints * 0.6) return "⭐ Fast!";
  if (points >= config.maxPoints * 0.4) return "✅ Good!";
  if (points > 0) return "😅 Just Made It!";
  return "⏰ Time's Up!";
}