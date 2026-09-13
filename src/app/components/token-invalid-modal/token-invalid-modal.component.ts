import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-token-invalid-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="showModal$ | async">
      <div class="modal-card">
        <button class="btn-close" (click)="close()">✕</button>

        <div class="icon-warning">⚠️</div>
        <h2 class="title">Session Expired</h2>
        <p class="description">
          Your authentication token is invalid or has expired. Please log in again to continue your adventure.
        </p>

        <div class="action-buttons">
          <button class="btn-login" (click)="openLogin()">
            🔐 Open Login Modal
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; inset: 0; z-index: 1100;
      background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(10px);
      display: flex; justify-content: center; align-items: center;
    }
    .modal-card {
      position: relative; width: 380px; padding: 28px;
      background: rgba(30, 41, 59, 0.95); border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6); color: #f8fafc;
      text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;
    }
    .btn-close {
      position: absolute; top: 16px; right: 16px; background: none; border: none;
      color: #94a3b8; font-size: 18px; cursor: pointer;
    }
    .icon-warning { font-size: 40px; }
    .title { font-size: 20px; font-weight: 800; color: #f87171; margin: 0; }
    .description { font-size: 13px; color: #cbd5e1; margin: 0; line-height: 1.5; }
    .action-buttons { width: 100%; margin-top: 12px; }
    .btn-login {
      width: 100%; padding: 12px; border: none; border-radius: 10px;
      background: linear-gradient(135deg, #0284c7, #2563eb); color: white;
      font-size: 14px; font-weight: 700; cursor: pointer;
    }
    .btn-login:hover { opacity: 0.9; }
  `]
})
export class TokenInvalidModalComponent {
  showModal$ = this.state.showInvalidTokenModal$;

  constructor(private state: GameStateService) {}

  close() {
    this.state.showInvalidTokenModal$.next(false);
  }

  openLogin() {
    this.close();
    this.state.showAuthModal$.next(true);
  }
}
