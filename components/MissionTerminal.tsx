import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, Code, CheckCircle, XCircle, RefreshCw, ChevronRight, Loader2, Lock } from 'lucide-react';
import { useStore } from '../store';
import { MissionSignal, MissionDifficulty, ActiveMissionData } from '../types';
import { generateMission, verifyMissionAnswer } from '../services/geminiService';

const REWARDS: Record<MissionDifficulty, number> = {
  EASY: 50,
  MEDIUM: 100,
  HARD: 250,
};

const DIFFICULTY_CN: Record<MissionDifficulty, string> = {
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难',
};

export const MissionTerminal: React.FC = () => {
  const earnBytes = useStore(state => state.earnBytes);
  
  // State
  const [signals, setSignals] = useState<MissionSignal[]>([]);
  const [activeSignal, setActiveSignal] = useState<MissionSignal | null>(null);
  const [activeMissionData, setActiveMissionData] = useState<ActiveMissionData | null>(null);
  
  const [loadingState, setLoadingState] = useState<'IDLE' | 'SCANNING' | 'DOWNLOADING' | 'VERIFYING'>('IDLE');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<{status: 'SUCCESS' | 'ERROR', msg: string} | null>(null);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initial Scan
  useEffect(() => {
    scanForSignals();
  }, []);

  const scanForSignals = () => {
    setLoadingState('SCANNING');
    setActiveSignal(null);
    setActiveMissionData(null);
    setFeedback(null);
    setInput('');

    // Simulate network scan
    setTimeout(() => {
        const newSignals: MissionSignal[] = [];
        const types: ('PYTHON' | 'LOGIC' | 'CRYPTO')[] = ['PYTHON', 'LOGIC', 'CRYPTO', 'PYTHON']; // Higher weight for Python
        
        for (let i = 0; i < 3; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const difficulty: MissionDifficulty = Math.random() > 0.7 ? 'HARD' : Math.random() > 0.4 ? 'MEDIUM' : 'EASY';
            newSignals.push({
                id: Math.random().toString(36).substr(2, 6).toUpperCase(),
                difficulty,
                type,
                reward: REWARDS[difficulty]
            });
        }
        setSignals(newSignals);
        setLoadingState('IDLE');
    }, 800);
  };

  const handleSelectSignal = async (signal: MissionSignal) => {
    setActiveSignal(signal);
    setLoadingState('DOWNLOADING');
    setFeedback(null);
    setInput('');
    
    try {
        const data = await generateMission(signal.difficulty, signal.type);
        setActiveMissionData(data);
        setTimeout(() => inputRef.current?.focus(), 100);
    } catch (e) {
        console.error(e);
        setFeedback({ status: 'ERROR', msg: '连接中断' });
        setActiveSignal(null);
    } finally {
        setLoadingState('IDLE');
    }
  };

  const handleSubmit = async () => {
    if (!activeSignal || !activeMissionData || !input.trim()) return;

    setLoadingState('VERIFYING');
    
    try {
        const result = await verifyMissionAnswer(activeMissionData.description, activeMissionData.context, input);
        
        if (result.success) {
            setFeedback({ status: 'SUCCESS', msg: result.message });
            earnBytes(activeSignal.reward, `任务完成: ${activeSignal.type} [${activeSignal.id}]`);
            
            // Auto close after success
            setTimeout(() => {
                setActiveSignal(null);
                setActiveMissionData(null);
                setSignals(prev => prev.filter(s => s.id !== activeSignal.id));
                setFeedback(null);
            }, 2000);
        } else {
            setFeedback({ status: 'ERROR', msg: result.message });
        }
    } catch (e) {
        setFeedback({ status: 'ERROR', msg: '系统错误' });
    } finally {
        setLoadingState('IDLE');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        handleSubmit();
    }
  };

  return (
    <div className="w-full pb-20 p-4 font-mono">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
            <div>
                <h2 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-2">
                    <Terminal className="w-6 h-6" /> 任务终端
                </h2>
                <p className="text-xs text-gray-500">
                    {loadingState === 'SCANNING' ? '正在扫描加密频段...' : '等待操作员指令...'}
                </p>
            </div>
            <button 
                onClick={scanForSignals}
                disabled={loadingState !== 'IDLE'}
                className="p-2 hover:bg-gray-100 border border-transparent hover:border-black rounded-sm transition-all disabled:opacity-50"
            >
                <RefreshCw className={`w-4 h-4 ${loadingState === 'SCANNING' ? 'animate-spin' : ''}`} />
            </button>
        </div>

        {/* Active Mission Interface (Terminal Style) */}
        {activeSignal ? (
            <div className="bg-black text-green-500 p-6 rounded-sm shadow-retro relative overflow-hidden min-h-[400px] flex flex-col transition-all">
                {/* CRT Scanline effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
                
                {/* Header */}
                <div className="flex justify-between items-start mb-6 border-b border-green-900 pb-2 relative z-20">
                    <div>
                        <span className="text-xs text-green-700 block mb-1">目标协议 ID: {activeSignal.id}</span>
                        <h3 className="text-xl font-bold uppercase flex items-center gap-2">
                             {activeSignal.type} :: {DIFFICULTY_CN[activeSignal.difficulty]}
                        </h3>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-green-700 block mb-1">悬赏金</span>
                        <span className="text-xl font-bold">{activeSignal.reward} BYTES</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 font-mono text-sm sm:text-base mb-4 relative z-20 overflow-y-auto">
                    {loadingState === 'DOWNLOADING' ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2 opacity-70">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="animate-pulse">正在解密任务数据...</span>
                        </div>
                    ) : activeMissionData ? (
                        <div className="animate-[fade-in_0.3s_ease-out]">
                            <div className="text-green-700 text-xs mb-2">root@system:~/missions# cat instruction.txt</div>
                            <div className="whitespace-pre-wrap font-bold leading-relaxed mb-6">
                                {activeMissionData.description}
                            </div>
                            
                            <div className="text-green-700 text-xs mb-2">root@system:~/missions# editor solution.{activeSignal.type === 'PYTHON' ? 'py' : 'txt'}</div>
                            <div className="relative group">
                                <textarea 
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        setFeedback(null);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    className="w-full h-32 bg-green-950/20 border border-green-800 text-green-400 p-2 font-mono outline-none focus:border-green-500 resize-none"
                                    placeholder={activeSignal.type === 'PYTHON' ? "def solution():\n    pass" : "输入解决方案..."}
                                    spellCheck={false}
                                />
                                <div className="text-[10px] text-green-800 mt-1 flex justify-between">
                                   <span>Ctrl+Enter 提交</span>
                                   <span>{input.length} 字符</span>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Action Bar */}
                {activeMissionData && (
                    <div className="relative z-20 flex items-center justify-between mt-2">
                        <div className="flex-1">
                            {feedback && (
                                <div className={`text-xs font-bold flex items-center gap-1 ${feedback.status === 'SUCCESS' ? 'text-green-400 animate-pulse' : 'text-red-500'}`}>
                                    {feedback.status === 'SUCCESS' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    [{feedback.msg}]
                                </div>
                            )}
                            {loadingState === 'VERIFYING' && (
                                <div className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    编译并验证中...
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                             <button 
                                onClick={() => setActiveSignal(null)}
                                className="px-4 py-2 text-xs font-bold border border-green-900 text-green-700 hover:bg-green-900 hover:text-green-400 transition-colors uppercase"
                            >
                                放弃
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={loadingState === 'VERIFYING' || !input}
                                className="px-6 py-2 bg-green-900 text-black font-bold text-xs hover:bg-green-500 transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                执行
                            </button>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            /* Signal List */
            <div className="space-y-3">
                {signals.length === 0 && loadingState !== 'SCANNING' && (
                    <div className="text-center py-12 opacity-50 font-mono border-2 border-dashed border-gray-300">
                        <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        范围内未检测到信号。<br/>请运行扫描程序以发现悬赏。
                    </div>
                )}
                
                {loadingState === 'SCANNING' && (
                    <div className="space-y-3">
                         {[1,2,3].map(i => (
                             <div key={i} className="h-20 bg-gray-100 animate-pulse border-2 border-gray-200"></div>
                         ))}
                    </div>
                )}

                {signals.map((signal) => (
                    <div 
                        key={signal.id}
                        onClick={() => handleSelectSignal(signal)}
                        className="group relative bg-white border-2 border-black p-4 hover:bg-black hover:text-white transition-all cursor-pointer shadow-retro-sm hover:shadow-retro hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 border border-current ${
                                    signal.type === 'PYTHON' ? 'rounded-none' : 'rounded-full'
                                }`}>
                                    {signal.type === 'PYTHON' ? <Code className="w-5 h-5" /> : 
                                     signal.type === 'CRYPTO' ? <Lock className="w-5 h-5" /> : 
                                     <Cpu className="w-5 h-5" />}
                                </div>
                                <div>
                                    <div className="text-xs font-bold opacity-60">信号ID: {signal.id}</div>
                                    <div className="font-bold text-sm uppercase">{signal.type} 协议</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-[10px] font-bold px-2 py-0.5 border border-current inline-block mb-1 ${
                                    signal.difficulty === 'HARD' ? 'text-red-500 group-hover:text-red-400' : 
                                    signal.difficulty === 'MEDIUM' ? 'text-yellow-600 group-hover:text-yellow-400' : 'text-green-600 group-hover:text-green-400'
                                }`}>
                                    {DIFFICULTY_CN[signal.difficulty]}
                                </div>
                                <div className="font-bold text-sm">{signal.reward} BYTES</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};