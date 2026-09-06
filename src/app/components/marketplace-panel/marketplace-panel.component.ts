import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-marketplace-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="trading-container">
      <div class="header-row">
        <h2 class="panel-title">🏪 P2P Marketplace</h2>
        <button class="btn-create" (click)="showCreateModal = true">
          + Sell Gear
        </button>
      </div>

      <div class="listings-list">
        <div class="listing-item" *ngFor="let l of listings">
          <div class="item-info">
            <span class="item-name">⚔️ {{ l.item_name || 'Adventurer Item' }}</span>
            <span class="seller">Seller: {{ l.seller_id.slice(0, 8) }}</span>
          </div>
          <div class="item-price">
            <span class="price-val">{{ l.price | number:'1.0-0' }} Gold</span>
            <button class="btn-buy" (click)="buy(l.id)">Buy Now</button>
          </div>
        </div>

        <div class="empty-state" *ngIf="listings.length === 0">
          <p>No active trade listings in the marketplace.</p>
        </div>
      </div>

      <!-- Create Listing Modal -->
      <div class="modal-backdrop" *ngIf="showCreateModal">
        <div class="modal-card">
          <h3>List Item for Sale</h3>
          <div class="form-group">
            <label>Select Item from Inventory</label>
            <select [(ngModel)]="selectedItemId">
              <option *ngFor="let item of inventory" [value]="item.id">
                {{ item.name }} ({{ item.rarity }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Price (Gold)</label>
            <input type="number" [(ngModel)]="listingPrice" placeholder="100" />
          </div>
          <div class="modal-btns">
            <button class="btn-cancel" (click)="showCreateModal = false">Cancel</button>
            <button class="btn-confirm" (click)="createListing()">Post Listing</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .trading-container { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
    .header-row { display: flex; justify-content: space-between; align-items: center; }
    .panel-title { font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0; }
    .btn-create {
      background: linear-gradient(135deg, #0284c7, #2563eb); border: none;
      color: white; font-weight: 700; padding: 8px 14px; border-radius: 8px; cursor: pointer;
    }
    .listings-list { display: flex; flex-direction: column; gap: 10px; }
    .listing-item {
      display: flex; justify-content: space-between; align-items: center; padding: 12px 16px;
      background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px; backdrop-filter: blur(8px);
    }
    .item-info { display: flex; flex-direction: column; gap: 2px; }
    .item-name { font-weight: 700; font-size: 13px; color: #f1f5f9; }
    .seller { font-size: 11px; color: #94a3b8; }
    .item-price { display: flex; align-items: center; gap: 12px; }
    .price-val { font-weight: 800; color: #fef08a; font-size: 14px; }
    .btn-buy {
      background: #10b981; border: none; color: white; font-weight: 700;
      padding: 6px 14px; border-radius: 6px; cursor: pointer;
    }
    .empty-state { text-align: center; color: #94a3b8; font-size: 13px; padding: 24px; }
    .modal-backdrop {
      position: fixed; inset: 0; z-index: 1000; background: rgba(15, 23, 42, 0.75);
      display: flex; justify-content: center; align-items: center;
    }
    .modal-card {
      width: 320px; padding: 24px; background: #1e293b; border: 1px solid #38bdf8;
      border-radius: 16px; color: white; display: flex; flex-direction: column; gap: 14px;
    }
    .form-group { display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
    .form-group select, .form-group input {
      padding: 8px 12px; background: #0f172a; border: 1px solid #334155;
      border-radius: 8px; color: white;
    }
    .modal-btns { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    .btn-cancel { background: #475569; border: none; color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer; }
    .btn-confirm { background: #0284c7; border: none; color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer; }
  `]
})
export class MarketplacePanelComponent implements OnInit {
  listings: any[] = [];
  inventory: any[] = [];
  showCreateModal = false;
  selectedItemId = '';
  listingPrice = 100;

  constructor(private api: ApiService, private state: GameStateService) {}

  ngOnInit() {
    this.loadListings();
    this.state.inventory$.subscribe(items => {
      this.inventory = items;
      if (items.length > 0) this.selectedItemId = items[0].id;
    });
  }

  loadListings() {
    this.api.getListings().subscribe(res => {
      if (res?.listings) {
        this.listings = res.listings;
      }
    });
  }

  buy(listingId: string) {
    this.api.buyListing(listingId).subscribe(res => {
      if (res?.success) {
        this.loadListings();
      }
    });
  }

  createListing() {
    if (!this.selectedItemId || this.listingPrice <= 0) return;
    this.api.createListing(this.selectedItemId, this.listingPrice).subscribe(res => {
      if (res?.listing) {
        this.showCreateModal = false;
        this.loadListings();
      }
    });
  }
}
