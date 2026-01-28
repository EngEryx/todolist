import Peer, { DataConnection } from 'peerjs';
import { Todo } from './storage';

export type SyncMessage =
  | { type: 'sync'; todos: Todo[] }
  | { type: 'add'; todo: Todo }
  | { type: 'toggle'; id: string; completed: boolean; timestamp: number }
  | { type: 'delete'; id: string }
  | { type: 'clear-completed'; timestamp: number };

type MessageHandler = (message: SyncMessage) => void;
type StatusHandler = (status: ConnectionStatus) => void;

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const ROOM_CODE_LENGTH = 6;
const PEER_PREFIX = 'void-todo-';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getPeerId(code: string): string {
  return PEER_PREFIX + code.toUpperCase();
}

class P2PSync {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private roomCode: string | null = null;
  private isHost: boolean = false;
  private onMessage: MessageHandler | null = null;
  private onStatusChange: StatusHandler | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  setMessageHandler(handler: MessageHandler) {
    this.onMessage = handler;
  }

  setStatusHandler(handler: StatusHandler) {
    this.onStatusChange = handler;
  }

  private updateStatus(status: ConnectionStatus) {
    this.onStatusChange?.(status);
  }

  async createRoom(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.roomCode = generateRoomCode();
      this.isHost = true;
      const peerId = getPeerId(this.roomCode);

      this.updateStatus('connecting');

      this.peer = new Peer(peerId, {
        debug: 0,
      });

      this.peer.on('open', () => {
        this.updateStatus('disconnected'); // Waiting for peer
        resolve(this.roomCode!);
      });

      this.peer.on('connection', (conn) => {
        this.handleConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        if (err.type === 'unavailable-id') {
          // Room code taken, try again
          this.roomCode = generateRoomCode();
          this.peer?.destroy();
          this.createRoom().then(resolve).catch(reject);
        } else {
          this.updateStatus('error');
          reject(err);
        }
      });

      this.peer.on('disconnected', () => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          this.peer?.reconnect();
        }
      });
    });
  }

  async joinRoom(code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.roomCode = code.toUpperCase();
      this.isHost = false;
      const hostPeerId = getPeerId(this.roomCode);

      this.updateStatus('connecting');

      this.peer = new Peer({
        debug: 0,
      });

      this.peer.on('open', () => {
        const conn = this.peer!.connect(hostPeerId, {
          reliable: true,
        });

        conn.on('open', () => {
          this.handleConnection(conn);
          resolve();
        });

        conn.on('error', (err) => {
          console.error('Connection error:', err);
          this.updateStatus('error');
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        this.updateStatus('error');
        reject(err);
      });

      // Timeout for connection
      setTimeout(() => {
        if (!this.connection) {
          this.updateStatus('error');
          reject(new Error('Connection timeout'));
        }
      }, 15000);
    });
  }

  private handleConnection(conn: DataConnection) {
    this.connection = conn;
    this.reconnectAttempts = 0;

    conn.on('open', () => {
      this.updateStatus('connected');
    });

    conn.on('data', (data) => {
      const message = data as SyncMessage;
      this.onMessage?.(message);
    });

    conn.on('close', () => {
      this.connection = null;
      this.updateStatus('disconnected');
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      this.updateStatus('error');
    });

    // If already open
    if (conn.open) {
      this.updateStatus('connected');
    }
  }

  send(message: SyncMessage) {
    if (this.connection?.open) {
      this.connection.send(message);
    }
  }

  sendTodos(todos: Todo[]) {
    this.send({ type: 'sync', todos });
  }

  sendAdd(todo: Todo) {
    this.send({ type: 'add', todo });
  }

  sendToggle(id: string, completed: boolean) {
    this.send({ type: 'toggle', id, completed, timestamp: Date.now() });
  }

  sendDelete(id: string) {
    this.send({ type: 'delete', id });
  }

  sendClearCompleted() {
    this.send({ type: 'clear-completed', timestamp: Date.now() });
  }

  disconnect() {
    this.connection?.close();
    this.peer?.destroy();
    this.connection = null;
    this.peer = null;
    this.roomCode = null;
    this.isHost = false;
    this.updateStatus('disconnected');
  }

  getRoomCode(): string | null {
    return this.roomCode;
  }

  getIsHost(): boolean {
    return this.isHost;
  }

  isConnected(): boolean {
    return this.connection?.open ?? false;
  }
}

// Singleton instance
export const p2pSync = new P2PSync();
