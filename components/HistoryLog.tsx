import React from 'react';
import { useStore } from '../store';
import { ActionType, Rarity } from '../types';
import { Clock, ArrowRight, Trash2 } from 'lucide-react';

const rarityColors = {
  [Rarity.COMMON]: 'text-gray-500',
  [Rarity.UNCOMMON]: 'text-green-600',
  [Rarity.RARE]: 'text-blue-600',
  [Rarity.ANOMALY]: 'text-purple-600',
  [Rarity.LEGENDARY]: 'text-amber-600',
};

const rarityChinese = {
  [Rarity.COMMON]: '普通',
  [Rarity.UNCOMMON]: '非凡',
  [Rarity.RARE]: '稀有',
  [Rarity.ANOMALY]: '异变',
  [Rarity.LEGENDARY]: '传说',
};

const actionLabels: Record<ActionType, string> = {
  'PULL': '执行协议',
  'DECOMPOSE': '分解回收',
  'BONUS': '每日补给',
  'DISCARD': '丢弃销毁',
  'EARN': '赏金任务'
};

export const HistoryLog: React.FC = () => {
  const history = useStore(state => state.history);
  const clearHistory = useStore(state => state.clearHistory);

  return (
    <div className="w-full pb-20 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
        <div>
           <h2 className="font-mono text-2xl font-bold uppercase tracking-tighter">操作日志</h2>
           <p className="font-mono text-xs text-gray-500">最近 100 条记录</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> 清空
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50 border-2 border-dashed border-gray-300">
          <Clock className="w-8 h-8 mb-2" />
          <p className="font-mono text-sm">无记录</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((record) => (
            <div 
              key={record.id} 
              className="bg-white border-b border-gray-200 py-3 px-2 flex items-center justify-between font-mono hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 border ${
                        record.action === 'PULL' ? 'border-black bg-black text-white' : 
                        record.action === 'DECOMPOSE' ? 'border-red-500 text-red-600' :
                        record.action === 'BONUS' || record.action === 'EARN' ? 'border-green-600 text-green-700' :
                        'border-gray-400 text-gray-500 line-through decoration-1'
                    }`}>
                        {actionLabels[record.action]}
                    </span>
                    <span className="text-[10px] text-gray-400">
                        {new Date(record.timestamp).toLocaleString()}
                    </span>
                </div>
                
                {record.cardName ? (
                    <div className="text-sm font-bold flex items-center gap-2">
                        <span className={record.action === 'DISCARD' ? 'text-gray-400 line-through' : ''}>
                          {record.cardName}
                        </span>
                        {record.rarity && (
                            <span className={`text-[10px] uppercase ${rarityColors[record.rarity]}`}>
                                [{rarityChinese[record.rarity]}]
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="text-sm font-bold text-gray-500">系统配额发放</div>
                )}
              </div>

              <div className={`font-bold text-sm ${record.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {record.amount > 0 ? '+' : ''}{record.amount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};