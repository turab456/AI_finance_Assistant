import { io, Socket } from 'socket.io-client';

// Use same IP as API_BASE_URL
const SOCKET_URL = 'http://10.0.2.2:3000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
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

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const socketService = new SocketService();
export default socketService;
