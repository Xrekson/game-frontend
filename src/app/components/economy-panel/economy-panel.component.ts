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
      <div>{{currentBal$ | async | number: '1.0-0'}}</div>

      <div class="upgrades-grid">
        <div class="upgrade-card" *ngFor="let u of upgrades">
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

  constructor(private api: ApiService, public state: GameStateService) { }

  ngOnInit()
  {
    this.loadUpgrades();
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
    if (confirm('Are you sure you want to Prestige? This resets balance & upgrades for a permanent +50% multiplier!'))
    {
      this.api.prestige().subscribe(res =>
      {
        if (res?.success)
        {
          this.state.prestigeLevel$.next(res.new_prestige_level);
          this.state.prestigeMultiplier$.next(res.new_prestige_multiplier);
          this.loadUpgrades();
        }
      });
    }
  }
}
