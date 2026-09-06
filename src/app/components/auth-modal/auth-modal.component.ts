import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="showModal$ | async">
      <div class="modal-card">
        <button class="btn-close" (click)="close()">✕</button>

        <h2 class="title">{{ isLoginMode ? 'Welcome Back, Traveler' : 'Join the Guild' }}</h2>

        <div class="form-group">
          <label>Username</label>
          <input type="text" [(ngModel)]="username" placeholder="Hero username" />
        </div>

        <div class="form-group" *ngIf="!isLoginMode">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" placeholder="hero@guild.com" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" [(ngModel)]="password" placeholder="••••••••" />
        </div>

        <div class="error-msg" *ngIf="errorMessage">{{ errorMessage }}</div>

        <button class="btn-submit" (click)="submit()">
          {{ isLoginMode ? 'Enter Realm' : 'Create Character' }}
        </button>

        <div class="mode-switch">
          <span>{{ isLoginMode ? "Don't have a character?" : 'Already registered?' }}</span>
          <button (click)="isLoginMode = !isLoginMode" class="btn-link">
            {{ isLoginMode ? 'Register Here' : 'Login Here' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px);
      display: flex; justify-content: center; align-items: center;
    }
    .modal-card {
      position: relative; width: 360px; padding: 32px;
      background: rgba(30, 41, 59, 0.95); border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); color: #f8fafc;
    }
    .btn-close {
      position: absolute; top: 16px; right: 16px; background: none; border: none;
      color: #94a3b8; font-size: 18px; cursor: pointer;
    }
    .title { text-align: center; font-size: 20px; font-weight: 800; color: #38bdf8; margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 12px; font-weight: 600; color: #cbd5e1; }
    .form-group input {
      padding: 10px 14px; background: #0f172a; border: 1px solid #334155;
      border-radius: 8px; color: white; outline: none;
    }
    .form-group input:focus { border-color: #38bdf8; }
    .error-msg { color: #f87171; font-size: 12px; text-align: center; margin-bottom: 12px; }
    .btn-submit {
      width: 100%; padding: 12px; border: none; border-radius: 10px;
      background: linear-gradient(135deg, #0284c7, #2563eb); color: white;
      font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 8px;
    }
    .mode-switch { margin-top: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
    .btn-link { background: none; border: none; color: #38bdf8; font-weight: 600; cursor: pointer; margin-left: 4px; }
  `]
})
export class AuthModalComponent {
  showModal$ = this.state.showAuthModal$;
  isLoginMode = true;
  username = '';
  email = '';
  password = '';
  errorMessage = '';

  constructor(private api: ApiService, private state: GameStateService) {}

  close() {
    this.state.showAuthModal$.next(false);
  }

  submit() {
    this.errorMessage = '';
    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill out username and password';
      return;
    }

    if (this.isLoginMode) {
      this.api.login(this.username, this.password).subscribe({
        next: (res) => {
          localStorage.setItem('jwt_token', res.token);
          this.close();
          window.location.reload();
        },
        error: (err) => {
          this.errorMessage = err?.error?.error || 'Login failed';
        }
      });
    } else {
      this.api.register(this.username, this.email || 'player@guild.com', this.password).subscribe({
        next: (res) => {
          localStorage.setItem('jwt_token', res.token);
          this.close();
          window.location.reload();
        },
        error: (err) => {
          this.errorMessage = err?.error?.error || 'Registration failed';
        }
      });
    }
  }
}
