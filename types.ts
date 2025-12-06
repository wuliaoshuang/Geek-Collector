export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  ANOMALY = 'ANOMALY',
  LEGENDARY = 'LEGENDARY'
}

export interface CardStats {
  integrity: number;
  complexity: number;
  energy: number;
}

export interface CardData {
  id: string;
  name: string;
  type: string;
  description: string;
  rarity: Rarity;
  stats: CardStats;
  visualPrompt: string; // Used to generate the image
  imageUrl?: string; // The generated image URL
  timestamp: number;
}

export type ActionType = 'PULL' | 'DECOMPOSE' | 'BONUS' | 'DISCARD' | 'EARN';

export interface HistoryRecord {
  id: string;
  timestamp: number;
  action: ActionType;
  cardName?: string;
  rarity?: Rarity;
  amount: number; // BYTES change
}

export type GeneratedCardResponse = Omit<CardData, 'id' | 'imageUrl' | 'timestamp'>;

export type ViewState = 'GENERATOR' | 'COLLECTION' | 'HISTORY' | 'MISSION';

// Mission Types
export type MissionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface MissionSignal {
  id: string;
  difficulty: MissionDifficulty;
  type: 'PYTHON' | 'LOGIC' | 'CRYPTO';
  reward: number;
}

export interface ActiveMissionData {
  description: string; // The problem description
  context: string; // Hidden context/solution for the AI verifier
}

export interface MissionVerificationResult {
  success: boolean;
  message: string;
}