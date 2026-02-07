
import React, { useState, useEffect } from 'react';
import { RobotStatus } from '../types';

interface StatusPanelProps {
  status: RobotStatus;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ status }) => {
  const [activity, setActivity] = useState(50);
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    if (!status.wifi) {
      setActivity(0);
      return;
    }
    const interval = setInterval(() => {
      setActivity(prev => {
        const delta = (Math.random() - 0.5) * 40;
        return Math.min(100, Math.max(20, prev + delta));
      });
    }, 800); 

    const pulseInterval = setInterval(() => {
      setPulseScale(1 + Math.sin(Date.now() / 250) * 0.05); 
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(pulseInterval);
    };
  }, [status.wifi]);

  const getActivityColor = () => {
    if (!status.wifi) return 'bg-cyan-950';
    if (activity > 85) return 'bg-white';
    if (activity > 50) return 'bg-cyan-400';
    return 'bg-cyan-700';
  };

  const getGlowStyle = (index: number) => {
    if (!status.wifi) return 'none';
    const intensity = (activity / 100) * (0.5 + Math.sin(Date.now() / 200 + index) * 0.5);
    const blur = 4 + (activity / 20) * pulseScale;
    const spread = (activity / 40);
    return `0 0 ${blur}px ${spread}px rgba(34, 211, 238, ${intensity})`;
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-black/60 backdrop-blur-md w-72 h-full">
      <h2 className="font-orbitron text-sm tracking-widest text-cyan-500 uppercase border-b border-cyan-500/30 pb-2">
        Telemetria Core
      </h2>

      <div className="space-y-4">
        {/* Battery */}
        <div>
          <div className="flex justify-between text-[10px] mb-1 uppercase tracking-tighter">
            <span>Power Core</span>
            <span>{status.battery.toFixed(1)}%</span>
          </div>
          <div className="h-1 w-full bg-cyan-950 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-400 transition-all duration-1000" 
              style={{ width: `${status.battery}%` }}
            />
          </div>
        </div>

        {/* Proximity */}
        <div>
          <div className="flex justify-between text-[10px] mb-1 uppercase tracking-tighter">
            <span>Proximity</span>
            <span>{status.distance}cm</span>
          </div>
          <div className="h-1 w-full bg-cyan-950 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000" 
              style={{ width: `${Math.min(100, (status.distance / 200) * 100)}%` }}
            />
          </div>
        </div>

        {/* Network */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-tighter">Uplink Status</span>
          <div className={`w-2 h-2 rounded-full ${status.online ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 animate-pulse'}`} />
        </div>

        {/* Neural Net Activity */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-tighter">Neural Activity</span>
            <span className={`text-[8px] font-bold transition-colors duration-300 ${status.wifi ? (activity > 80 ? 'text-white' : 'text-cyan-400') : 'text-cyan-900'}`}>
              {status.wifi ? `${Math.floor(activity)}%` : 'OFFLINE'}
            </span>
          </div>
          <div className="flex items-end gap-1.5 h-10 px-1 border-l border-b border-cyan-500/10">
             {[1,2,3,4,5,6,7,8].map(i => {
               const offset = i * (Math.PI / 4);
               const wave = Math.sin(Date.now() / 400 + offset);
               const height = Math.min(100, Math.max(8, status.wifi ? (activity * 0.7) + (wave * 20) : 10));
               return (
                 <div 
                   key={i} 
                   style={{ height: `${height}%`, boxShadow: getGlowStyle(i) }}
                   className={`flex-1 rounded-t-[1px] ${getActivityColor()} transition-all duration-300`} 
                 />
               );
             })}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-cyan-500/20">
        <div className="text-[8px] opacity-40 uppercase mb-2">Protocolo_Final</div>
        <div className="text-[10px] text-cyan-200 font-mono break-all line-clamp-2">
          {status.lastCommand}
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;
