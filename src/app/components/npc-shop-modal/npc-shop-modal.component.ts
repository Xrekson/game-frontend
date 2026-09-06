import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-npc-shop-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="npc$ | async as npc">
      <div class="shop-card">
        <button class="btn-close" (click)="close()">✕</button>

        <div class="npc-header">
          <img [src]="getNPCIcon(npc.id)" class="npc-img" [alt]="npc.name" />
          <div class="npc-details">
            <h3 class="npc-name">{{ npc.name }}</h3>
            <p class="npc-dialogue">"{{ npc.dialogue }}"</p>
          </div>
        </div>

        <div class="shop-items">
          <h4 class="section-title">Wares & Artifacts</h4>
          <div class="shop-item" *ngFor="let t of templates">
            <div class="item-left">
              <img [src]="getIcon(t.template_id)" class="item-icon" />
              <div class="item-text">
                <span class="title">{{ t.name }}</span>
                <span class="stats">Atk: +{{ t.base_attack }} | Def: +{{ t.base_defense }}</span>
              </div>
            </div>

            <div class="item-right">
              <span class="price">{{ t.base_price }} Gold</span>
              <button class="btn-buy" (click)="buyItem(npc.id, t.template_id)">Buy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; inset: 0; z-index: 1000; background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center;
    }
    .shop-card {
      position: relative; width: 440px; padding: 24px; background: rgba(30, 41, 59, 0.95);
      border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 20px; color: white; display: flex; flex-direction: column; gap: 16px;
    }
    .btn-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; }
    .npc-header { display: flex; align-items: center; gap: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 16px; }
    .npc-img { width: 56px; height: 56px; border-radius: 50%; border: 2px solid #a855f7; }
    .npc-name { font-size: 16px; font-weight: 800; color: #f8fafc; margin: 0; }
    .npc-dialogue { font-size: 12px; font-style: italic; color: #cbd5e1; margin: 4px 0 0 0; }
    .section-title { font-size: 13px; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin: 0 0 10px 0; }
    .shop-items { display: flex; flex-direction: column; gap: 10px; }
    .shop-item {
      display: flex; justify-content: space-between; align-items: center; padding: 10px 14px;
      background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px;
    }
    .item-left { display: flex; align-items: center; gap: 12px; }
    .item-icon { width: 36px; height: 36px; border-radius: 6px; }
    .item-text { display: flex; flex-direction: column; }
    .title { font-weight: 700; font-size: 13px; color: #f1f5f9; }
    .stats { font-size: 11px; color: #94a3b8; }
    .item-right { display: flex; align-items: center; gap: 12px; }
    .price { font-weight: 800; color: #fef08a; font-size: 13px; }
    .btn-buy { background: #10b981; border: none; color: white; font-weight: 700; padding: 6px 14px; border-radius: 6px; cursor: pointer; }
  `]
})
export class NpcShopModalComponent {
  npc$ = this.state.activeNPCShop$;
  templates: any[] = [];

  constructor(private api: ApiService, private state: GameStateService) {
    this.api.getItemTemplates().subscribe(res => {
      if (res?.templates) {
        this.templates = res.templates;
      }
    });
  }

  close() {
    this.state.activeNPCShop$.next(null);
  }

  getNPCIcon(id: string): string {
    if (id === 'npc_alchemist') return 'assets/svg/npc_alchemist.svg';
    return 'assets/svg/npc_blacksmith.svg';
  }

  getIcon(templateId: string): string {
    const valid = ['wep_iron_sword', 'wep_mana_blade', 'arm_leather_vest', 'arm_plate_armour', 'arm_ring_power'];
    if (valid.includes(templateId)) {
      return `assets/svg/${templateId}.svg`;
    }
    return 'assets/svg/gold_coin.svg';
  }

  buyItem(npcId: string, templateId: string) {
    this.api.buyFromNPC(npcId, templateId).subscribe({
      next: (res) => {
        if (res?.success) {
          this.state.setBalance(res.new_balance, this.state.incomePerSec$.getValue());
          alert('Item purchased successfully!');
        }
      },
      error: (err) => {
        alert(err?.error?.error || 'Purchase failed! Check gold balance.');
      }
    });
  }
}
