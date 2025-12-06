import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import { GachaMachine } from './components/GachaMachine';
import { CardWall } from './components/CardWall';
import { HistoryLog } from './components/HistoryLog';
import { MissionTerminal } from './components/MissionTerminal';
import { Package, Grid, Coins, X, ClipboardList, TerminalSquare } from 'lucide-react';
import { useStore, DAILY_BONUS } from './store';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('GENERATOR');
  const [dailyBonusModal, setDailyBonusModal] = useState(false);
  
  // Zustand State
  const bytes = useStore(state => state.bytes);
  const collectionCount = useStore(state => state.collection.length);
  const claimDailyBonus = useStore(state => state.claimDailyBonus);
  const checkCanClaimDaily = useStore(state => state.checkCanClaimDaily);

  // Check daily bonus on mount
  useEffect(() => {
    if (checkCanClaimDaily()) {
        const amount = claimDailyBonus();
        if (amount > 0) {
            setDailyBonusModal(true);
        }
    }
  }, []);

  return (
    <div className="min-h-screen bg-geek-white text-geek-black font-mono flex flex-col">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b-2 border-black z-40 px-4 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-bold text-xs">
                RG
            </div>
            <h1 className="text-lg font-bold tracking-tighter uppercase hidden sm:block">极客收藏家</h1>
            <h1 className="text-lg font-bold tracking-tighter uppercase sm:hidden">RGC</h1>
         </div>
         
         <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1 px-2 py-1 bg-black text-white border border-black shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]">
               <Coins className="w-3 h-3 text-yellow-400" />
               <span>{bytes}</span>
               <span className="text-[10px] opacity-70">BYTES</span>
            </div>
            <div className="px-2 py-1 bg-gray-100 border border-black hidden sm:block">
               DB: {collectionCount}
            </div>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20 pb-24 max-w-5xl mx-auto w-full px-4 sm:px-6">
        <div className={view === 'GENERATOR' ? 'block' : 'hidden'}>
           <div className="animate-[fade-in_0.3s_ease-out]">
             <GachaMachine onSwitchToCollection={() => setView('COLLECTION')} />
           </div>
        </div>
        
        <div className={view === 'COLLECTION' ? 'block' : 'hidden'}>
           <div className="animate-[fade-in_0.3s_ease-out]">
             <CardWall />
           </div>
        </div>

        <div className={view === 'MISSION' ? 'block' : 'hidden'}>
           <div className="animate-[fade-in_0.3s_ease-out]">
             <MissionTerminal />
           </div>
        </div>

        <div className={view === 'HISTORY' ? 'block' : 'hidden'}>
           <div className="animate-[fade-in_0.3s_ease-out]">
             <HistoryLog />
           </div>
        </div>
      </main>

      {/* Daily Bonus Modal */}
      {dailyBonusModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fade-in_0.3s_ease-out]">
            <div className="bg-white border-2 border-black shadow-retro p-6 max-w-xs w-full text-center relative">
                <button 
                    onClick={() => setDailyBonusModal(false)}
                    className="absolute top-2 right-2 p-1 hover:bg-gray-100"
                >
                    <X className="w-4 h-4" />
                </button>
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center border-2 border-black">
                        <Coins className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>
                <h3 className="text-xl font-bold uppercase mb-2">每日补给</h3>
                <p className="text-sm text-gray-600 mb-6">系统为您发放了今日的资源配额。</p>
                <div className="text-2xl font-bold mb-6">+{DAILY_BONUS} BYTES</div>
                <button 
                    onClick={() => setDailyBonusModal(false)}
                    className="w-full bg-black text-white py-3 font-bold uppercase hover:bg-gray-800 transition-all shadow-retro-sm active:translate-y-1 active:shadow-none"
                >
                    确认接收
                </button>
            </div>
        </div>
      )}

      {/* Bottom Nav (Mobile Friendly) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black z-40 pb-safe">
        <div className="flex justify-around items-stretch h-16 max-w-md mx-auto">
           <button 
             onClick={() => setView('GENERATOR')}
             className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${view === 'GENERATOR' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
           >
              <Package className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase">生成</span>
           </button>
           <div className="w-[1px] bg-gray-200"></div>
           <button 
             onClick={() => setView('COLLECTION')}
             className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${view === 'COLLECTION' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
           >
              <Grid className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase">档案</span>
           </button>
           <div className="w-[1px] bg-gray-200"></div>
           <button 
             onClick={() => setView('MISSION')}
             className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${view === 'MISSION' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
           >
              <TerminalSquare className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase">任务</span>
           </button>
           <div className="w-[1px] bg-gray-200"></div>
           <button 
             onClick={() => setView('HISTORY')}
             className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${view === 'HISTORY' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
           >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase">日志</span>
           </button>
        </div>
      </nav>

    </div>
  );
};

export default App;