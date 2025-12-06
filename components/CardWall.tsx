import React, { useState } from 'react';
import { CardData, Rarity } from '../types';
import { CardDisplay } from './CardDisplay';
import { X, Filter, Trash, Info, Recycle } from 'lucide-react';
import { useStore, DECOMPOSE_VALUES } from '../store';

interface CardWallProps {
  // No props needed now, data comes from store
}

// Helper for filter display names
const rarityChinese: Record<string, string> = {
  'ALL': '全部',
  [Rarity.COMMON]: '普通',
  [Rarity.UNCOMMON]: '非凡',
  [Rarity.RARE]: '稀有',
  [Rarity.ANOMALY]: '异变',
  [Rarity.LEGENDARY]: '传说',
};

export const CardWall: React.FC<CardWallProps> = () => {
  const cards = useStore(state => state.collection);
  const decomposeCard = useStore(state => state.decomposeCard);
  
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [filterRarity, setFilterRarity] = useState<Rarity | 'ALL'>('ALL');

  const filteredCards = filterRarity === 'ALL' 
    ? cards 
    : cards.filter(c => c.rarity === filterRarity);

  // Reverse to show newest first
  const displayCards = [...filteredCards].reverse();

  const handleDecompose = (id: string) => {
    decomposeCard(id);
    setSelectedCard(null);
  };

  return (
    <div className="w-full pb-20 p-4">
      {/* Header / Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b-2 border-black pb-4">
        <div>
           <h2 className="font-mono text-2xl font-bold uppercase tracking-tighter">档案库</h2>
           <p className="font-mono text-xs text-gray-500">已收录 {cards.length} 件造物</p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
           <Filter className="w-4 h-4 text-gray-400 mr-1 shrink-0" />
           {['ALL', ...Object.values(Rarity)].map((r) => (
             <button
               key={r}
               onClick={() => setFilterRarity(r as Rarity | 'ALL')}
               className={`
                 px-3 py-1 text-[10px] font-mono font-bold uppercase border border-black shrink-0 transition-all
                 ${filterRarity === r ? 'bg-black text-white shadow-retro-sm' : 'bg-white text-black hover:bg-gray-100'}
               `}
             >
               {rarityChinese[r]}
             </button>
           ))}
        </div>
      </div>

      {/* Grid */}
      {displayCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Info className="w-8 h-8 mb-2" />
          <p className="font-mono text-sm">暂无数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayCards.map((card) => (
            <div key={card.id} onClick={() => setSelectedCard(card)}>
              <CardDisplay card={card} />
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail View */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="relative bg-white border-2 border-black shadow-retro p-1 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedCard(null)}
              className="absolute -top-4 -right-4 bg-white border-2 border-black p-2 hover:bg-red-500 hover:text-white transition-colors z-10 shadow-retro-sm"
            >
              <X className="w-5 h-5" />
            </button>
            
            <CardDisplay card={selectedCard} isDetailed={true} />

            <div className="mt-4 p-2 border-t-2 border-black flex flex-col gap-2 bg-gray-50">
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                    <span>ID: {selectedCard.id.slice(0, 8)}</span>
                    <span>{new Date(selectedCard.timestamp).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-dotted border-gray-400">
                    <div className="text-xs font-bold text-gray-600">
                        回收价值: <span className="text-black">{DECOMPOSE_VALUES[selectedCard.rarity]} BYTES</span>
                    </div>
                    <button 
                      onClick={() => handleDecompose(selectedCard.id)}
                      className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-3 py-1 font-mono text-xs font-bold hover:bg-red-600 hover:text-white transition-all"
                    >
                        <Recycle className="w-3 h-3" /> 分解
                    </button>
                </div>
            </div>
          </div>
          {/* Click outside to close */}
          <div className="absolute inset-0 -z-10" onClick={() => setSelectedCard(null)} />
        </div>
      )}
    </div>
  );
};
