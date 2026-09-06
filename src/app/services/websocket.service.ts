import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messagesSubject = new Subject<any>();

  connect(playerId: string): void {
    if (this.socket) {
      this.socket.close();
    }

    const host = window.location.hostname || 'localhost';
    const wsUrl = `ws://${host}:8081/ws?player_id=${playerId}`;
    
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected to World Service');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messagesSubject.next(data);
      } catch (err) {
        console.error('Failed parsing WS message', err);
      }
    };

    this.socket.onerror = (err) => {
      console.warn('WebSocket connection notice:', err);
    };
  }

  sendMove(mapId: string, x: number, y: number): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'move',
        payload: { map_id: mapId, x, y }
      }));
    }
  }

  getMessages(): Observable<any> {
    return this.messagesSubject.asObservable();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
