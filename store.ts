import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CardData, Rarity, HistoryRecord } from './types';
import { v4 as uuidv4 } from 'uuid';

// Economy Config
export const COST_PER_PULL = 100;
export const DAILY_BONUS = 200;

export const DECOMPOSE_VALUES: Record<Rarity, number> = {
  [Rarity.COMMON]: 15,
  [Rarity.UNCOMMON]: 40,
  [Rarity.RARE]: 100,
  [Rarity.ANOMALY]: 300,
  [Rarity.LEGENDARY]: 800,
};

interface AppState {
  bytes: number;
  collection: CardData[];
  history: HistoryRecord[];
  lastDailyLogin: number; // Timestamp
  
  // Actions
  addCard: (card: CardData) => void;
  logDiscard: (card: CardData) => void; // Log a discarded card
  decomposeCard: (id: string) => number; // Returns value gained
  deductBytes: (amount: number) => boolean;
  earnBytes: (amount: number, source: string) => void; // New action for missions
  claimDailyBonus: () => number; // Returns amount gained (0 if already claimed)
  checkCanClaimDaily: () => boolean;
  clearHistory: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      bytes: 500, // Initial currency
      collection: [],
      history: [],
      lastDailyLogin: 0,

      addCard: (card) => set((state) => ({ 
        collection: [card, ...state.collection],
        history: [
          {
            id: uuidv4(),
            timestamp: Date.now(),
            action: 'PULL',
            cardName: card.name,
            rarity: card.rarity,
            amount: -COST_PER_PULL
          },
          ...state.history
        ].slice(0, 100) // Keep last 100 records to prevent bloat
      })),

      logDiscard: (card) => set((state) => ({
        history: [
          {
            id: uuidv4(),
            timestamp: Date.now(),
            action: 'DISCARD',
            cardName: card.name,
            rarity: card.rarity,
            amount: -COST_PER_PULL
          },
          ...state.history
        ].slice(0, 100)
      })),

      decomposeCard: (id) => {
        const state = get();
        const card = state.collection.find((c) => c.id === id);
        if (!card) return 0;

        const value = DECOMPOSE_VALUES[card.rarity];
        
        set((state) => ({
          collection: state.collection.filter((c) => c.id !== id),
          bytes: state.bytes + value,
          history: [
            {
              id: uuidv4(),
              timestamp: Date.now(),
              action: 'DECOMPOSE',
              cardName: card.name,
              rarity: card.rarity,
              amount: value
            },
            ...state.history
          ].slice(0, 100)
        }));

        return value;
      },

      deductBytes: (amount) => {
        const current = get().bytes;
        if (current >= amount) {
          set({ bytes: current - amount });
          return true;
        }
        return false;
      },

      earnBytes: (amount, source) => {
        set((state) => ({
            bytes: state.bytes + amount,
            history: [
                {
                    id: uuidv4(),
                    timestamp: Date.now(),
                    action: 'EARN',
                    cardName: source,
                    amount: amount
                },
                ...state.history
            ].slice(0, 100)
        }));
      },

      checkCanClaimDaily: () => {
        const last = new Date(get().lastDailyLogin);
        const now = new Date();
        return last.getDate() !== now.getDate() || last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear();
      },

      claimDailyBonus: () => {
        if (get().checkCanClaimDaily()) {
          set((state) => ({
            bytes: state.bytes + DAILY_BONUS,
            lastDailyLogin: Date.now(),
            history: [
              {
                id: uuidv4(),
                timestamp: Date.now(),
                action: 'BONUS',
                amount: DAILY_BONUS
              },
              ...state.history
            ].slice(0, 100)
          }));
          return DAILY_BONUS;
        }
        return 0;
      },

      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'retro-geek-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);