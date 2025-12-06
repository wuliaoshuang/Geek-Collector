import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CardData, Rarity } from './types';

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
  lastDailyLogin: number; // Timestamp
  
  // Actions
  addCard: (card: CardData) => void;
  decomposeCard: (id: string) => number; // Returns value gained
  deductBytes: (amount: number) => boolean;
  claimDailyBonus: () => number; // Returns amount gained (0 if already claimed)
  checkCanClaimDaily: () => boolean;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      bytes: 500, // Initial currency
      collection: [],
      lastDailyLogin: 0,

      addCard: (card) => set((state) => ({ 
        collection: [card, ...state.collection] 
      })),

      decomposeCard: (id) => {
        const state = get();
        const card = state.collection.find((c) => c.id === id);
        if (!card) return 0;

        const value = DECOMPOSE_VALUES[card.rarity];
        
        set((state) => ({
          collection: state.collection.filter((c) => c.id !== id),
          bytes: state.bytes + value
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

      checkCanClaimDaily: () => {
        const last = new Date(get().lastDailyLogin);
        const now = new Date();
        return last.getDate() !== now.getDate() || last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear();
      },

      claimDailyBonus: () => {
        if (get().checkCanClaimDaily()) {
          set((state) => ({
            bytes: state.bytes + DAILY_BONUS,
            lastDailyLogin: Date.now()
          }));
          return DAILY_BONUS;
        }
        return 0;
      }
    }),
    {
      name: 'retro-geek-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
