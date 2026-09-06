import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhaserGame } from './phaser-game.component';
import { HeaderHudComponent } from './components/header-hud/header-hud.component';
import { EconomyPanelComponent } from './components/economy-panel/economy-panel.component';
import { InventoryPanelComponent } from './components/inventory-panel/inventory-panel.component';
import { MarketplacePanelComponent } from './components/marketplace-panel/marketplace-panel.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { NpcShopModalComponent } from './components/npc-shop-modal/npc-shop-modal.component';
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
    InventoryPanelComponent,
    MarketplacePanelComponent,
    AuthModalComponent,
    NpcShopModalComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  activeTab$ = this.state.activeTab$;

  constructor(
    public state: GameStateService,
    private api: ApiService
  ) {
    // EventBus subscriptions connecting Phaser 2D canvas with Angular UI
    EventBus.on('open-npc-shop', (npcData: any) => {
      this.state.activeNPCShop$.next(npcData);
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
