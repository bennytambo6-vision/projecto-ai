
import React from 'react';
import { MODULE_CATEGORIES } from '../constants';
import { AppTab } from '../types';

interface ModuleSelectorProps {
  onSelect: (tab: AppTab) => void;
  activeTab: AppTab;
  isOpen: boolean;
  onClose: () => void;
}

const ModuleSelector: React.FC<ModuleSelectorProps> = ({ onSelect, activeTab, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pb-32 px-6 pointer-events-none">
      {/* Backdrop tap to close */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" 
        onClick={onClose}
      />
      
      {/* Floating Menu Container */}
      <div className="relative w-full max-w-4xl grid grid-cols-2 md:grid-cols-5 gap-4 animate-[slide-up_0.3s_cubic-bezier(0.16,1,0.3,1)] pointer-events-auto">
        {MODULE_CATEGORIES.map((module) => {
          const isActive = activeTab === module.id;
          return (
            <button
              key={module.id}
              onClick={() => {
                onSelect(module.id);
                onClose();
              }}
              className={`relative group transition-all duration-500 p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 overflow-hidden backdrop-blur-2xl ${
                isActive 
                  ? `border-cyan-400 bg-cyan-400/20 shadow-[0_0_40px_rgba(6,182,212,0.4)] scale-105` 
                  : 'border-cyan-500/20 bg-black/80 hover:border-cyan-500/50 hover:bg-cyan-950/40'
              }`}
            >
              {/* Background Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              <span className="text-4xl mb-2 filter drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] group-hover:scale-110 transition-transform">
                {module.icon}
              </span>
              
              <div className="flex flex-col items-center">
                <span className={`font-orbitron text-[11px] font-bold tracking-[0.2em] uppercase transition-colors ${isActive ? 'text-cyan-300' : 'text-cyan-600 group-hover:text-cyan-400'}`}>
                  {module.label}
                </span>
                <span className="text-[8px] font-mono text-cyan-900 uppercase tracking-tighter mt-1 group-hover:text-cyan-400/60 transition-colors text-center leading-tight">
                  {module.description}
                </span>
              </div>

              {/* Corner Accents */}
              <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l transition-colors ${isActive ? 'border-cyan-400' : 'border-cyan-900'}`} />
              <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r transition-colors ${isActive ? 'border-cyan-400' : 'border-cyan-900'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ModuleSelector;
