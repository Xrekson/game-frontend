import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { GameStateService, UpgradeItem } from '../../services/game-state.service';
import { EventBus } from '../../../game/EventBus';

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="properties-container">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">🏰 Owned Properties & Real Estate</h2>
          <p class="panel-subtitle">Overview of all active income-generating assets in your empire.</p>
        </div>
      </div>

      <!-- Estate Metrics Summary Cards -->
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-label">Total Passive Income</span>
          <span class="metric-val income">+{{ (incomeRate$ | async) | number:'1.1-1' }}/s</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">Properties Owned</span>
          <span class="metric-val count">{{ getOwnedCount() }} / {{ upgrades.length || 7 }}</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">Prestige Boost</span>
          <span class="metric-val multiplier">x{{ (multiplier$ | async) | number:'1.1-1' }}</span>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="filter-bar">
        <div class="filter-options">
          <button [class.active]="filter === 'owned'" (click)="filter = 'owned'">
            Owned ({{ getOwnedCount() }})
          </button>
          <button [class.active]="filter === 'all'" (click)="filter = 'all'">
            All Plots ({{ upgrades.length }})
          </button>
        </div>
      </div>

      <!-- Property Cards Grid -->
      <div class="properties-list">
        <div
          class="property-card"
          [class.unowned]="u.level === 0"
          *ngFor="let u of getFilteredUpgrades()"
        >
          <div class="card-icon" [ngClass]="getPropertyClass(u.id)">
            <span>{{ getPropertyIcon(u.id) }}</span>
          </div>

          <div class="card-details">
            <div class="card-top">
              <span class="property-name">{{ u.name }}</span>
              <span class="property-lvl" [class.owned-tag]="u.level > 0">
                {{ u.level > 0 ? 'Lv. ' + u.level : 'Unowned' }}
              </span>
            </div>

            <p class="property-desc">{{ u.description }}</p>

            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-label">Yield:</span>
                <span class="stat-val bonus">+{{ u.income_bonus_per_sec | number:'1.1-1' }}/s</span>
              </div>
              <div class="stat-item" *ngIf="u.level > 0 && (incomeRate$ | async) as total">
                <span class="stat-label">Income Share:</span>
                <span class="stat-val share">
                  {{ ((u.income_bonus_per_sec / (total || 1)) * 100) | number:'1.0-1' }}%
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Next Lvl Cost:</span>
                <span class="stat-val cost">{{ u.current_cost | number:'1.0-0' }} Gold</span>
              </div>
            </div>
          </div>

          <div class="card-action">
            <button
              class="btn-upgrade"
              [disabled]="(currentBal$ | async)! < u.current_cost"
              (click)="upgradeProperty(u.id)"
            >
              {{ u.level === 0 ? 'Purchase' : 'Upgrade' }}
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="getFilteredUpgrades().length === 0">
          <p>No owned properties found. Purchase upgrade plots in the Upgrades tab or above!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .properties-container { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
    .panel-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .panel-title { font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0; }
    .panel-subtitle { font-size: 12px; color: #94a3b8; margin: 4px 0 0 0; }

    .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .metric-card {
      background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;
    }
    .metric-label { font-size: 11px; color: #94a3b8; font-weight: 600; }
    .metric-val { font-size: 16px; font-weight: 800; }
    .metric-val.income { color: #4ade80; }
    .metric-val.count { color: #38bdf8; }
    .metric-val.multiplier { color: #c084fc; }

    .filter-bar { display: flex; justify-content: space-between; align-items: center; }
    .filter-options { display: flex; gap: 8px; background: rgba(15, 23, 42, 0.6); padding: 4px; border-radius: 10px; }
    .filter-options button {
      background: transparent; border: none; color: #94a3b8; font-size: 12px; font-weight: 600;
      padding: 6px 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s;
    }
    .filter-options button.active { background: #0284c7; color: white; }

    .properties-list { display: flex; flex-direction: column; gap: 12px; }
    .property-card {
      display: flex; align-items: center; gap: 14px; padding: 14px;
      background: rgba(30, 41, 59, 0.75); border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px; backdrop-filter: blur(8px);
    }
    .property-card.unowned { opacity: 0.6; background: rgba(15, 23, 42, 0.5); }
    .card-icon {
      width: 48px; height: 48px; border-radius: 14px; font-size: 24px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .card-icon.castle { background: rgba(234, 179, 8, 0.15); border-color: rgba(234, 179, 8, 0.4); }
    .card-icon.forge { background: rgba(249, 115, 22, 0.15); border-color: rgba(249, 115, 22, 0.4); }
    .card-icon.mystic { background: rgba(192, 132, 252, 0.15); border-color: rgba(192, 132, 252, 0.4); }
    .card-icon.mine { background: rgba(34, 197, 94, 0.15); border-color: rgba(34, 197, 94, 0.4); }

    .card-details { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .card-top { display: flex; justify-content: space-between; align-items: center; }
    .property-name { font-weight: 700; font-size: 14px; color: #f1f5f9; }
    .property-lvl { font-size: 11px; font-weight: 700; color: #94a3b8; background: #334155; padding: 2px 8px; border-radius: 6px; }
    .property-lvl.owned-tag { background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }

    .property-desc { font-size: 11px; color: #94a3b8; margin: 0; }
    .card-stats { display: flex; gap: 14px; font-size: 11px; margin-top: 4px; }
    .stat-item { display: flex; gap: 4px; }
    .stat-label { color: #64748b; }
    .stat-val.bonus { color: #4ade80; font-weight: 700; }
    .stat-val.share { color: #38bdf8; font-weight: 700; }
    .stat-val.cost { color: #fde047; font-weight: 600; }

    .btn-upgrade {
      background: #0284c7; border: none; color: white; font-weight: 700;
      padding: 8px 14px; border-radius: 10px; cursor: pointer; font-size: 12px;
    }
    .btn-upgrade:disabled { opacity: 0.4; cursor: not-allowed; }
    .empty-state { text-align: center; color: #94a3b8; font-size: 13px; padding: 24px; }
  `]
})
export class PropertiesPanelComponent implements OnInit {
  upgrades: UpgradeItem[] = [];
  filter: 'owned' | 'all' = 'owned';
  incomeRate$ = this.state.incomePerSec$;
  multiplier$ = this.state.prestigeMultiplier$;
  currentBal$ = this.state.currentBal$;

  constructor(private api: ApiService, public state: GameStateService) {}

  ngOnInit() {
    this.loadUpgrades();
  }

  loadUpgrades() {
    this.api.getUpgrades().subscribe(res => {
      if (res?.upgrades) {
        this.upgrades = res.upgrades;
        this.state.upgrades$.next(res.upgrades);
      }
    });
  }

  getOwnedCount(): number {
    return this.upgrades.filter(u => u.level > 0).length;
  }

  getFilteredUpgrades(): UpgradeItem[] {
    if (this.filter === 'owned') {
      return this.upgrades.filter(u => u.level > 0);
    }
    return this.upgrades;
  }

  upgradeProperty(id: string) {
    this.api.purchaseUpgrade(id).subscribe(res => {
      if (res?.success) {
        this.state.setBalance(res.new_balance, res.new_income_per_sec);
        this.state.setCurrentBal(res.new_balance);
        this.loadUpgrades();
      }
    });
  }

  getPropertyIcon(id: string): string {
    if (id.includes('gold') || id.includes('mine')) return '🪙';
    if (id.includes('forge') || id.includes('blacksmith')) return '⚒️';
    if (id.includes('mystic') || id.includes('academy')) return '✨';
    if (id.includes('castle') || id.includes('citadel')) return '🏰';
    if (id.includes('barracks') || id.includes('garrison')) return '⚔️';
    if (id.includes('tower') || id.includes('beacon')) return '🛡️';
    return '🏛️';
  }

  getPropertyClass(id: string): string {
    if (id.includes('castle')) return 'castle';
    if (id.includes('forge')) return 'forge';
    if (id.includes('mystic')) return 'mystic';
    if (id.includes('gold') || id.includes('mine')) return 'mine';
    return '';
  }
}
