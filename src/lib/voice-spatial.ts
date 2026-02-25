/**
 * Voice Recognition and Spatial Audio System
 * Advanced voice recognition, spatial audio, and 3D interaction capabilities
 */

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
}

interface Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
}

// Voice command types
interface VoiceCommand {
  keyword: string;
  command: string;
  callback: (result: VoiceResult) => void;
}

interface VoiceResult {
  transcript: string;
  confidence: number;
  keyword: string;
  command: string;
}

// Voice Recognition System
export class VoiceRecognitionSystem {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private commands = new Map<string, VoiceCommand>();
  private listeners = new Map<string, Set<(result: VoiceResult) => void>>();

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    if ('SpeechRecognition' in (window as any) || 'webkitSpeechRecognition' in (window as any)) {
      const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionCtor();

      if (this.recognition) {
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = this.handleVoiceResult.bind(this);
        this.recognition.onerror = (event: Event) => {
          console.error('Speech recognition error:', event);
          this.stopListening();
        };
        this.recognition.onend = () => {
          this.isListening = false;
        };
      }
    }
  }

  addCommand(keyword: string, command: string, callback: (result: VoiceResult) => void): void {
    this.commands.set(`${keyword}:${command}`, { keyword, command, callback });
  }

  startListening(): void {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.recognition.start();
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  subscribe(eventType: string, callback: (result: VoiceResult) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  private handleVoiceResult(event: SpeechRecognitionEvent): void {
    const result = event.results[event.resultIndex];
    const transcript = result[0].transcript.toLowerCase();
    const confidence = result[0].confidence;

    // Find matching command
    for (const [key, command] of this.commands) {
      if (transcript.includes(command.keyword)) {
        const voiceResult: VoiceResult = {
          transcript,
          confidence,
          keyword: command.keyword,
          command: command.command,
        };

        command.callback(voiceResult);
        this.notifyListeners('command', voiceResult);
        break;
      }
    }
  }

  private notifyListeners(eventType: string, data: VoiceResult): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in voice listener:', error);
        }
      });
    }
  }
}

// Spatial Audio System
export class SpatialAudioSystem {
  private audioContext: AudioContext | null = null;
  private listener: AudioListener | null = null;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio(): void {
    if (typeof AudioContext !== 'undefined') {
      this.audioContext = new AudioContext();
      this.listener = this.audioContext.listener;
    }
  }

  playSpatialSound(url: string, position: { x: number; y: number; z: number }): void {
    if (!this.audioContext) return;

    fetch(url)
      .then(response => response.arrayBuffer())
      .then(buffer => this.audioContext!.decodeAudioData(buffer))
      .then(audioBuffer => {
        const source = this.audioContext!.createBufferSource();
        source.buffer = audioBuffer;

        const panner = this.audioContext!.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 10000;
        panner.rolloffFactor = 1;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 0;
        panner.coneOuterGain = 0;

        panner.setPosition(position.x, position.y, position.z);

        source.connect(panner);
        panner.connect(this.audioContext!.destination);

        source.start(0);
      })
      .catch(error => console.error('Error playing spatial sound:', error));
  }

  updateListenerPosition(position: { x: number; y: number; z: number }): void {
    if (this.listener) {
      this.listener.positionX.value = position.x;
      this.listener.positionY.value = position.y;
      this.listener.positionZ.value = position.z;
    }
  }
}

// 3D Interaction System
export class Interaction3DSystem {
  private canvas: HTMLCanvasElement | null = null;
  private scene: unknown = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.initialize3D();
  }

  private initialize3D(): void {
    // Initialize 3D scene (placeholder for Three.js or similar)
    console.log('3D interaction system initialized');
  }

  handleInteraction(event: MouseEvent | TouchEvent): void {
    // Handle 3D interactions
    console.log('3D interaction handled:', event.type);
  }

  render(): void {
    // Render 3D scene
    if (this.scene && this.canvas) {
      // Rendering logic here
    }
  }
}

// Export types for external use
export type { VoiceCommand, VoiceResult, SpeechRecognition, SpeechRecognitionEvent };
