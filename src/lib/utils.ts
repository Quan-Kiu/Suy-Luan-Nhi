import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function evaluateAnswer(selectedAnswer: string, correctAnswer: string) {
  return selectedAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
}
