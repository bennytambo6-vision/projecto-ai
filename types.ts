
export enum RobotCommand {
  FORWARD = 'CMD_MOVE_FORWARD',
  STOP = 'CMD_STOP',
  FOLLOW = 'CMD_FOLLOW',
  HOME = 'CMD_HOME',
  BATH = 'CMD_BATH',
  RESTAURANT = 'CMD_RESTAURANT',
  GATE = 'CMD_GATE',
}

export interface RobotStatus {
  battery: number;
  wifi: boolean;
  online: boolean;
  distance: number;
  lastCommand: string;
}

export interface Destination {
  id: string;
  name: string;
  icon: string;
  command: RobotCommand;
}

export type InteractionState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR';

export type AppTab = 'dashboard' | 'intelligence' | 'navigation' | 'diagnostic' | 'search' | 'settings';

export interface VoiceSettings {
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  speed: number;
}

export interface ModuleCategory {
  id: AppTab;
  label: string;
  description: string;
  icon: string;
  color: string;
}
