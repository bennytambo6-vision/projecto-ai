
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, GenerateContentResponse } from '@google/genai';
import { RobotCommand, VoiceSettings, AppTab } from '../types';
import { RobotService } from './robotService';
import { SYSTEM_PROMPT } from '../constants.tsx';

// Audio Helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export interface GroundingLink {
  title: string;
  uri: string;
  source: 'maps' | 'search';
}

export interface UICommand {
  type: 'navigate' | 'deactivate';
  target?: AppTab;
}

export class GeminiService {
  private ai: any;
  private sessionPromise: Promise<any> | null = null;
  private audioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private robotService = RobotService.getInstance();

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async searchWeb(query: string): Promise<{ text: string; links: GroundingLink[] }> {
    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const links: GroundingLink[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
      if (chunk.web) {
        return { title: chunk.web.title, uri: chunk.web.uri, source: 'search' };
      }
      return null;
    }).filter(Boolean) || [];

    return { text: response.text || '', links };
  }

  async connect(
    callbacks: {
      onMessage?: (text: string, type: 'user' | 'ai') => void;
      onStatusChange?: (status: string) => void;
      onGroundingLinks?: (links: GroundingLink[]) => void;
      onUICommand?: (cmd: UICommand) => void;
    },
    settings: VoiceSettings = { voiceName: 'Kore', speed: 1.0 }
  ) {
    if (this.sessionPromise) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    const robotControlTool: FunctionDeclaration = {
      name: 'controlRobot',
      parameters: {
        type: Type.OBJECT,
        description: 'Control the robot movement.',
        properties: {
          command: {
            type: Type.STRING,
            enum: Object.values(RobotCommand),
          },
        },
        required: ['command'],
      },
    };

    const navigateUITool: FunctionDeclaration = {
      name: 'navigateUI',
      parameters: {
        type: Type.OBJECT,
        description: 'Navigate to a specific tab in the UI.',
        properties: {
          tab: {
            type: Type.STRING,
            enum: ['intelligence', 'navigation', 'diagnostic', 'search', 'settings'],
          },
        },
        required: ['tab'],
      },
    };

    const deactivateSystemTool: FunctionDeclaration = {
      name: 'deactivateSystem',
      parameters: {
        type: Type.OBJECT,
        description: 'Deactivates JAQUES and returns to the boot screen.',
        properties: {},
      },
    };

    const webSearchTool: FunctionDeclaration = {
      name: 'webSearch',
      parameters: {
        type: Type.OBJECT,
        description: 'Search the internet.',
        properties: {
          query: { type: Type.STRING },
        },
        required: ['query'],
      },
    };

    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          this.startMicStream();
          callbacks.onStatusChange?.('Conectado');
          
          this.sessionPromise?.then(session => {
            if (session) {
              session.sendRealtimeInput({ 
                text: "INÍCIO DE SESSÃO: Diga exatamente 'Olá, como posso ajudar?' de forma imediata e breve." 
              });
            }
          });
        },
        onmessage: async (message: LiveServerMessage) => {
          const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64 && this.outputAudioContext && this.outputAudioContext.state !== 'closed') {
            const buffer = await decodeAudioData(decode(audioBase64), this.outputAudioContext, 24000, 1);
            const source = this.outputAudioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.outputAudioContext.destination);
            
            this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime + 0.02);
            source.start(this.nextStartTime);
            this.nextStartTime += buffer.duration;
            this.sources.add(source);
            source.onended = () => this.sources.delete(source);
          }

          if (message.serverContent?.outputTranscription) {
            callbacks.onMessage?.(message.serverContent.outputTranscription.text, 'ai');
          }
          if (message.serverContent?.inputTranscription) {
            callbacks.onMessage?.(message.serverContent.inputTranscription.text, 'user');
          }

          if (message.toolCall) {
            for (const fc of message.toolCall.functionCalls) {
              const session = await this.sessionPromise;
              
              if (fc.name === 'controlRobot') {
                const cmd = (fc.args as any).command as RobotCommand;
                await this.robotService.sendCommand(cmd);
                if (session) {
                  session.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result: 'ok' } }
                  });
                }
              } else if (fc.name === 'navigateUI') {
                const tab = (fc.args as any).tab as AppTab;
                callbacks.onUICommand?.({ type: 'navigate', target: tab });
                if (session) {
                  session.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result: 'ui_navigated' } }
                  });
                }
              } else if (fc.name === 'deactivateSystem') {
                callbacks.onUICommand?.({ type: 'deactivate' });
                if (session) {
                  session.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result: 'system_deactivated' } }
                  });
                }
              } else if (fc.name === 'webSearch') {
                const query = (fc.args as any).query;
                const searchResult = await this.searchWeb(query);
                if (session) {
                  session.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result: searchResult.text } }
                  });
                }
              }
            }
          }

          if (message.serverContent?.interrupted) {
            this.stopAllAudio();
          }
        },
        onerror: (e: any) => console.error('[Gemini] Error:', e),
        onclose: () => {
          this.sessionPromise = null;
          callbacks.onStatusChange?.('Desconectado');
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: SYSTEM_PROMPT,
        thinkingConfig: { thinkingBudget: 0 },
        tools: [{ functionDeclarations: [robotControlTool, webSearchTool, navigateUITool, deactivateSystemTool] }],
        outputAudioTranscription: {},
        inputAudioTranscription: {},
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: settings.voiceName } }
        }
      }
    });

    return this.sessionPromise;
  }

  private stopAllAudio() {
    this.sources.forEach(s => { try { s.stop(); } catch (e) {} });
    this.sources.clear();
    this.nextStartTime = 0;
  }

  private async startMicStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!this.audioContext || this.audioContext.state === 'closed') return;
      
      const source = this.audioContext.createMediaStreamSource(stream);
      const processor = this.audioContext.createScriptProcessor(2048, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!this.sessionPromise) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const l = inputData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
          int16[i] = inputData[i] * 32768;
        }
        const pcmData = encode(new Uint8Array(int16.buffer));
        this.sessionPromise.then(session => {
          if (session) {
            session.sendRealtimeInput({
              media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' }
            });
          }
        });
      };

      source.connect(processor);
      processor.connect(this.audioContext.destination);
    } catch (err) {
      console.error('Mic error', err);
    }
  }

  async stop() {
    this.stopAllAudio();
    if (this.sessionPromise) {
      const session = await this.sessionPromise;
      if (session) { try { session.close(); } catch (e) {} }
      this.sessionPromise = null;
    }
    if (this.audioContext) { try { await this.audioContext.close(); } catch (e) {} this.audioContext = null; }
    if (this.outputAudioContext) { try { await this.outputAudioContext.close(); } catch (e) {} this.outputAudioContext = null; }
  }
}
