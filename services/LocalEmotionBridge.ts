import { Emotion } from '../types';

type EmotionCallback = (data: { emotion: Emotion; inner_state: number }) => void;

class LocalEmotionBridge {
  private static instance: LocalEmotionBridge;
  private socket: WebSocket | null = null;
  private subscribers: Set<EmotionCallback> = new Set();
  private reconnectInterval: number = 5000;
  private currentEmotion: Emotion = Emotion.NEUTRAL;
  private currentInnerState: number = 0.5;

  private constructor() {
    this.connect();
  }

  public static getInstance(): LocalEmotionBridge {
    if (!LocalEmotionBridge.instance) {
      LocalEmotionBridge.instance = new LocalEmotionBridge();
    }
    return LocalEmotionBridge.instance;
  }

  private connect() {
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8765';
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('[LocalBridge] Connected to local emotion bridge');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Map Python emotions to our Enum (Python case is usually lowercase)
          const rawEmotion = data.emotion?.toUpperCase();
          const mappedEmotion = Object.values(Emotion).includes(rawEmotion as Emotion)
            ? (rawEmotion as Emotion)
            : Emotion.NEUTRAL;

          this.currentEmotion = mappedEmotion;
          this.currentInnerState = data.inner_state ?? 0.5;

          const update = {
            emotion: this.currentEmotion,
            inner_state: this.currentInnerState
          };

          this.subscribers.forEach(callback => callback(update));
        } catch (e) {
          console.error('[LocalBridge] Failed to parse message', e);
        }
      };

      this.socket.onclose = () => {
        console.log('[LocalBridge] Connection closed. Reconnecting...');
        setTimeout(() => this.connect(), this.reconnectInterval);
      };

      this.socket.onerror = (err) => {
        console.error('[LocalBridge] WebSocket Error', err);
        this.socket?.close();
      };
    } catch (e) {
      console.error('[LocalBridge] Connection failed', e);
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  public subscribe(callback: EmotionCallback): () => void {
    this.subscribers.add(callback);
    // Send current state immediately
    callback({ emotion: this.currentEmotion, inner_state: this.currentInnerState });
    return () => this.subscribers.delete(callback);
  }

  public getLatestState() {
    return {
      emotion: this.currentEmotion,
      inner_state: this.currentInnerState
    };
  }

  public sendFrame(base64Image: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ image: base64Image }));
    }
  }
}

export const localEmotionBridge = LocalEmotionBridge.getInstance();
