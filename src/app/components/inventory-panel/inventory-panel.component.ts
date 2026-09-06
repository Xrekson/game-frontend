import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { GameStateService, InventoryItem } from '../../services/game-state.service';

@Component({
  selector: 'app-inventory-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inventory-container">
      <h2 class="panel-title">🛡️ Armory & Gear</h2>

      <div class="inventory-grid">
        <div class="item-card" *ngFor="let item of items" [class.equipped]="item.is_equipped">
          <div class="item-header">
            <img [src]="getIcon(item.template_id)" class="item-icon" [alt]="item.name" />
            <span class="rarity-badge" [class]="item.rarity.toLowerCase()">{{ item.rarity }}</span>
          </div>

          <div class="item-body">
            <span class="item-name">{{ item.name }}</span>
            <div class="item-stats">
              <span *ngIf="item.attack > 0" class="stat-atk">⚔️ +{{ item.attack }} Atk</span>
              <span *ngIf="item.defense > 0" class="stat-def">🛡️ +{{ item.defense }} Def</span>
            </div>
          </div>

          <button
            class="btn-action"
            [class.btn-unequip]="item.is_equipped"
            (click)="toggleEquip(item)">
            {{ item.is_equipped ? 'Unequip' : 'Equip' }}
          </button>
        </div>

        <div class="empty-state" *ngIf="items.length === 0">
          <p>No gear in inventory. Visit Garrick the Blacksmith in town or defeat dungeon monsters!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inventory-container { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
    .panel-title { font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0; }
    .inventory-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .item-card {
      display: flex; flex-direction: column; justify-content: space-between; gap: 10px;
      padding: 12px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px; backdrop-filter: blur(8px);
    }
    .item-card.equipped { border-color: #38bdf8; box-shadow: 0 0 10px rgba(56, 189, 248, 0.3); }
    .item-header { display: flex; justify-content: space-between; align-items: center; }
    .item-icon { width: 36px; height: 36px; border-radius: 6px; }
    .rarity-badge { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px; text-transform: uppercase; }
    .rarity-badge.common { background: #475569; color: white; }
    .rarity-badge.rare { background: #0284c7; color: white; }
    .rarity-badge.epic { background: #7e22ce; color: white; }
    .rarity-badge.legendary { background: #eab308; color: #451a03; }
    .item-body { display: flex; flex-direction: column; gap: 2px; }
    .item-name { font-weight: 700; font-size: 13px; color: #f1f5f9; }
    .item-stats { display: flex; gap: 8px; font-size: 11px; font-weight: 600; }
    .stat-atk { color: #f87171; }
    .stat-def { color: #60a5fa; }
    .btn-action {
      background: #0284c7; border: none; color: white; font-size: 12px; font-weight: 700;
      padding: 6px 12px; border-radius: 6px; cursor: pointer;
    }
    .btn-unequip { background: #475569; }
    .empty-state { grid-column: span 2; text-align: center; color: #94a3b8; font-size: 13px; padding: 24px; }
  `]
})
export class InventoryPanelComponent implements OnInit {
  items: InventoryItem[] = [];

  constructor(private api: ApiService, private state: GameStateService) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.api.getInventory().subscribe(res => {
      if (res?.items) {
        this.items = res.items;
        this.state.inventory$.next(res.items);
      }
    });
  }

  getIcon(templateId: string): string {
    const valid = ['wep_iron_sword', 'wep_mana_blade', 'arm_leather_vest', 'arm_plate_armour', 'arm_ring_power'];
    if (valid.includes(templateId)) {
      return `assets/svg/${templateId}.svg`;
    }
    return 'assets/svg/gold_coin.svg';
  }

  toggleEquip(item: InventoryItem) {
    if (item.is_equipped) {
      // unequip
      this.loadInventory();
    } else {
      this.api.equipItem(item.id).subscribe(() => {
        this.loadInventory();
      });
    }
  }
}
