import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api/v1';

  // Angular Signal tracking login state
  public isLoggedIn = signal<boolean>(!!localStorage.getItem('jwt_token'));

  constructor(private http: HttpClient) {
    if (window.location.hostname !== 'localhost') {
      this.baseUrl = `http://${window.location.hostname}:8080/api/v1`;
    }
  }

  public setLoggedIn(status: boolean): void {
    this.isLoggedIn.set(status);
  }

  public logout(): void {
    localStorage.removeItem('jwt_token');
    this.isLoggedIn.set(false);
  }

  public getUserRole(): string {
    const token = localStorage.getItem('jwt_token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.role || '';
    } catch {
      return '';
    }
  }

  public isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt_token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Auth
  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, { username, email, password });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { username, password });
  }

  // Player
  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/player/profile`, { headers: this.getHeaders() });
  }

  // Economy
  getBalance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/economy/balance`, { headers: this.getHeaders() });
  }

  claimIncome(): Observable<any> {
    return this.http.post(`${this.baseUrl}/economy/claim`, {}, { headers: this.getHeaders() });
  }

  getUpgrades(): Observable<any> {
    return this.http.get(`${this.baseUrl}/economy/upgrades`, { headers: this.getHeaders() });
  }

  purchaseUpgrade(upgradeId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/economy/upgrade`, { upgrade_id: upgradeId }, { headers: this.getHeaders() });
  }

  prestige(): Observable<any> {
    return this.http.post(`${this.baseUrl}/economy/prestige`, {}, { headers: this.getHeaders() });
  }

  // Inventory
  getInventory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventory/items`, { headers: this.getHeaders() });
  }

  equipItem(itemId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/inventory/equip`, { item_id: itemId }, { headers: this.getHeaders() });
  }

  getItemTemplates(): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventory/templates`, { headers: this.getHeaders() });
  }

  // Admin Item Management
  createItemTemplate(template: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/inventory/templates`, template, { headers: this.getHeaders() });
  }

  updateItemTemplate(template: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/inventory/templates`, template, { headers: this.getHeaders() });
  }

  // Trading
  getListings(status: string = 'active'): Observable<any> {
    return this.http.get(`${this.baseUrl}/trading/listings?status=${status}`, { headers: this.getHeaders() });
  }

  createListing(itemId: string, price: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/trading/create`, { item_id: itemId, price }, { headers: this.getHeaders() });
  }

  buyListing(listingId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/trading/buy`, { listing_id: listingId }, { headers: this.getHeaders() });
  }

  // NPC
  getNPCList(mapId: string = ''): Observable<any> {
    return this.http.get(`${this.baseUrl}/npc/list?map_id=${mapId}`, { headers: this.getHeaders() });
  }

  buyFromNPC(npcId: string, itemTemplateId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/npc/buy`, { npc_id: npcId, item_template_id: itemTemplateId }, { headers: this.getHeaders() });
  }

  // World
  getMapLayout(mapId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/world/map?map_id=${mapId}`, { headers: this.getHeaders() });
  }

  validateMovement(mapId: string, x: number, y: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/world/move`, { map_id: mapId, x, y }, { headers: this.getHeaders() });
  }

  resolveCombat(enemyId: string, damage: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/world/combat`, { enemy_id: enemyId, damage }, { headers: this.getHeaders() });
  }
}
