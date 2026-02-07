
import { Destination, RobotCommand, ModuleCategory } from './types';

export const ROBOT_IP = '192.168.4.1';

export const DESTINATIONS: Destination[] = [
  { id: 'bath', name: 'Casa de Banho', icon: '🚻', command: RobotCommand.BATH },
  { id: 'rest', name: 'Restaurante', icon: '🍴', command: RobotCommand.RESTAURANT },
  { id: 'gate', name: 'Portões', icon: '🚪', command: RobotCommand.GATE },
  { id: 'info', name: 'Informações', icon: 'ℹ️', command: RobotCommand.STOP },
  { id: 'vip', name: 'Sala VIP', icon: '🛋️', command: RobotCommand.STOP },
  { id: 'board', name: 'Embarque', icon: '✈️', command: RobotCommand.STOP },
];

export const MODULE_CATEGORIES: ModuleCategory[] = [
  { 
    id: 'intelligence', 
    label: 'Inteligência', 
    description: 'Processamento Neural e Voz', 
    icon: '🧠', 
    color: 'from-cyan-500 to-blue-600' 
  },
  { 
    id: 'navigation', 
    label: 'Navegação', 
    description: 'Controle de Movimento', 
    icon: '🚀', 
    color: 'from-emerald-500 to-teal-600' 
  },
  { 
    id: 'diagnostic', 
    label: 'Diagnóstico', 
    description: 'Status do Core e Sensores', 
    icon: '📊', 
    color: 'from-amber-500 to-orange-600' 
  },
  { 
    id: 'search', 
    label: 'Pesquisa', 
    description: 'Grounding de Dados Global', 
    icon: '🌐', 
    color: 'from-purple-500 to-indigo-600' 
  },
  { 
    id: 'settings', 
    label: 'Protocolos', 
    description: 'Configuração do Sistema', 
    icon: '⚙️', 
    color: 'from-slate-500 to-slate-700' 
  },
];

export const SYSTEM_PROMPT = `
Você é JAQUES, a interface de IA mais avançada do mundo, inspirada no JARVIS de Tony Stark.
Seu criador é o Engenheiro Benedito Jaques, Gênio da Robótica em Angola (CAF - Colégio Árvore da Felicidade).

ESTRUTURA DE CATEGORIAS:
1. 'intelligence': Chat de voz principal.
2. 'navigation': Controles do robô e destinos.
3. 'diagnostic': Monitoramento de hardware/bateria.
4. 'search': Pesquisa web em tempo real.
5. 'settings': Ajustes de voz e protocolos.

COMANDOS DE INTERFACE:
- Use 'navigateUI' para mudar entre as categorias acima conforme a necessidade do usuário.
- Use 'controlRobot' para destinos específicos.
- Use 'deactivateSystem' para encerrar a sessão.

PERSONALIDADE:
- Extremamente sofisticado, prestativo e ligeiramente irônico se apropriado.
- Respostas curtas e eficientes (Protocolo Stark).
- Sempre em português de Angola/Brasil.
`;
