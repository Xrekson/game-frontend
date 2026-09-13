import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhaserGame } from './phaser-game.component';
import { HeaderHudComponent } from './components/header-hud/header-hud.component';
import { EconomyPanelComponent } from './components/economy-panel/economy-panel.component';
import { InventoryPanelComponent } from './components/inventory-panel/inventory-panel.component';
import { MarketplacePanelComponent } from './components/marketplace-panel/marketplace-panel.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { TokenInvalidModalComponent } from './components/token-invalid-modal/token-invalid-modal.component';
import { NpcShopModalComponent } from './components/npc-shop-modal/npc-shop-modal.component';
import { PropertiesPanelComponent } from './components/properties-panel/properties-panel.component';
import { PrestigeModalComponent } from './components/prestige-modal/prestige-modal.component';
import { GameStateService } from './services/game-state.service';
import { ApiService } from './services/api.service';
import { EventBus } from '../game/EventBus';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    PhaserGame,
    HeaderHudComponent,
    EconomyPanelComponent,
    PropertiesPanelComponent,
    InventoryPanelComponent,
    MarketplacePanelComponent,
    AdminPanelComponent,
    AuthModalComponent,
    TokenInvalidModalComponent,
    NpcShopModalComponent,
    PrestigeModalComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  activeTab$ = this.state.activeTab$;
  isRateLimited$ = this.state.isRateLimited$;
  rateLimitCooldown$ = this.state.rateLimitCooldown$;
  isLoggedIn = this.api.isLoggedIn;

  constructor(
    public state: GameStateService,
    private api: ApiService
  ) {
    // EventBus subscriptions connecting Phaser 2D canvas with Angular UI
    EventBus.on('open-npc-shop', (npcData: any) => {
      this.state.activeNPCShop$.next(npcData);
    });

    EventBus.on('open-prestige-modal', () => {
      this.state.showPrestigeModal$.next(true);
    });

    EventBus.on('zone-changed', (zone: string) => {
      this.state.currentMap$.next(zone);
    });

    EventBus.on('dungeon-combat-victory', (data: any) => {
      this.api.resolveCombat(data.enemy_id, 100).subscribe(res => {
        if (res?.reward_gold) {
          const newBal = this.state.balance$.getValue() + res.reward_gold;
          this.state.balance$.next(newBal);
        }
      });
    });

    // Real-time upgrade syncing with Phaser 2D PropertyScene
    EventBus.on('request-upgrades', () => {
      this.syncUpgradesToGame();
    });

    EventBus.on('buy-upgrade-from-game', (upgradeId: string) => {
      this.api.purchaseUpgrade(upgradeId).subscribe(res => {
        if (res?.success) {
          this.state.setBalance(res.new_balance, res.new_income_per_sec);
          this.state.setCurrentBal(res.new_balance);
          this.api.getUpgrades().subscribe(upgRes => {
            if (upgRes?.upgrades) {
              this.state.upgrades$.next(upgRes.upgrades);
            }
          });
        }
      });
    });

    this.state.upgrades$.subscribe(() => {
      this.syncUpgradesToGame();
    });
  }

  private syncUpgradesToGame() {
    EventBus.emit('sync-upgrades', {
      upgrades: this.state.upgrades$.getValue(),
      multiplier: this.state.prestigeMultiplier$.getValue()
    });
  }

  ngOnInit() {
    // Auto prompt auth modal if token not present
    if (!localStorage.getItem('jwt_token')) {
      this.state.showAuthModal$.next(true);
    }
  }

  setTab(tab: string) {
    this.state.activeTab$.next(tab);
  }
}
