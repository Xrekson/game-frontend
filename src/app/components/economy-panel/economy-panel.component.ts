import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { GameStateService, UpgradeItem } from '../../services/game-state.service';

@Component({
  selector: 'app-economy-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="economy-container">
      <div class="header-actions">
        <h2 class="panel-title">⚡ Revenue & Upgrades</h2>
        <div class="btn-group">
          <button class="btn-claim" (click)="claimIncome()">
            🎁 Claim Income
          </button>
          <button class="btn-prestige" (click)="prestige()">
            ⭐ Prestige Reset
          </button>
        </div>
      </div>

      <!-- Current Treasury Balance Card -->
      <div class="treasury-card">
        <div class="treasury-left">
          <span class="gold-symbol">💰</span>
          <div class="balance-details">
            <span class="treasury-label">Available Treasury Balance</span>
            <span class="treasury-amount">{{ (currentBal$ | async) | number:'1.1-1' }} Gold</span>
          </div>
        </div>
        <div class="income-rate-tag">
          ⚡ +{{ (incomeRate$ | async) | number:'1.1-1' }}/s
        </div>
      </div>

      <!-- Rank Target Progress Card -->
      <div class="rank-target-card">
        <div class="target-top">
          <span class="target-title">🎯 Rank {{ (prestigeLevel$ | async) || 0 }} → {{ ((prestigeLevel$ | async) || 0) + 1 }} Goal</span>
          <span class="target-status">
            {{ (incomeRate$ | async) | number:'1.0-0' }} / {{ getTargetRate() | number:'1.0-0' }} Gold/s ({{ getProgressPercent() | number:'1.0-0' }}%)
          </span>
        </div>
        <div class="target-progress-track">
          <div class="target-progress-fill" [style.width.%]="getProgressPercent()"></div>
        </div>
        <p class="target-sub" *ngIf="(incomeRate$ | async)! < getTargetRate()">
          Reach <b>{{ getTargetRate() | number:'1.0-0' }} Gold/s</b> passive income to unlock Citadel Prestige Rank Up!
        </p>
        <p class="target-sub ready" *ngIf="(incomeRate$ | async)! >= getTargetRate()">
          👑 <b>Rank Target Reached!</b> Visit the Citadel of Haven Royal Throne [E] to Rank Up!
        </p>
      </div>

      <div class="upgrades-grid">
        <div class="upgrade-card" *ngFor="let u of getShopUpgrades()">
          <div class="upgrade-icon-bg">
            <span class="icon-text">⚡</span>
          </div>
          <div class="upgrade-info">
            <div class="upgrade-top">
              <span class="name">{{ u.name }}</span>
              <span class="lvl">Lv. {{ u.level }}</span>
            </div>
            <p class="desc">{{ u.description }}</p>
            <div class="upgrade-stats">
              <span class="bonus">+{{ u.income_bonus_per_sec }}/s</span>
              <span class="cost">Cost: {{ u.current_cost | number:'1.0-0' }} Gold</span>
            </div>
          </div>
          <button
            class="btn-buy"
            [disabled]="(currentBal$ | async)! < u.current_cost"
            (click)="buyUpgrade(u.id)">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .economy-container { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
    .header-actions { display: flex; justify-content: space-between; align-items: center; }
    .panel-title { font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0; }
    .btn-group { display: flex; gap: 8px; }
    .btn-claim {
      background: linear-gradient(135deg, #10b981, #059669); border: none;
      color: white; font-weight: 700; padding: 8px 14px; border-radius: 10px; cursor: pointer;
    }
    .btn-prestige {
      background: linear-gradient(135deg, #a855f7, #7e22ce); border: none;
      color: white; font-weight: 700; padding: 8px 14px; border-radius: 10px; cursor: pointer;
    }

    .treasury-card {
      display: flex; justify-content: space-between; align-items: center;
      background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(15, 23, 42, 0.8));
      border: 1px solid rgba(234, 179, 8, 0.4); border-radius: 14px; padding: 12px 16px;
    }
    .treasury-left { display: flex; align-items: center; gap: 12px; }
    .gold-symbol { font-size: 26px; }
    .balance-details { display: flex; flex-direction: column; gap: 2px; }
    .treasury-label { font-size: 11px; color: #cbd5e1; font-weight: 600; }
    .treasury-amount { font-size: 18px; font-weight: 800; color: #fef08a; }
    .income-rate-tag {
      background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 10px;
    }

    .rank-target-card {
      background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(168, 85, 247, 0.3);
      border-radius: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;
    }
    .target-top { display: flex; justify-content: space-between; align-items: center; }
    .target-title { font-size: 12px; font-weight: 700; color: #fef08a; }
    .target-status { font-size: 11px; font-weight: 700; color: #c084fc; }
    .target-progress-track {
      width: 100%; height: 8px; background: rgba(15, 23, 42, 0.8); border-radius: 4px; overflow: hidden;
    }
    .target-progress-fill {
      height: 100%; background: linear-gradient(90deg, #a855f7, #ec4899, #f43f5e); transition: width 0.3s ease;
    }
    .target-sub { font-size: 11px; color: #94a3b8; margin: 0; }
    .target-sub.ready { color: #4ade80; font-weight: 700; }

    .upgrades-grid { display: flex; flex-direction: column; gap: 12px; }
    .upgrade-card {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px;
      background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px; backdrop-filter: blur(8px);
    }
    .upgrade-icon-bg {
      width: 44px; height: 44px; background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 20px;
    }
    .upgrade-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .upgrade-top { display: flex; justify-content: space-between; }
    .name { font-weight: 700; font-size: 14px; color: #f1f5f9; }
    .lvl { font-weight: 700; font-size: 12px; color: #38bdf8; }
    .desc { font-size: 11px; color: #94a3b8; margin: 0; }
    .upgrade-stats { display: flex; gap: 12px; font-size: 11px; font-weight: 600; }
    .bonus { color: #4ade80; }
    .cost { color: #fde047; }
    .btn-buy {
      background: #0284c7; border: none; color: white; font-weight: 700;
      padding: 8px 16px; border-radius: 8px; cursor: pointer;
    }
    .btn-buy:disabled { opacity: 0.4; cursor: not-allowed; }
  `]
})
export class EconomyPanelComponent implements OnInit
{
  upgrades: UpgradeItem[] = [];
  balance$ = this.state.balance$;
  currentBal$ = this.state.currentBal$;
  incomeRate$ = this.state.incomePerSec$;
  prestigeLevel$ = this.state.prestigeLevel$;

  constructor(private api: ApiService, public state: GameStateService) { }

  ngOnInit()
  {
    this.loadUpgrades();
    if (this.api.isLoggedIn())
    {
      this.claimIncome();
    }
  }

  loadUpgrades()
  {
    this.api.getUpgrades().subscribe(res =>
    {
      if (res?.upgrades)
      {
        this.upgrades = res.upgrades;
        this.state.upgrades$.next(res.upgrades);
      }
    });
  }

  getShopUpgrades(): UpgradeItem[]
  {
    const currentRank = this.state.prestigeLevel$.getValue() || 0;
    const tag = `_r${currentRank}`;
    const shopItems = this.upgrades.filter(u => u.id.endsWith(tag) || (!u.id.includes('_r') && currentRank === 0));
    return shopItems.length > 0 ? shopItems : this.upgrades;
  }

  getTargetRate(): number
  {
    const rank = this.state.prestigeLevel$.getValue() || 0;
    return 5000 * Math.pow(1.5, rank);
  }

  getProgressPercent(): number
  {
    const current = this.state.incomePerSec$.getValue() || 0;
    const target = this.getTargetRate();
    if (!target || target <= 0) return 0;
    return Math.min(100, (current / target) * 100);
  }

  claimIncome()
  {
    this.api.claimIncome().subscribe(res =>
    {
      if (res)
      {
        this.state.setBalance(res.new_balance, this.state.incomePerSec$.getValue());
        this.state.setCurrentBal(res.new_balance);
      }
    });
  }

  buyUpgrade(id: string)
  {
    this.api.purchaseUpgrade(id).subscribe(res =>
    {
      if (res?.success)
      {
        this.state.setBalance(res.new_balance, res.new_income_per_sec);
        this.state.setCurrentBal(res.new_balance);
        this.loadUpgrades();
      }
    });
  }

  prestige()
  {
    this.state.showPrestigeModal$.next(true);
  }
}
