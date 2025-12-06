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

export type GeneratedCardResponse = Omit<CardData, 'id' | 'imageUrl' | 'timestamp'>;

export type ViewState = 'GENERATOR' | 'COLLECTION' | 'DETAIL';
