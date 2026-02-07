
import { RobotCommand, RobotStatus } from '../types';
import { ROBOT_IP } from '../constants.tsx';

export class RobotService {
  private static instance: RobotService;
  private status: RobotStatus = {
    battery: 85,
    wifi: true,
    online: true,
    distance: 120,
    lastCommand: 'IDLE'
  };

  static getInstance() {
    if (!RobotService.instance) {
      RobotService.instance = new RobotService();
    }
    return RobotService.instance;
  }

  async sendCommand(command: RobotCommand): Promise<boolean> {
    console.log(`[Robot] Executing: ${command}`);
    this.status.lastCommand = command;
    
    // In a real scenario, we'd fetch to the ESP32 IP
    // Browsers often block local HTTP from HTTPS, so we simulate and handle errors
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`http://${ROBOT_IP}/${command}`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors' // Common for ESP32 simple servers
      });
      
      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      console.warn("Could not reach ESP32. Robot might be offline or blocked by CORS. Simulating success for UI demo.", error);
      return true; 
    }
  }

  getStatus(): RobotStatus {
    // Randomize some data for visual effect
    return {
      ...this.status,
      battery: Math.max(0, this.status.battery - (Math.random() * 0.01)),
      distance: Math.floor(100 + Math.random() * 50)
    };
  }
}
