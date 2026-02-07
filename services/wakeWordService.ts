
export class WakeWordService {
  private recognition: any;
  private isListening: boolean = false;
  private onWakeWord: () => void;
  private onDeactivate: () => void;
  private onCommand?: (command: string) => void;

  constructor(
    onWakeWord: () => void, 
    onDeactivate: () => void,
    onCommand?: (command: string) => void
  ) {
    this.onWakeWord = onWakeWord;
    this.onDeactivate = onDeactivate;
    this.onCommand = onCommand;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'pt-BR';

      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.toLowerCase();
            console.log('[WakeWord] Heard:', transcript);
            
            // Ativação Geral
            if (transcript.includes('jaques') || transcript.includes('jacques') || transcript.includes('jack') || transcript.includes('ativar')) {
              this.onWakeWord();
            }
            
            // Menu / Categorias
            if (transcript.includes('categorias') || transcript.includes('abrir menu') || transcript.includes('mostrar menu')) {
              this.onCommand?.('open_menu');
            }

            // Navegação por voz específica
            if (transcript.includes('inteligência') || transcript.includes('conversa')) {
              this.onCommand?.('nav_intelligence');
            }
            if (transcript.includes('navegação') || transcript.includes('movimento')) {
              this.onCommand?.('nav_navigation');
            }
            if (transcript.includes('diagnóstico') || transcript.includes('status')) {
              this.onCommand?.('nav_diagnostic');
            }
            if (transcript.includes('pesquisa') || transcript.includes('busca')) {
              this.onCommand?.('nav_search');
            }
            if (transcript.includes('protocolos') || transcript.includes('configurações')) {
              this.onCommand?.('nav_settings');
            }
            
            // Desativação
            if (
              transcript.includes('desativar') || 
              transcript.includes('encerrar sistema') || 
              transcript.includes('desligar') ||
              transcript.includes('voltar ao início') ||
              transcript.includes('tela inicial')
            ) {
              this.onDeactivate();
            }
          }
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            console.warn('[WakeWord] Restart failed, retrying...', e);
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('[WakeWord] Error:', event.error);
        if (event.error === 'not-allowed') {
          this.isListening = false;
        }
      };
    }
  }

  start() {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      try {
        this.recognition.start();
        console.log('[WakeWord] Started passive listening...');
      } catch (e) {
        console.error('[WakeWord] Start failed:', e);
      }
    }
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('[WakeWord] Stop error:', e);
      }
      console.log('[WakeWord] Stopped passive listening.');
    }
  }
}
