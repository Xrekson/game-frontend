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
        <div class="prestige-card">
          <div class="prestige-top">
            <span class="prestige-badge">⭐ Rank {{ (prestige$ | async) || 0 }} (x{{ (multiplier$ | async) | number:'1.1-1' }})</span>
            <span class="rank-target-text">🎯 Target: {{ (incomeRate$ | async) | number:'1.0-0' }} / {{ getTargetRate(prestige$ | async) | number:'1.0-0' }}/s</span>
          </div>
          <div class="prestige-progress-track">
            <div class="prestige-progress-fill" [style.width.%]="getProgressPercent(incomeRate$ | async, prestige$ | async)"></div>
          </div>
        </div>
      </div>

      <div class="hud-right">
        <span class="zone-badge" [ngClass]="getZoneClass(map$ | async)">
          {{ getZoneLabel(map$ | async) }}
        </span>

        <!-- Admin Modal Button (Only visible for admin role) -->
        <button *ngIf="isLoggedInSignal() && isAdmin()" class="btn-admin" (click)="openAdmin()">⚙️ Admin</button>

        <!-- Logout Button -->
        <button *ngIf="isLoggedInSignal()" class="btn-logout" (click)="logout()">🚪 Logout</button>

        <!-- Login / Register Button -->
        <button *ngIf="!isLoggedInSignal()" class="btn-auth" (click)="openAuth()">Login / Register</button>
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
    
    .prestige-card {
      display: flex; flex-direction: column; gap: 4px;
      background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4);
      padding: 6px 14px; border-radius: 16px; min-width: 220px;
    }
    .prestige-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
    .prestige-badge {
      color: #e9d5ff; font-size: 11px; font-weight: 700;
    }
    .rank-target-text { font-size: 10px; color: #fde047; font-weight: 700; }
    .prestige-progress-track {
      width: 100%; height: 5px; background: rgba(30, 41, 59, 0.8); border-radius: 3px; overflow: hidden;
    }
    .prestige-progress-fill {
      height: 100%; background: linear-gradient(90deg, #a855f7, #c084fc, #f43f5e); transition: width 0.3s ease;
    }

    .hud-right { display: flex; align-items: center; gap: 10px; }
    .zone-badge {
      padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 600;
      background: rgba(239, 68, 68, 0.2); border: 1px solid #f87171; color: #fca5a5;
    }
    .zone-badge.safe-zone {
      background: rgba(34, 197, 94, 0.2); border: 1px solid #4ade80; color: #86efac;
    }
    .zone-badge.estate-zone {
      background: rgba(16, 185, 129, 0.2); border: 1px solid #34d399; color: #6ee7b7;
    }
    .btn-admin {
      background: rgba(234, 179, 8, 0.15); border: 1px solid #eab308; color: #fef08a;
      font-weight: 700; font-size: 12px; padding: 8px 14px; border-radius: 10px; cursor: pointer;
    }
    .btn-admin:hover { background: rgba(234, 179, 8, 0.3); }
    .btn-logout {
      background: rgba(239, 68, 68, 0.2); border: 1px solid #f87171; color: #fca5a5;
      font-weight: 700; font-size: 12px; padding: 8px 14px; border-radius: 10px; cursor: pointer;
    }
    .btn-logout:hover { background: rgba(239, 68, 68, 0.4); }
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
  isLoggedInSignal = this.api.isLoggedIn;

  constructor(public state: GameStateService, private api: ApiService) {}

  ngOnInit() {
    if (this.isLoggedInSignal()) {
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

  getTargetRate(rank: number | null): number {
    return 5000 * Math.pow(1.5, rank || 0);
  }

  getProgressPercent(currentRate: number | null, rank: number | null): number {
    const target = this.getTargetRate(rank);
    if (!target || target <= 0) return 0;
    return Math.min(100, ((currentRate || 0) / target) * 100);
  }

  isAdmin(): boolean {
    if (this.profile?.role === 'admin') return true;
    return this.api.isAdmin();
  }

  getZoneLabel(map: string | null): string {
    if (map === 'safe_zone_1') return '🛡️ Safe Zone (Haven)';
    if (map === 'property_estate') return '🏰 Private Estate';
    return '⚔️ Dungeon Crypt';
  }

  getZoneClass(map: string | null): string {
    if (map === 'safe_zone_1') return 'safe-zone';
    if (map === 'property_estate') return 'estate-zone';
    return 'dungeon-zone';
  }

  openAdmin() {
    this.state.showAdminModal$.next(true);
  }

  logout() {
    this.api.logout();
    this.profile = null;
    this.state.profile$.next(null);
    this.state.showAuthModal$.next(true);
  }

  openAuth() {
    this.state.showAuthModal$.next(true);
  }
}
