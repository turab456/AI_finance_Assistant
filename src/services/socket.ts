import { io, Socket } from 'socket.io-client';
// @ts-ignore
import { API_URL } from '@env';

// Use same IP as API_BASE_URL
const SOCKET_URL = API_URL;
console.log(SOCKET_URL)
class SocketService {
  private socket: Socket | null = null;

  connect(userId: string | number = 1) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      query: { user_id: userId }
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.socket?.emit('join', userId.toString());
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('Disconnected from socket server:', reason);
    });

    this.socket.on('error', (err) => {
      console.error('Socket connection error:', err);
    });
  }

  on(eventName: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    } else {
      console.warn(`Attempted to listen for ${eventName} before socket connection...`);
    }
  }

  off(eventName: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }
  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.log('⚠️ Socket not initialized');
    }
  }
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const socketService = new SocketService();
export default socketService;
