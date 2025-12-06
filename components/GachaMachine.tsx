import React, { useState } from 'react';
import { CardData, GeneratedCardResponse } from '../types';
import { generateCardMetadata, generateCardImage } from '../services/geminiService';
import { CardDisplay } from './CardDisplay';
import { Save, Trash2, Terminal, Coins, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useStore, COST_PER_PULL } from '../store';

interface GachaMachineProps {
  onSwitchToCollection: () => void;
}

export const GachaMachine: React.FC<GachaMachineProps> = ({ onSwitchToCollection }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [generatedCard, setGeneratedCard] = useState<CardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Store access
  const bytes = useStore(state => state.bytes);
  const deductBytes = useStore(state => state.deductBytes);
  const addCard = useStore(state => state.addCard);
  const logDiscard = useStore(state => state.logDiscard);

  const handlePull = async () => {
    if (bytes < COST_PER_PULL) {
      setError("字节(BYTES)不足。请分解旧造物或等待每日补给。");
      return;
    }

    // Deduct cost immediately
    if (!deductBytes(COST_PER_PULL)) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedCard(null);
    setCurrentStep("正在初始化连接...");

    try {
      // 1. Generate Data
      setCurrentStep("正在合成元数据...");
      const meta: GeneratedCardResponse = await generateCardMetadata();
      
      // 2. Generate Image
      setCurrentStep(`视觉实体化: ${meta.visualPrompt.slice(0, 10)}...`);
      const imageUrl = await generateCardImage(meta.visualPrompt);

      const newCard: CardData = {
        ...meta,
        id: uuidv4(),
        imageUrl: imageUrl,
        timestamp: Date.now()
      };

      setGeneratedCard(newCard);
    } catch (err: any) {
      console.error(err);
      setError("连接中断。资金已退回。");
      // Refund on error
      useStore.setState(state => ({ bytes: state.bytes + COST_PER_PULL }));
    } finally {
      setIsGenerating(false);
      setCurrentStep("");
    }
  };

  const handleSave = () => {
    if (generatedCard) {
      addCard(generatedCard);
      setGeneratedCard(null); // Clear after save to encourage new pull
      onSwitchToCollection(); // Optional: guide user to collection or just stay
    }
  };

  const handleDiscard = () => {
    if (generatedCard) {
        logDiscard(generatedCard);
        setGeneratedCard(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4 space-y-8">
      
      {/* Display Area */}
      <div className="relative w-full max-w-sm min-h-[400px] flex items-center justify-center">
        {isGenerating ? (
          <div className="flex flex-col items-center text-center space-y-4 animate-pulse">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <div className="font-mono text-sm uppercase tracking-widest bg-black text-white px-2 py-1">
              {currentStep}
            </div>
          </div>
        ) : generatedCard ? (
          <div className="animate-[fade-in_0.5s_ease-out]">
            <CardDisplay card={generatedCard} isDetailed={true} />
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-400 space-y-4">
             <div className="w-32 h-48 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-sm">
                <Terminal className="w-8 h-8 opacity-20" />
             </div>
             <p className="font-mono text-xs uppercase tracking-widest">系统就绪</p>
          </div>
        )}
        
        {error && (
           <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10 p-4 text-center">
              <div className="border-2 border-red-500 p-4 text-red-600 font-mono text-sm bg-white">
                 <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-bold">错误</p>
                 </div>
                 <p className="mb-2">{error}</p>
                 <button onClick={() => setError(null)} className="underline text-black hover:text-red-500">确认</button>
              </div>
           </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-sm space-y-3">
        {!generatedCard && !isGenerating && (
          <div className="flex flex-col gap-2">
            <button 
              onClick={handlePull}
              disabled={bytes < COST_PER_PULL}
              className={`
                w-full group relative h-16  text-white font-mono text-xl font-bold uppercase tracking-widest transition-all shadow-[4px_4px_0_0_#999]
                ${bytes < COST_PER_PULL ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800 active:translate-y-1'}
              `}
            >
              <span className="flex items-center justify-center gap-2">
                 执行协议
              </span>
            </button>
            <div className="flex justify-between text-xs font-mono font-bold">
               <span className="text-gray-500">消耗:</span>
               <span className={bytes < COST_PER_PULL ? 'text-red-600' : 'text-black'}>
                 {COST_PER_PULL} BYTES
               </span>
            </div>
          </div>
        )}

        {generatedCard && !isGenerating && (
          <div className="flex gap-4">
            <button 
              onClick={handleDiscard}
              className="flex-1 h-12 flex items-center justify-center gap-2 border-2 border-black font-mono text-sm font-bold uppercase hover:bg-gray-100 transition-colors shadow-retro-sm"
            >
              <Trash2 className="w-4 h-4" /> 丢弃
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 h-12 flex items-center justify-center gap-2 bg-black text-white font-mono text-sm font-bold uppercase hover:bg-gray-800 transition-colors shadow-retro-sm"
            >
              <Save className="w-4 h-4" /> 归档
            </button>
          </div>
        )}
      </div>
      
      {/* Decorative */}
      <div className="text-[10px] text-gray-400 font-mono text-center">
         SYSTEM_ID: GEN-2.5-FLASH <br/>
         STATUS: ONLINE
      </div>
    </div>
  );
};