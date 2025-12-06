import React from 'react';
import { CardData, Rarity } from '../types';
import { Sparkles, Activity, Cpu, Zap, Triangle } from 'lucide-react';

interface CardDisplayProps {
  card: CardData;
  isDetailed?: boolean;
}

const rarityColors = {
  [Rarity.COMMON]: 'border-gray-400 bg-gray-50',
  [Rarity.UNCOMMON]: 'border-green-600 bg-green-50',
  [Rarity.RARE]: 'border-blue-600 bg-blue-50',
  [Rarity.ANOMALY]: 'border-purple-600 bg-purple-50',
  [Rarity.LEGENDARY]: 'border-amber-500 bg-amber-50',
};

const rarityTextColors = {
  [Rarity.COMMON]: 'text-gray-600',
  [Rarity.UNCOMMON]: 'text-green-700',
  [Rarity.RARE]: 'text-blue-700',
  [Rarity.ANOMALY]: 'text-purple-700',
  [Rarity.LEGENDARY]: 'text-amber-700',
};

const rarityChinese = {
  [Rarity.COMMON]: '普通',
  [Rarity.UNCOMMON]: '非凡',
  [Rarity.RARE]: '稀有',
  [Rarity.ANOMALY]: '异变',
  [Rarity.LEGENDARY]: '传说',
};

export const CardDisplay: React.FC<CardDisplayProps> = ({ card, isDetailed = false }) => {
  return (
    <div className={`
      relative flex flex-col font-mono select-none
      border-2 border-black bg-white
      ${isDetailed ? 'w-full max-w-sm shadow-retro' : 'w-full aspect-[2/3] shadow-retro-sm hover:shadow-retro hover:-translate-y-1 transition-all duration-200 cursor-pointer'}
      overflow-hidden
    `}>
      {/* Header */}
      <div className="flex justify-between items-center p-2 border-b-2 border-black bg-gray-100">
        <span className="text-xs font-bold uppercase truncate max-w-[70%]">{card.name}</span>
        <div className="flex space-x-1">
             {card.rarity === Rarity.LEGENDARY && <Sparkles className="w-3 h-3 text-amber-600" />}
             <span className="text-[10px] font-bold tracking-tighter">#{card.id.slice(-4).toUpperCase()}</span>
        </div>
      </div>

      {/* Image Area */}
      <div className="relative w-full aspect-square border-b-2 border-black bg-gray-50 flex items-center justify-center overflow-hidden p-4 group">
        {/* Decorative corners */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-black opacity-50"></div>
        <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-black opacity-50"></div>
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-black opacity-50"></div>
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-black opacity-50"></div>

        {card.imageUrl ? (
          <img 
            src={card.imageUrl} 
            alt={card.name} 
            className={`w-full h-full object-contain rendering-pixelated filter contrast-125 grayscale ${card.rarity === Rarity.LEGENDARY ? 'sepia-[.3]' : ''}`}
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="animate-pulse w-12 h-12 bg-gray-200" />
        )}
        
        {/* Rarity Badge Overlay */}
        <div className={`absolute bottom-2 right-2 px-2 py-0.5 border border-black bg-white text-[10px] font-bold uppercase ${rarityTextColors[card.rarity]}`}>
          {rarityChinese[card.rarity]}
        </div>
      </div>

      {/* Stats & Info */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        
        {/* Type & Desc */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Triangle className="w-3 h-3 rotate-90" />
            <span className="text-xs font-bold uppercase text-gray-500">{card.type}</span>
          </div>
          <p className="text-xs leading-tight font-medium text-gray-800 line-clamp-3">
            {card.description}
          </p>
        </div>

        {/* Stat Grid */}
        <div className="grid grid-cols-3 gap-1 mt-4 pt-2 border-t-2 border-dotted border-gray-300">
          <div className="flex flex-col items-center">
            <Activity className="w-3 h-3 mb-1 text-gray-400" />
            <span className="text-[10px] uppercase text-gray-500">完整</span>
            <span className="text-sm font-bold">{card.stats.integrity}</span>
          </div>
          <div className="flex flex-col items-center border-l border-r border-dotted border-gray-300">
             <Cpu className="w-3 h-3 mb-1 text-gray-400" />
            <span className="text-[10px] uppercase text-gray-500">构造</span>
            <span className="text-sm font-bold">{card.stats.complexity}</span>
          </div>
          <div className="flex flex-col items-center">
             <Zap className="w-3 h-3 mb-1 text-gray-400" />
            <span className="text-[10px] uppercase text-gray-500">能量</span>
            <span className="text-sm font-bold">{card.stats.energy}</span>
          </div>
        </div>
      </div>
    </div>
  );
};