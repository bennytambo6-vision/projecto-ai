
import React, { useState, useEffect, useRef, useCallback } from 'react';
import HUD from './components/HUD';
import StatusPanel from './components/StatusPanel';
import Controls from './components/Controls';
import SettingsPanel from './components/SettingsPanel';
import ModuleSelector from './components/ModuleSelector';
import { RobotService } from './services/robotService';
import { GeminiService, GroundingLink } from './services/geminiService';
import { WakeWordService } from './services/wakeWordService';
import { RobotStatus, InteractionState, RobotCommand, AppTab, VoiceSettings } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<RobotStatus>(RobotService.getInstance().getStatus());
  const [interactionState, setInteractionState] = useState<InteractionState>('IDLE');
  const [transcription, setTranscription] = useState('');
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [isBooted, setIsBooted] = useState(false); 
  const [activeTab, setActiveTab] = useState<AppTab>('intelligence');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [groundingLinks, setGroundingLinks] = useState<GroundingLink[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [needsClickToSync, setNeedsClickToSync] = useState(true);
  const [isListeningForActivation, setIsListeningForActivation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voiceName: 'Kore',
    speed: 1.0
  });
  
  const geminiRef = useRef<GeminiService | null>(null);
  const wakeWordRef = useRef<WakeWordService | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('jaques_settings');
    if (saved) {
      try {
        setVoiceSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  const handleDeactivate = useCallback(async () => {
    if (geminiRef.current) {
      await geminiRef.current.stop();
    }
    
    if (wakeWordRef.current) {
      wakeWordRef.current.stop();
    }

    setIsSystemActive(false);
    setIsBooted(false);
    setNeedsClickToSync(true);
    setIsListeningForActivation(false);
    setInteractionState('IDLE');
    setTranscription('');
    setGroundingLinks([]);
    setActiveTab('intelligence');
    setIsMenuOpen(false);
    
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    if (isBooted && interactionState !== 'SPEAKING') {
      inactivityTimerRef.current = setTimeout(() => {
        handleDeactivate();
      }, 120000); 
    }
  }, [isBooted, interactionState, handleDeactivate]);

  const handleSettingsChange = (newSettings: VoiceSettings) => {
    setVoiceSettings(newSettings);
    localStorage.setItem('jaques_settings', JSON.stringify(newSettings));
    if (isSystemActive) {
      handleToggleSystem(false, true);
    }
  };

  const handleToggleSystem = useCallback(async (isWakeTrigger = false, forceReconnect = false) => {
    if (!isBooted && isWakeTrigger) {
        setIsBooted(true);
    }

    if (forceReconnect || !isSystemActive || isWakeTrigger) {
      if (isSystemActive && !forceReconnect) return;
      
      if (isSystemActive) await geminiRef.current?.stop();
      
      wakeWordRef.current?.stop();
      setInteractionState('LISTENING');
      try {
        if (!geminiRef.current) {
          geminiRef.current = new GeminiService();
        }
        await geminiRef.current.connect({
          onMessage: (text, type) => {
            resetInactivityTimer();
            setTranscription(text);
            if (type === 'ai') setInteractionState('SPEAKING');
            else setInteractionState('LISTENING');
          },
          onUICommand: (cmd) => {
            resetInactivityTimer();
            if (cmd.type === 'navigate' && cmd.target) {
              setActiveTab(cmd.target);
            } else if (cmd.type === 'deactivate') {
              handleDeactivate();
            }
          },
          onStatusChange: (status) => console.log('Gemini Status:', status),
          onGroundingLinks: (links) => {
            setGroundingLinks(prev => {
              const combined = [...prev, ...links];
              const unique = Array.from(new Map(combined.map(item => [item.uri, item])).values());
              return unique.slice(-8);
            });
            resetInactivityTimer();
          }
        }, voiceSettings);
        setIsSystemActive(true);
      } catch (err) {
        console.error(err);
        setInteractionState('ERROR');
        wakeWordRef.current?.start();
      }
    } else {
      await geminiRef.current?.stop();
      setIsSystemActive(false);
      setInteractionState('IDLE');
      setTranscription('');
      setGroundingLinks([]);
      wakeWordRef.current?.start();
    }
  }, [isSystemActive, isBooted, voiceSettings, handleDeactivate, resetInactivityTimer]);

  const handleVoiceCommand = useCallback((command: string) => {
    resetInactivityTimer();
    switch (command) {
      case 'open_menu':
        setIsMenuOpen(true);
        break;
      case 'nav_intelligence':
        setActiveTab('intelligence');
        setIsMenuOpen(false);
        break;
      case 'nav_navigation':
        setActiveTab('navigation');
        setIsMenuOpen(false);
        break;
      case 'nav_diagnostic':
        setActiveTab('diagnostic');
        setIsMenuOpen(false);
        break;
      case 'nav_search':
        setActiveTab('search');
        setIsMenuOpen(false);
        break;
      case 'nav_settings':
        setActiveTab('settings');
        setIsMenuOpen(false);
        break;
    }
  }, [resetInactivityTimer]);

  const syncAndStartListening = useCallback(() => {
    if (!needsClickToSync) return;
    setNeedsClickToSync(false);
    setIsListeningForActivation(true);
    
    if (!wakeWordRef.current) {
      wakeWordRef.current = new WakeWordService(
        () => {
          handleToggleSystem(true);
        },
        () => {
          handleDeactivate();
        },
        (cmd) => {
          handleVoiceCommand(cmd);
        }
      );
    }
    wakeWordRef.current.start();
  }, [needsClickToSync, handleToggleSystem, handleDeactivate, handleVoiceCommand]);

  useEffect(() => {
    const activityEvents = ['mousedown', 'keydown', 'touchstart'];
    const handleGlobalActivity = () => resetInactivityTimer();

    if (isBooted) {
      activityEvents.forEach(event => window.addEventListener(event, handleGlobalActivity));
      resetInactivityTimer();
    }
    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, handleGlobalActivity));
    };
  }, [isBooted, resetInactivityTimer]);

  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatus(RobotService.getInstance().getStatus());
    }, 1000);
    return () => clearInterval(statusInterval);
  }, []);

  const handleCommand = useCallback(async (cmd: RobotCommand) => {
    await RobotService.getInstance().sendCommand(cmd);
    setTranscription(`EXECUTANDO COMANDO: ${cmd}`);
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setInteractionState('THINKING');
    try {
      if (!geminiRef.current) geminiRef.current = new GeminiService();
      const result = await geminiRef.current.searchWeb(searchQuery);
      setTranscription(result.text);
      if (result.links.length > 0) {
        setGroundingLinks(prev => {
          const combined = [...prev, ...result.links];
          const unique = Array.from(new Map(combined.map(item => [item.uri, item])).values());
          return unique.slice(-8);
        });
      }
    } catch (err) {
      console.error(err);
      setTranscription("ERRO NO PROTOCOLO DE BUSCA.");
    } finally {
      setIsSearching(false);
      setInteractionState('IDLE');
      setSearchQuery('');
      resetInactivityTimer();
    }
  };

  if (!isBooted) {
    return (
      <div 
        onClick={syncAndStartListening}
        className="h-screen w-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center cursor-pointer overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="mb-12 relative scale-150">
          <div className="w-40 h-40 border-[0.5px] border-cyan-500/20 rounded-full animate-ping absolute inset-0" />
          <div className="w-40 h-40 border border-cyan-500/10 rounded-full animate-pulse relative z-10 flex items-center justify-center">
            <div className={`w-12 h-12 rounded-full transition-all duration-1000 border-2 border-cyan-400/50 flex items-center justify-center ${isListeningForActivation ? 'bg-cyan-500/20 shadow-[0_0_40px_rgba(34,211,238,0.6)]' : 'bg-cyan-900/10'}`}>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        <div className="z-20 space-y-4">
            <h1 className="font-orbitron text-6xl font-black text-gold tracking-[0.4em] mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">JAQUES</h1>
            <p className="text-cyan-500/50 font-orbitron text-[10px] tracking-[0.8em] uppercase font-bold">Advanced Neural Core Interface</p>
        </div>
        
        <div className="mt-20 h-24 flex flex-col justify-center items-center gap-4 z-20">
            {needsClickToSync ? (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                    <p className="text-cyan-400 font-bold animate-pulse tracking-[0.3em] uppercase text-xs">
                        Sincronizar Protocolo de Áudio
                    </p>
                    <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                </div>
            ) : (
                <div className="space-y-4 animate-[fade-in_0.5s_ease-out] flex flex-col items-center">
                    <div className="flex items-center gap-4">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <p className="text-emerald-400 font-bold tracking-[0.4em] uppercase text-xs">
                            SISTEMA ONLINE
                        </p>
                    </div>
                    <div className="px-8 py-3 bg-cyan-950/20 border border-cyan-500/30 rounded-full backdrop-blur-md">
                        <p className="text-cyan-400 font-orbitron animate-pulse text-lg tracking-[0.3em] font-bold">
                            DIGA: "JAQUES"
                        </p>
                    </div>
                </div>
            )}
        </div>

        {/* Corner Accents */}
        <div className="absolute top-12 left-12 w-24 h-24 border-t-2 border-l-2 border-cyan-500/10" />
        <div className="absolute bottom-12 right-12 w-24 h-24 border-b-2 border-r-2 border-cyan-500/10" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#020617] overflow-hidden relative selection:bg-cyan-500 selection:text-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05)_0%,transparent_100%)] pointer-events-none" />

      {/* PC Style Top Bar */}
      <header className="z-[120] h-10 bg-black/80 border-b border-cyan-500/20 backdrop-blur-md flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gold rounded-full shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse" />
            <span className="text-[10px] font-orbitron font-bold text-gold tracking-widest uppercase">JAQUES_OS v7.2</span>
          </div>
          <div className="h-4 w-[1px] bg-cyan-500/20" />
          <div className="flex items-center gap-4 text-[9px] text-cyan-600 font-mono tracking-tighter">
            <span>PROC: CORE_STABLE</span>
            <span>MEM: {Math.floor(activityLevel * 100) / 100}%</span>
            <span>UPLINK: ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-mono text-cyan-400 tracking-wider">
            {currentTime.toLocaleTimeString('pt-BR', { hour12: false })}
          </div>
          <div className="text-[10px] font-mono text-cyan-700">
            {currentTime.toLocaleDateString('pt-BR')}
          </div>
        </div>
      </header>

      {/* Main Content Area: PC Split Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Docked Left Sidebar (PC Layout) */}
        {activeTab === 'navigation' && (
          <aside className="relative z-40 border-r border-cyan-500/10 animate-[slide-in_0.3s_ease-out]">
            <Controls onCommand={handleCommand} />
            <button 
              onClick={() => setActiveTab('intelligence')}
              className="absolute top-2 right-2 text-cyan-800 hover:text-cyan-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </aside>
        )}

        {/* Center Canvas */}
        <section className="flex-1 relative flex flex-col min-w-0">
           {/* Top Search Overlay (Specific for PC focus) */}
           {activeTab === 'search' && (
              <div className="absolute left-0 right-0 top-6 z-40 flex justify-center px-8 animate-[slide-down_0.3s_ease-out]">
                <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl bg-black/80 backdrop-blur-2xl border border-cyan-500/30 p-6 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
                  <div className="flex flex-col gap-4">
                    <div className="text-[10px] font-orbitron text-cyan-500 tracking-widest uppercase mb-1">Global Intelligence Grounding</div>
                    <div className="flex gap-4">
                        <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Solicitar dados externos..."
                        className="flex-1 bg-cyan-950/20 border border-cyan-500/30 rounded-xl px-5 py-3 text-cyan-100 placeholder:text-cyan-800 focus:outline-none focus:border-cyan-400 transition-all font-mono"
                        />
                        <button 
                        disabled={isSearching}
                        type="submit" 
                        className="px-8 py-3 bg-cyan-600 hover:bg-cyan-400 disabled:bg-cyan-900 text-black font-black rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs"
                        >
                        {isSearching ? '...' : 'Processar'}
                        </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

           <HUD state={interactionState} transcription={transcription} />

           {groundingLinks.length > 0 && (
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 z-30 max-w-4xl max-h-[15vh] overflow-y-auto p-4 custom-scrollbar">
               {groundingLinks.map((link, idx) => (
                 <a 
                   key={idx} 
                   href={link.uri} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-cyan-950/40 border border-cyan-500/20 px-4 py-2 rounded-full hover:bg-cyan-400 hover:text-black transition-all text-[9px] group backdrop-blur-md"
                 >
                   <span className="font-bold tracking-wider">{link.title}</span>
                 </a>
               ))}
             </div>
           )}
        </section>

        {/* Docked Right Sidebar (PC Layout) */}
        {(activeTab === 'diagnostic' || activeTab === 'settings') && (
          <aside className="relative z-40 border-l border-cyan-500/10 animate-[slide-in-right_0.3s_ease-out]">
            {activeTab === 'diagnostic' && <StatusPanel status={status} />}
            {activeTab === 'settings' && <SettingsPanel settings={voiceSettings} onSettingsChange={handleSettingsChange} />}
            <button 
              onClick={() => setActiveTab('intelligence')}
              className="absolute top-2 left-2 text-cyan-800 hover:text-cyan-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </aside>
        )}
      </main>

      {/* Modular Menu Selector Overlay */}
      <ModuleSelector 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        activeTab={activeTab} 
        onSelect={setActiveTab} 
      />

      {/* PC Minimal Footer */}
      <footer className="z-[110] h-16 flex items-center justify-center relative bg-black/90 border-t border-cyan-500/10 backdrop-blur-xl">
         {/* Telemetry Left */}
         <div className="absolute left-8 hidden lg:flex items-center gap-4 text-[8px] font-orbitron tracking-widest text-cyan-800 uppercase">
             <div className="flex flex-col">
                <span>AUTH_SIG: BENEDITO_JAQUES</span>
                <span>SYSTEM: READY</span>
             </div>
         </div>

         {/* Central Core Button - The Main Toggle */}
         <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${isMenuOpen ? 'border-cyan-400 bg-cyan-500/20 scale-110 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'border-cyan-900 bg-black/60 hover:border-cyan-500'}`}
         >
             <div className={`w-6 h-6 rounded-full border border-cyan-400 flex items-center justify-center transition-transform duration-700 ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`}>
                 <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_cyan]" />
             </div>
             <div className="absolute inset-0 animate-[spin_10s_linear_infinite] opacity-30 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-cyan-400" />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-cyan-400" />
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-cyan-400" />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-cyan-400" />
             </div>
             <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[8px] font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-all tracking-widest whitespace-nowrap">
                {isMenuOpen ? 'CLOSE_TERMINAL' : 'OPEN_TERMINAL'}
             </span>
         </button>

         {/* Telemetry Right */}
         <div className="absolute right-8 hidden lg:flex items-center gap-4 text-[8px] font-orbitron tracking-widest text-cyan-800 uppercase text-right">
            <div className="flex flex-col">
                <span>LINK_CORE: ENCRYPTED</span>
                <span>LOCATION: CAF_ANGOLA</span>
             </div>
         </div>
      </footer>

      {/* Decorative Borders */}
      <div className="absolute top-10 left-0 w-2 h-[80%] border-l border-cyan-500/5 pointer-events-none" />
      <div className="absolute top-10 right-0 w-2 h-[80%] border-r border-cyan-500/5 pointer-events-none" />
    </div>
  );
};

// Variable for random memory usage visual
const activityLevel = 35 + Math.random() * 15;

export default App;
