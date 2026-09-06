import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PlayerProfile
{
  player_id: string;
  username: string;
  level: number;
  xp: number;
  avatar_url: string;
  role?: string;
}

export interface UpgradeItem
{
  id: string;
  name: string;
  level: number;
  base_cost: number;
  current_cost: number;
  income_bonus_per_sec: number;
  description: string;
}

export interface ItemAttribute
{
  key: string;
  type: string;             // "DAMAGE", "BUFF", "EXP_BONUS", "GOLD_BONUS", "SPECIAL"
  value: string;            // e.g. "15", "1.2", "20%"
  calculation_expr: string; // e.g. "base_atk * 1.25", "xp * 1.20"
}

export interface ItemTemplate
{
  template_id: string;
  name: string;
  type: number;
  base_attack: number;
  base_defense: number;
  rarity: string;
  base_price: number;
  has_attributes: boolean;
  attributes: ItemAttribute[];
}

export interface InventoryItem
{
  id: string;
  template_id: string;
  name: string;
  type: number; // 0: WEAPON, 1: ARMOUR, 2: ARMAMENT
  attack: number;
  defense: number;
  rarity: string;
  is_equipped: boolean;
  price: number;
  has_attributes?: boolean;
  attributes?: ItemAttribute[];
}

@Injectable({
  providedIn: 'root'
})
export class GameStateService
{
  public balance$ = new BehaviorSubject<number>(10.0);
  public currentBal$ = new BehaviorSubject<number>(1.0);
  public incomePerSec$ = new BehaviorSubject<number>(1.0);
  public prestigeLevel$ = new BehaviorSubject<number>(0);
  public prestigeMultiplier$ = new BehaviorSubject<number>(1.0);

  public profile$ = new BehaviorSubject<PlayerProfile | null>(null);
  public upgrades$ = new BehaviorSubject<UpgradeItem[]>([]);
  public inventory$ = new BehaviorSubject<InventoryItem[]>([]);
  public currentMap$ = new BehaviorSubject<string>('safe_zone_1');
  public activeTab$ = new BehaviorSubject<string>('economy'); // 'economy', 'inventory', 'trading', 'admin'

  public activeNPCShop$ = new BehaviorSubject<any | null>(null);
  public showAuthModal$ = new BehaviorSubject<boolean>(false);

  constructor()
  {
    // Start local timer to tick passive income locally every 100ms for ultra smooth HUD counters
    setInterval(() =>
    {
      const currentBal = this.balance$.getValue();
      const incomeRate = this.incomePerSec$.getValue();
      this.balance$.next(currentBal + (incomeRate * 0.1));
    }, 100);
  }

  setBalance(bal: number, rate: number): void
  {
    this.balance$.next(bal);
    this.incomePerSec$.next(rate);
  }

  setCurrentBal(bal: number): void
  {
    this.currentBal$.next(bal);
  }

  updateProfile(profile: PlayerProfile): void
  {
    this.profile$.next(profile);
  }
}
