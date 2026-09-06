import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService, PlayerProfile } from '../../services/game-state.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-header-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="hud-header">
      <div class="hud-left">
        <div class="avatar-badge">
          <img src="assets/svg/player.svg" alt="Avatar" class="avatar-img" />
          <span class="lvl-tag">Lv. {{ profile?.level || 1 }}</span>
        </div>
        <div class="profile-info">
          <span class="username">{{ profile?.username || 'Guest Player' }}</span>
          <div class="xp-bar-container">
            <div class="xp-fill" [style.width.%]="(profile?.xp || 0) % 100"></div>
          </div>
        </div>
      </div>

      <div class="hud-center">
        <div class="currency-card">
          <img src="assets/svg/gold_coin.svg" class="gold-icon" alt="Gold" />
          <div class="currency-val">
            <span class="amount">{{ (balance$ | async) | number:'1.1-1' }}</span>
            <span class="rate">+{{ (incomeRate$ | async) | number:'1.1-1' }}/s</span>
          </div>
        </div>
        <div class="prestige-card" *ngIf="(prestige$ | async) as p">
          <span class="prestige-badge">⭐ Prestige {{ p }} (x{{ (multiplier$ | async) | number:'1.1-1' }})</span>
        </div>
      </div>

      <div class="hud-right">
        <span class="zone-badge" [class.safe-zone]="(map$ | async) === 'safe_zone_1'">
          {{ (map$ | async) === 'safe_zone_1' ? '🛡️ Safe Zone (Haven)' : '⚔️ Dungeon Crypt' }}
        </span>
        <button *ngIf="!isLoggedIn" class="btn-auth" (click)="openAuth()">Login / Register</button>
      </div>
    </header>
  `,
  styles: [`
    .hud-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: #f8fafc;
    }
    .hud-left { display: flex; align-items: center; gap: 12px; }
    .avatar-badge { position: relative; }
    .avatar-img { width: 44px; height: 44px; border-radius: 50%; border: 2px solid #38bdf8; }
    .lvl-tag {
      position: absolute; bottom: -4px; right: -6px;
      background: #0284c7; color: white; font-size: 10px; font-weight: bold;
      padding: 2px 6px; border-radius: 8px;
    }
    .username { font-weight: 700; font-size: 14px; color: #f1f5f9; }
    .xp-bar-container {
      width: 120px; height: 6px; background: #334155; border-radius: 3px; overflow: hidden; margin-top: 4px;
    }
    .xp-fill { height: 100%; background: linear-gradient(90deg, #38bdf8, #818cf8); }
    .hud-center { display: flex; align-items: center; gap: 16px; }
    .currency-card {
      display: flex; align-items: center; gap: 8px;
      background: rgba(234, 179, 8, 0.15); border: 1px solid rgba(234, 179, 8, 0.4);
      padding: 6px 16px; border-radius: 20px;
    }
    .gold-icon { width: 24px; height: 24px; }
    .amount { font-weight: 800; font-size: 18px; color: #fef08a; }
    .rate { font-size: 11px; color: #fde047; margin-left: 6px; }
    .prestige-badge {
      background: rgba(168, 85, 247, 0.2); border: 1px solid #c084fc;
      color: #e9d5ff; font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 16px;
    }
    .hud-right { display: flex; align-items: center; gap: 12px; }
    .zone-badge {
      padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 600;
      background: rgba(239, 68, 68, 0.2); border: 1px solid #f87171; color: #fca5a5;
    }
    .zone-badge.safe-zone {
      background: rgba(34, 197, 94, 0.2); border: 1px solid #4ade80; color: #86efac;
    }
    .btn-auth {
      background: linear-gradient(135deg, #0284c7, #2563eb); border: none; color: white;
      font-weight: 600; padding: 8px 16px; border-radius: 10px; cursor: pointer;
    }
  `]
})
export class HeaderHudComponent implements OnInit {
  profile: PlayerProfile | null = null;
  balance$ = this.state.balance$;
  incomeRate$ = this.state.incomePerSec$;
  prestige$ = this.state.prestigeLevel$;
  multiplier$ = this.state.prestigeMultiplier$;
  map$ = this.state.currentMap$;
  isLoggedIn = false;

  constructor(public state: GameStateService, private api: ApiService) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('jwt_token');
    if (this.isLoggedIn) {
      this.api.getProfile().subscribe(res => {
        if (res?.profile) {
          this.profile = res.profile;
          this.state.updateProfile(res.profile);
        }
      });
      this.api.getBalance().subscribe(res => {
        if (res) {
          this.state.setBalance(res.balance, res.income_per_sec);
          this.state.prestigeLevel$.next(res.prestige_level);
          this.state.prestigeMultiplier$.next(res.prestige_multiplier);
        }
      });
    }
  }

  openAuth() {
    this.state.showAuthModal$.next(true);
  }
}
