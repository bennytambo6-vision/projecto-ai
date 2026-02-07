
import React from 'react';
import { RobotCommand } from '../types';

interface ControlsProps {
  onCommand: (cmd: RobotCommand) => void;
}

const Controls: React.FC<ControlsProps> = ({ onCommand }) => {
  return (
    <div className="flex flex-col gap-6 p-6 bg-black/60 backdrop-blur-md w-72 h-full">
      <h2 className="font-orbitron text-sm tracking-widest text-cyan-500 uppercase border-b border-cyan-500/30 pb-2">
        Operações de Hardware
      </h2>

      <div className="space-y-4">
        <h3 className="text-[10px] uppercase text-cyan-600 tracking-[0.2em] mb-2 font-bold">Protocolos Ativos</h3>
        
        <button 
          onClick={() => onCommand(RobotCommand.STOP)}
          className="w-full py-3 bg-red-950/40 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all rounded-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]"
        >
          PARAGEM_EMERGÊNCIA
        </button>

        <button 
          onClick={() => onCommand(RobotCommand.FOLLOW)}
          className="w-full py-3 bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all rounded-sm"
        >
          MODO_ACOMPANHAR
        </button>

        <button 
          onClick={() => onCommand(RobotCommand.HOME)}
          className="w-full py-3 bg-blue-950/40 border border-blue-500/50 text-blue-400 hover:bg-blue-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all rounded-sm"
        >
          RETORNAR_À_BASE
        </button>
      </div>

      <div className="mt-auto p-4 border border-cyan-500/10 rounded-lg bg-cyan-950/5">
        <div className="text-[9px] text-cyan-700 uppercase tracking-widest mb-1">Status Operacional</div>
        <div className="text-[10px] text-cyan-300 font-mono leading-tight">AGUARDANDO INPUT DE COMANDO...</div>
      </div>
    </div>
  );
};

export default Controls;
