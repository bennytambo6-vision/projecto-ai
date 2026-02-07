
import React from 'react';
import { VoiceSettings } from '../types';

interface SettingsPanelProps {
  settings: VoiceSettings;
  onSettingsChange: (newSettings: VoiceSettings) => void;
}

const VOICES: { id: VoiceSettings['voiceName']; name: string; gender: string }[] = [
  { id: 'Kore', name: 'Kore', gender: 'Feminino' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Feminino/Neutro' },
  { id: 'Puck', name: 'Puck', gender: 'Masculino' },
  { id: 'Charon', name: 'Charon', gender: 'Masculino' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Masculino' },
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange }) => {
  return (
    <div className="flex flex-col gap-8 p-8 border-l border-cyan-500/20 bg-black/60 backdrop-blur-xl w-80 h-full overflow-y-auto custom-scrollbar">
      <h2 className="font-orbitron text-sm tracking-[0.2em] text-cyan-400 uppercase border-b border-cyan-500/30 pb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Configurações IA
      </h2>

      <div className="space-y-6">
        {/* Voice Selection */}
        <div>
          <label className="text-[10px] uppercase text-cyan-700 tracking-widest block mb-4">Perfil Vocal de JAQUES</label>
          <div className="grid grid-cols-1 gap-2">
            {VOICES.map((v) => (
              <button
                key={v.id}
                onClick={() => onSettingsChange({ ...settings, voiceName: v.id })}
                className={`p-3 rounded-lg border text-left transition-all group ${
                  settings.voiceName === v.id
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'border-cyan-900 bg-black/20 text-cyan-900 hover:border-cyan-700 hover:text-cyan-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-orbitron text-xs tracking-wider">{v.name}</span>
                  <span className="text-[8px] opacity-60 uppercase">{v.gender}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Speed Selection */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase text-cyan-700 tracking-widest">Velocidade da Voz</label>
            <span className="text-cyan-400 font-mono text-xs">{settings.speed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.speed}
            onChange={(e) => onSettingsChange({ ...settings, speed: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[8px] text-cyan-900 uppercase">
            <span>Lento</span>
            <span>Normal</span>
            <span>Rápido</span>
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 border border-cyan-500/10 rounded-lg bg-cyan-950/20">
        <p className="text-[9px] text-cyan-700 leading-relaxed italic">
          * As alterações de voz e velocidade serão aplicadas na próxima interação de voz de JAQUES.
        </p>
      </div>
    </div>
  );
};

export default SettingsPanel;
