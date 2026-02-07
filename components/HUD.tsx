
import React, { useEffect, useState, useRef } from 'react';
import { InteractionState } from '../types';

interface HUDProps {
  state: InteractionState;
  transcription: string;
}

const HUD: React.FC<HUDProps> = ({ state, transcription }) => {
  const isIdle = state === 'IDLE';
  const isSpeaking = state === 'SPEAKING';
  const isListening = state === 'LISTENING';
  const isThinking = state === 'THINKING';
  
  const [randomData, setRandomData] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate random "telemetry" data
  useEffect(() => {
    const interval = setInterval(() => {
      const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
      const labels = ['VOLT', 'SYNC', 'CORE', 'DATA', 'THRT', 'LOAD', 'CELL'];
      const label = labels[Math.floor(Math.random() * labels.length)];
      const val = (Math.random() * 100).toFixed(2);
      setRandomData(prev => [`${label}::${hex} > ${val}%`, ...prev].slice(0, 15));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-center h-full w-full overflow-hidden transition-all duration-500 ${isThinking ? 'scale-[1.02]' : 'scale-100'}`}>
      
      {/* Background Ambience e Grade Hexagonal */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(circle at center, transparent 0%, #020617 100%), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%2306b6d4' fill='none' opacity='0.5'/%3E%3C/svg%3E")`, backgroundSize: 'center, 60px 60px' }} />

      {/* Side Peripheral Telemetry - LEFT */}
      <div className="absolute left-8 top-1/4 bottom-1/4 w-32 hidden lg:flex flex-col gap-2 z-20 pointer-events-none overflow-hidden">
        <div className="text-[8px] font-bold text-cyan-600 tracking-widest mb-2 border-b border-cyan-500/20 pb-1">CORE_TELEMETRY</div>
        <div className="flex flex-col gap-1 font-mono text-[8px] text-cyan-500/40">
           {randomData.map((line, i) => (
             <div key={i} className="animate-[fade-in_0.3s_ease-out]">{line}</div>
           ))}
        </div>
      </div>

      {/* Side Peripheral Telemetry - RIGHT */}
      <div className="absolute right-8 top-1/4 bottom-1/4 w-32 hidden lg:flex flex-col items-end gap-4 z-20 pointer-events-none">
        <div className="text-[8px] font-bold text-cyan-600 tracking-widest mb-2 border-b border-cyan-500/20 pb-1 w-full text-right">SYSTEM_GRIDS</div>
        <div className="flex gap-1 h-32 items-end">
            {[...Array(12)].map((_, i) => (
                <div key={i} 
                     className="w-1 bg-cyan-500/20 rounded-t-sm transition-all duration-300"
                     style={{ height: `${20 + Math.random() * 80}%`, opacity: 0.3 + Math.random() * 0.7 }} />
            ))}
        </div>
        <div className="flex flex-col items-end gap-1 mt-4">
             <div className="flex items-center gap-2">
                 <span className="text-[8px] text-cyan-700">LINK_SIG</span>
                 <div className="w-16 h-1 bg-cyan-950 rounded-full overflow-hidden">
                     <div className="h-full bg-cyan-400 animate-pulse" style={{ width: '85%' }} />
                 </div>
             </div>
             <div className="flex items-center gap-2">
                 <span className="text-[8px] text-cyan-700">MEM_ALLOC</span>
                 <div className="w-16 h-1 bg-cyan-950 rounded-full overflow-hidden">
                     <div className="h-full bg-cyan-400 animate-pulse" style={{ width: '42%' }} />
                 </div>
             </div>
        </div>
      </div>

      {/* Cinematic Title */}
      <div className="absolute top-12 left-0 right-0 text-center z-30 pointer-events-none">
        <div className="flex items-center justify-center gap-3">
            <div className="h-[0.5px] w-24 bg-gradient-to-r from-transparent to-gold opacity-50" />
            <h2 className={`font-orbitron text-4xl font-black tracking-[0.5em] text-gold text-shadow-lg transition-all duration-700 ${(isSpeaking || isListening) ? 'scale-110 chromatic' : 'scale-100'}`}>
              JAQUES
            </h2>
            <div className="h-[0.5px] w-24 bg-gradient-to-l from-transparent to-gold opacity-50" />
        </div>
        <div className="text-[10px] font-orbitron text-cyan-500/60 tracking-[0.8em] mt-2 font-bold opacity-80">MARK VII NEURAL CORE</div>
      </div>

      {/* Central Core - Arc Reactor Style */}
      <div className="relative w-[30rem] h-[30rem] flex items-center justify-center">
        {/* Camadas de Brilho Externo */}
        <div className={`absolute inset-0 bg-cyan-500/5 rounded-full blur-[80px] transition-opacity duration-1000 ${isIdle ? 'opacity-10' : 'opacity-60'}`} />
        
        {/* Dynamic Lens Flare Streak */}
        {!isIdle && <div className="lens-flare-dynamic" />}

        {/* Pulsing Outer Rings */}
        <div className={`absolute inset-0 border border-cyan-500/10 rounded-full transition-opacity duration-500 ${!isIdle ? 'opacity-100 pulse-ring-active' : 'opacity-0'}`} />
        <div className={`absolute inset-10 border border-cyan-500/5 rounded-full transition-opacity duration-700 delay-300 ${!isIdle ? 'opacity-80 pulse-ring-active' : 'opacity-0'}`} />

        {/* Aneis Giratórios Complexos */}
        <div className="absolute inset-4 border-[0.5px] border-cyan-500/20 rounded-full animate-[spin_120s_linear_infinite]" />
        <div className="absolute inset-12 border-[1px] border-cyan-500/10 rounded-full animate-[spin_90s_linear_infinite_reverse]" />
        
        {/* Bússola Digital Externa */}
        <div className="absolute inset-20 opacity-30 animate-[spin_60s_linear_infinite]">
            {[...Array(24)].map((_, i) => (
                <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-cyan-400" style={{ transform: `rotate(${i * 15}deg)`, transformOrigin: '0 148px' }} />
            ))}
        </div>

        {/* Targeting Brackets Overlay */}
        <div className={`absolute inset-32 transition-all duration-1000 ${isListening ? 'scale-110 rotate-45 opacity-60' : 'scale-90 rotate-0 opacity-20'}`}>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />
        </div>

        {/* Central Core Structure */}
        <div className={`relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-700 ${!isIdle ? 'scale-110 shadow-[0_0_80px_rgba(6,182,212,0.5)]' : 'scale-100 opacity-40 grayscale-[0.5]'}`}>
          
          {/* Hexagonal Inner Mask */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-full border border-cyan-500/30 overflow-hidden">
             <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0l8.66 5v10L10 20 1.34 15V5z' fill='%2306b6d4'/%3E%3C/svg%3E")`, backgroundSize: '24px' }} />
          </div>

          {/* SVG Animated Reactor */}
          <svg viewBox="0 0 100 100" className={`w-full h-full relative z-10 glow-blue transition-all duration-500 ${isSpeaking ? 'scale-105 text-white' : 'text-cyan-500'}`}>
            {/* Segmented Rings */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 5" className="opacity-20" />
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="10 10" className="opacity-10 animate-[spin_40s_linear_infinite]" />
            
            {/* Dynamic Activity Rings */}
            <circle 
              cx="50" cy="50" r="42" 
              fill="none" stroke="currentColor" strokeWidth="4" 
              strokeDasharray="25 15"
              className={`transition-all duration-1000 ${isListening ? 'animate-[spin_1.5s_linear_infinite] stroke-white' : 'animate-[spin_12s_linear_infinite] opacity-40'}`} 
            />
            
            <circle 
              cx="50" cy="50" r="38" 
              fill="none" stroke="currentColor" strokeWidth="1" 
              strokeDasharray="100 80"
              className={`animate-[spin_20s_linear_infinite_reverse] opacity-30`} 
            />

            {/* Speaking Waveform (Static concentric circles that pulse) */}
            {isSpeaking && (
              <>
                <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="2" className="animate-pulse opacity-60" />
                <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="0.5" className="animate-ping opacity-20" />
              </>
            )}

            {/* Central Power Core */}
            <g className={`transition-transform duration-500 ${isListening ? 'scale-125' : 'scale-100'}`}>
                <circle cx="50" cy="50" r="14" fill="currentColor" className="opacity-90 shadow-2xl" />
                <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="0.5" className="animate-ping opacity-40" />
            </g>
            
            {/* Triangle Overlays (Arc Reactor Vanes) */}
            {[0, 120, 240].map((deg) => (
              <path key={deg} d="M50 18 L58 36 L42 36 Z" fill="currentColor" className="opacity-50" style={{ transformOrigin: '50px 50px', transform: `rotate(${deg}deg)` }} />
            ))}
          </svg>

          {/* Lens Flares Inside Core */}
          <div className="absolute w-full h-[1px] bg-cyan-400/40 blur-[2px] rotate-45" />
          <div className="absolute w-full h-[1px] bg-cyan-400/40 blur-[2px] -rotate-45" />
        </div>
      </div>

      {/* Visual Glitch & HUD Scanlines */}
      <div className={`absolute inset-0 hud-scanline opacity-20 pointer-events-none ${isThinking ? 'opacity-40 glitch-active' : ''}`} />
      <div className="scanning-bar opacity-20" />
      
      {/* HUD Borders Decorative */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none px-4 opacity-40">
          <div className="flex flex-col gap-1">
              <div className="text-[10px] font-orbitron font-bold tracking-[0.4em] text-cyan-600">FRM_RATE: 60.0 FPS</div>
              <div className="text-[10px] font-orbitron font-bold tracking-[0.4em] text-cyan-600">SYS_TEMP: 32.4°C</div>
          </div>
          <div className="flex flex-col items-end gap-1">
              <div className="text-[10px] font-orbitron font-bold tracking-[0.4em] text-cyan-600">LOC_ID: LUANDA_AO</div>
              <div className="text-[10px] font-orbitron font-bold tracking-[0.4em] text-cyan-600">AUTH: B_JAQUES</div>
          </div>
      </div>
    </div>
  );
};

export default HUD;
