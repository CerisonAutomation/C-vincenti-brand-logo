/**
 * Voice & Spatial Interaction System
 * Advanced voice recognition, spatial audio, and 3D interaction capabilities
 */

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
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();

      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        this.handleVoiceResult(event);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.notifyListeners('recognition-ended', { success: true });
      };

      this.recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        this.notifyListeners('recognition-error', { error: event.error });
      };
    }
  }

  addCommand(command: VoiceCommand): void {
    this.commands.set(command.keyword.toLowerCase(), command);
  }

  startListening(): void {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.recognition.start();
      this.notifyListeners('recognition-started', { success: true });
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  subscribe(event: string, callback: (result: VoiceResult) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private handleVoiceResult(event: SpeechRecognitionEvent): void {
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript.toLowerCase().trim();
    const confidence = result[0].confidence;

    const voiceResult: VoiceResult = {
      transcript,
      confidence,
      timestamp: Date.now(),
      isFinal: result.isFinal
    };

    // Check for commands
    for (const [keyword, command] of this.commands) {
      if (transcript.includes(keyword)) {
        command.action(transcript, confidence);
        voiceResult.command = command.keyword;
        break;
      }
    }

    this.notifyListeners('voice-result', voiceResult);
  }

  private notifyListeners(event: string, data: any): void {
    const listeners = this.listeners.get(event);
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
  private pannerNodes = new Map<string, PannerNode>();
  private audioSources = new Map<string, AudioBufferSourceNode>();
  private listener: AudioListener | null = null;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.listener = this.audioContext.listener;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  createSpatialSound(id: string, position: Vector3, audioBuffer: AudioBuffer): void {
    if (!this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    const panner = this.audioContext.createPanner();
    panner.setPosition(position.x, position.y, position.z);
    panner.distanceModel = 'inverse';
    panner.rolloffFactor = 1;
    panner.refDistance = 1;
    panner.maxDistance = 100;

    source.connect(panner);
    panner.connect(this.audioContext.destination);

    this.pannerNodes.set(id, panner);
    this.audioSources.set(id, source);

    source.start();
  }

  updateSoundPosition(id: string, position: Vector3): void {
    const panner = this.pannerNodes.get(id);
    if (panner) {
      panner.setPosition(position.x, position.y, position.z);
    }
  }

  updateListenerPosition(position: Vector3, forward: Vector3, up: Vector3): void {
    if (this.listener) {
      this.listener.setPosition(position.x, position.y, position.z);
      this.listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
    }
  }

  stopSound(id: string): void {
    const source = this.audioSources.get(id);
    if (source) {
      source.stop();
      source.disconnect();
      this.audioSources.delete(id);
      this.pannerNodes.delete(id);
    }
  }

  loadAudio(url: string): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      if (!this.audioContext) {
        reject(new Error('Audio context not initialized'));
        return;
      }

      fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => this.audioContext!.decodeAudioData(arrayBuffer))
        .then(audioBuffer => resolve(audioBuffer))
        .catch(error => reject(error));
    });
  }
}

// 3D Interaction System
export class ThreeDInteractionSystem {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private raycaster: THREE.Raycaster | null = null;
  private interactableObjects = new Map<string, THREE.Object3D>();
  private gestureThreshold = 0.1;

  constructor(container: HTMLElement) {
    this.initialize3D(container);
  }

  private initialize3D(container: HTMLElement): void {
    try {
      // Import Three.js dynamically
      import('three').then((THREE) => {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.raycaster = new THREE.Raycaster();

        container.appendChild(this.renderer.domElement);

        // Setup interaction events
        this.setupInteractionEvents();

        // Start render loop
        this.renderLoop();
      });
    } catch (error) {
      console.error('Failed to initialize 3D system:', error);
    }
  }

  addObject(id: string, object: THREE.Object3D): void {
    if (this.scene) {
      this.scene.add(object);
      this.interactableObjects.set(id, object);
    }
  }

  removeObject(id: string): void {
    if (this.scene) {
      const object = this.interactableObjects.get(id);
      if (object) {
        this.scene.remove(object);
        this.interactableObjects.delete(id);
      }
    }
  }

  updateObjectPosition(id: string, position: Vector3): void {
    const object = this.interactableObjects.get(id);
    if (object) {
      object.position.set(position.x, position.y, position.z);
    }
  }

  private setupInteractionEvents(): void {
    if (!this.renderer || !this.raycaster) return;

    this.renderer.domElement.addEventListener('click', (event) => {
      this.handleMouseClick(event);
    });

    this.renderer.domElement.addEventListener('mousemove', (event) => {
      this.handleMouseMove(event);
    });

    // Touch events for mobile
    this.renderer.domElement.addEventListener('touchstart', (event) => {
      this.handleTouchStart(event);
    });

    this.renderer.domElement.addEventListener('touchmove', (event) => {
      this.handleTouchMove(event);
    });
  }

  private handleMouseClick(event: MouseEvent): void {
    if (!this.camera || !this.raycaster) return;

    const mouse = new (window as any).THREE.Vector2();
    mouse.x = (event.clientX / this.renderer!.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / this.renderer!.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(Array.from(this.interactableObjects.values()));

    if (intersects.length > 0) {
      const object = intersects[0].object;
      this.triggerInteraction('click', object);
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.camera || !this.raycaster) return;

    const mouse = new (window as any).THREE.Vector2();
    mouse.x = (event.clientX / this.renderer!.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / this.renderer!.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(Array.from(this.interactableObjects.values()));

    if (intersects.length > 0) {
      const object = intersects[0].object;
      this.triggerInteraction('hover', object);
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    // Handle touch interactions
  }

  private handleTouchMove(event: TouchEvent): void {
    // Handle touch gestures
  }

  private triggerInteraction(type: string, object: THREE.Object3D): void {
    // Trigger interaction events
    log.debug('3D interaction triggered', { type, objectName: object.name });
  }

  private renderLoop(): void {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(() => this.renderLoop());
    }
  }
}

// Gesture Recognition System
export class GestureRecognitionSystem {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private gestureThresholds = {
    swipe: 50,
    pinch: 20,
    rotate: 0.5
  };

  constructor() {
    this.initializeCamera();
  }

  private async initializeCamera(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = stream;
      this.videoElement.play();

      this.canvasElement = document.createElement('canvas');
    } catch (error) {
      console.error('Failed to access camera:', error);
    }
  }

  startGestureRecognition(): void {
    if (this.videoElement && this.canvasElement) {
      this.videoElement.addEventListener('loadeddata', () => {
        this.processVideoFrame();
      });
    }
  }

  stopGestureRecognition(): void {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
    }
  }

  private processVideoFrame(): void {
    if (!this.videoElement || !this.canvasElement) return;

    const canvas = this.canvasElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Process video frame for gesture recognition
    // This would integrate with a gesture recognition library like MediaPipe

    requestAnimationFrame(() => this.processVideoFrame());
  }

  onGesture(callback: (gesture: GestureResult) => void): void {
    // Set up gesture detection callback
  }
}

// Types
interface VoiceCommand {
  keyword: string;
  action: (transcript: string, confidence: number) => void;
}

interface VoiceResult {
  transcript: string;
  confidence: number;
  timestamp: number;
  isFinal: boolean;
  command?: string;
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface GestureResult {
  type: 'swipe' | 'pinch' | 'rotate' | 'tap';
  direction?: 'left' | 'right' | 'up' | 'down';
  magnitude: number;
  timestamp: number;
}

export default {
  VoiceRecognitionSystem,
  SpatialAudioSystem,
  ThreeDInteractionSystem,
  GestureRecognitionSystem
};