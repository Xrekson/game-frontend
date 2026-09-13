import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-prestige-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="showModal$ | async" (click)="close()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-title">
            <span class="royal-crown">👑</span>
            <div>
              <h2>Citadel of Haven - Royal Prestige</h2>
              <p class="subtitle">The Royal Throne room is the only sacred sanctuary to perform Prestige Rank Ups.</p>
            </div>
          </div>
          <button class="btn-close" (click)="close()">✕</button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Current Stats Banner -->
          <div class="stats-banner">
            <div class="stat-box">
              <span class="label">Current Income</span>
              <span class="value gold">+{{ (incomeRate$ | async) | number:'1.1-1' }}/s</span>
            </div>
            <div class="stat-box">
              <span class="label">Prestige Level</span>
              <span class="value rank">Rank {{ (prestigeLevel$ | async) || 0 }}</span>
            </div>
            <div class="stat-box">
              <span class="label">Multiplier Boost</span>
              <span class="value mult">x{{ (multiplier$ | async) | number:'1.1-2' }}</span>
            </div>
          </div>

          <!-- Benefits & Consequences -->
          <div class="info-card">
            <h3>⭐ Royal Prestige Rewards & Mechanics</h3>
            <ul class="rewards-list">
              <li><b>+0.5x Permanent Multiplier Addition</b>: Multiplier increases to <b>x{{ getNextMultiplier(prestigeLevel$ | async) | number:'1.1-2' }}</b>.</li>
              <li><b>Income Rate Target</b>: Reach <b>{{ getTargetRate(prestigeLevel$ | async) | number:'1.0-0' }} Gold/sec</b> income to ascend to Rank {{ ((prestigeLevel$ | async) || 0) + 1 }}.</li>
              <li><b>Fresh Rank Upgrades</b>: Retain all previous rank upgrades while unlocking new Rank {{ ((prestigeLevel$ | async) || 0) + 1 }} upgrades in the shop.</li>
            </ul>
          </div>

          <!-- Requirement Check -->
          <div
            class="requirement-box"
            [class.eligible]="(incomeRate$ | async)! >= getTargetRate(prestigeLevel$ | async)"
            [class.locked]="(incomeRate$ | async)! < getTargetRate(prestigeLevel$ | async)"
          >
            <ng-container *ngIf="(incomeRate$ | async)! >= getTargetRate(prestigeLevel$ | async)">
              <span class="req-icon">✅</span>
              <div>
                <span class="req-title">Citadel Royal Authorization Granted</span>
                <p class="req-desc">
                  Your passive income ({{ (incomeRate$ | async) | number:'1.0-0' }}/s) meets the required target of {{ getTargetRate(prestigeLevel$ | async) | number:'1.0-0' }} Gold/s!
                </p>
              </div>
            </ng-container>
            <ng-container *ngIf="(incomeRate$ | async)! < getTargetRate(prestigeLevel$ | async)">
              <span class="req-icon">🔒</span>
              <div>
                <span class="req-title">{{ getTargetRate(prestigeLevel$ | async) | number:'1.0-0' }} Gold/sec Income Required</span>
                <p class="req-desc">
                  Increase passive earning rate to at least {{ getTargetRate(prestigeLevel$ | async) | number:'1.0-0' }} Gold/sec (Current: {{ (incomeRate$ | async) | number:'1.1-1' }}/s).
                </p>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer">
          <button class="btn-cancel" (click)="close()">Return to Citadel</button>
          <button
            class="btn-prestige"
            [disabled]="(incomeRate$ | async)! < getTargetRate(prestigeLevel$ | async)"
            (click)="performPrestige()"
          >
            ⭐ Perform Royal Prestige Rank Up
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .modal-card {
      width: 100%; max-width: 540px; background: #0f172a;
      border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6); overflow: hidden; display: flex; flex-direction: column;
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 18px 24px; background: linear-gradient(135deg, rgba(88, 28, 135, 0.6), rgba(15, 23, 42, 0.9));
      border-bottom: 1px solid rgba(168, 85, 247, 0.2);
    }
    .header-title { display: flex; align-items: center; gap: 14px; }
    .royal-crown { font-size: 32px; }
    .modal-header h2 { font-size: 18px; font-weight: 800; color: #fef08a; margin: 0; }
    .subtitle { font-size: 11px; color: #94a3b8; margin: 2px 0 0 0; }
    .btn-close {
      background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer;
    }
    .btn-close:hover { color: white; }

    .modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }

    .stats-banner { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .stat-box {
      background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;
    }
    .stat-box .label { font-size: 10px; color: #94a3b8; font-weight: 600; }
    .stat-box .value { font-size: 15px; font-weight: 800; }
    .stat-box .value.gold { color: #4ade80; }
    .stat-box .value.rank { color: #38bdf8; }
    .stat-box .value.mult { color: #c084fc; }

    .info-card {
      background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px; padding: 14px 16px;
    }
    .info-card h3 { font-size: 13px; font-weight: 700; color: #e9d5ff; margin: 0 0 8px 0; }
    .rewards-list { margin: 0; padding-left: 18px; font-size: 12px; color: #cbd5e1; display: flex; flex-direction: column; gap: 6px; }

    .requirement-box {
      display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 14px;
      border: 1px solid transparent; transition: all 0.2s;
    }
    .requirement-box.eligible {
      background: rgba(34, 197, 94, 0.15); border-color: rgba(34, 197, 94, 0.4);
    }
    .requirement-box.locked {
      background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.4);
    }
    .req-icon { font-size: 24px; }
    .req-title { font-size: 13px; font-weight: 700; color: #f8fafc; }
    .req-desc { font-size: 11px; color: #94a3b8; margin: 2px 0 0 0; }

    .modal-footer {
      display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px;
      background: rgba(15, 23, 42, 0.95); border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .btn-cancel {
      background: rgba(51, 65, 85, 0.6); border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1; font-weight: 600; padding: 10px 18px; border-radius: 10px; cursor: pointer;
    }
    .btn-prestige {
      background: linear-gradient(135deg, #a855f7, #7e22ce); border: none;
      color: white; font-weight: 800; padding: 10px 20px; border-radius: 10px; cursor: pointer;
    }
    .btn-prestige:disabled { opacity: 0.4; cursor: not-allowed; }
  `]
})
export class PrestigeModalComponent implements OnInit {
  showModal$ = this.state.showPrestigeModal$;
  currentBal$ = this.state.currentBal$;
  incomeRate$ = this.state.incomePerSec$;
  prestigeLevel$ = this.state.prestigeLevel$;
  multiplier$ = this.state.prestigeMultiplier$;

  constructor(private api: ApiService, public state: GameStateService) {}

  ngOnInit() {}

  close() {
    this.state.showPrestigeModal$.next(false);
  }

  getTargetRate(rank: number | null): number {
    return 5000 * Math.pow(1.5, rank || 0);
  }

  getNextMultiplier(rank: number | null): number {
    return 1.0 + 0.5 * ((rank || 0) + 1);
  }

  performPrestige() {
    this.api.prestige().subscribe(res => {
      if (res?.success) {
        const newBal = res.new_balance ?? 10.0;
        const newRate = res.new_income_per_sec ?? 1.5;
        this.state.setBalance(newBal, newRate);
        this.state.setCurrentBal(newBal);
        this.state.prestigeLevel$.next(res.new_prestige_level);
        this.state.prestigeMultiplier$.next(res.new_prestige_multiplier);
        
        // Refresh upgrades
        this.api.getUpgrades().subscribe(upgRes => {
          if (upgRes?.upgrades) {
            this.state.upgrades$.next(upgRes.upgrades);
          }
        });

        this.close();
      }
    });
  }
}
