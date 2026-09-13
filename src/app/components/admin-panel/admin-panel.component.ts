import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { GameStateService, ItemTemplate } from '../../services/game-state.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="showModal$ | async">
      <div class="modal-card">
        <button class="btn-close" (click)="close()">✕</button>

        <h2 class="panel-title">⚡ Admin Item & Attribute Management</h2>
        <p class="panel-subtitle">Create and edit item templates with dynamic attributes, crystal sockets, and calculation expressions.</p>

        <div class="admin-layout">
          <!-- Template List -->
          <div class="template-list-card">
            <h3>Existing Templates</h3>
            <div class="template-list">
              <div
                class="template-item"
                *ngFor="let tmpl of templates"
                [class.active]="selectedTemplate?.template_id === tmpl.template_id"
                (click)="selectTemplate(tmpl)">
                <div class="tmpl-info">
                  <span class="tmpl-name">{{ tmpl.name }}</span>
                  <span class="tmpl-id">#{{ tmpl.template_id }}</span>
                </div>
                <div class="tmpl-badges">
                  <span class="badge-type">{{ getTypeName(tmpl.type) }}</span>
                  <span class="badge-attr" *ngIf="tmpl.has_attributes">Dynamic ({{ tmpl.attributes?.length || 0 }})</span>
                </div>
              </div>
            </div>
            <button class="btn-secondary" (click)="resetForm()">+ Create New Template</button>
          </div>

          <!-- Form Editor -->
          <div class="form-card">
            <h3>{{ isEditing ? 'Edit Item Template' : 'Create New Item Template' }}</h3>

            <div class="preset-bar">
              <span>Presets:</span>
              <button class="btn-preset" (click)="loadPreset('stone_picker')">Stone Picker</button>
              <button class="btn-preset" (click)="loadPreset('iron_gladiator')">Iron Gladiator</button>
              <button class="btn-preset" (click)="loadPreset('havoc_axe')">Havoc Axe</button>
            </div>

            <form (ngSubmit)="saveTemplate()" class="editor-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Template ID</label>
                  <input type="text" [(ngModel)]="form.template_id" name="template_id" placeholder="e.g. wep_iron_gladiator" [disabled]="isEditing" required />
                </div>
                <div class="form-group">
                  <label>Item Name</label>
                  <input type="text" [(ngModel)]="form.name" name="name" placeholder="e.g. Iron Gladiator" required />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Item Type</label>
                  <select [(ngModel)]="form.type" name="type">
                    <option [ngValue]="0">WEAPON (0)</option>
                    <option [ngValue]="1">ARMOUR (1)</option>
                    <option [ngValue]="2">ARMAMENT (2)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Rarity</label>
                  <select [(ngModel)]="form.rarity" name="rarity">
                    <option value="Common">Common</option>
                    <option value="Rare">Rare</option>
                    <option value="Epic">Epic</option>
                    <option value="Legendary">Legendary</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Base Attack</label>
                  <input type="number" [(ngModel)]="form.base_attack" name="base_attack" />
                </div>
                <div class="form-group">
                  <label>Base Defense</label>
                  <input type="number" [(ngModel)]="form.base_defense" name="base_defense" />
                </div>
                <div class="form-group">
                  <label>Base Price ($)</label>
                  <input type="number" [(ngModel)]="form.base_price" name="base_price" />
                </div>
              </div>

              <!-- BOOLEAN TOGGLE FOR DYNAMIC ATTRIBUTES -->
              <div class="toggle-box">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="form.has_attributes" name="has_attributes" />
                  <span class="toggle-title">Enable Dynamic Attributes & Calculation Expressions</span>
                </label>
              </div>

              <!-- DYNAMIC ATTRIBUTE LIST EDITOR -->
              <div class="attributes-section" *ngIf="form.has_attributes">
                <div class="attr-header">
                  <h4>Dynamic Attributes List</h4>
                  <button type="button" class="btn-small" (click)="addAttribute()">+ Add Attribute</button>
                </div>

                <div class="attr-row" *ngFor="let attr of form.attributes; let i = index">
                  <input type="text" [(ngModel)]="attr.key" [name]="'attr_key_' + i" placeholder="Key (e.g. speed)" required />

                  <select [(ngModel)]="attr.type" [name]="'attr_type_' + i">
                    <option value="DAMAGE">DAMAGE</option>
                    <option value="BUFF">BUFF</option>
                    <option value="EXP_BONUS">EXP_BONUS</option>
                    <option value="GOLD_BONUS">GOLD_BONUS</option>
                    <option value="SPECIAL">SPECIAL</option>
                  </select>

                  <input type="text" [(ngModel)]="attr.value" [name]="'attr_val_' + i" placeholder="Value (e.g. 1.2)" required />

                  <input type="text" [(ngModel)]="attr.calculation_expr" [name]="'attr_expr_' + i" placeholder="Expr (e.g. base_atk * 1.25)" />

                  <button type="button" class="btn-danger" (click)="removeAttribute(i)">✕</button>
                </div>

                <div class="empty-attr-note" *ngIf="form.attributes.length === 0">
                  No attributes added yet. Click "+ Add Attribute" to define custom crystal sockets.
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-primary">{{ isEditing ? 'Update Template' : 'Save Template' }}</button>
                <button type="button" class="btn-secondary" (click)="resetForm()" *ngIf="isEditing">Cancel</button>
              </div>
              <p class="status-msg" *ngIf="statusMsg" [class.error]="isError">{{ statusMsg }}</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; inset: 0; z-index: 1200;
      background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(10px);
      display: flex; justify-content: center; align-items: center; padding: 20px;
    }
    .modal-card {
      position: relative; width: 900px; max-width: 95vw; max-height: 90vh; overflow-y: auto; padding: 28px;
      background: rgba(30, 41, 59, 0.95); border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6); color: #f8fafc;
    }
    .btn-close {
      position: absolute; top: 16px; right: 16px; background: none; border: none;
      color: #94a3b8; font-size: 18px; cursor: pointer;
    }
    .panel-title { font-size: 18px; font-weight: 800; margin: 0; color: #fef08a; }
    .panel-subtitle { font-size: 12px; color: #94a3b8; margin: 0 0 16px 0; }
    .admin-layout { display: grid; grid-template-columns: 240px 1fr; gap: 16px; }
    .template-list-card, .form-card {
      background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px;
    }
    h3 { font-size: 14px; font-weight: 700; margin: 0; color: #38bdf8; }
    .template-list { display: flex; flex-direction: column; gap: 8px; max-height: 380px; overflow-y: auto; }
    .template-item {
      padding: 10px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;
    }
    .template-item.active { border-color: #38bdf8; background: rgba(56, 189, 248, 0.15); }
    .tmpl-info { display: flex; flex-direction: column; }
    .tmpl-name { font-size: 12px; font-weight: 700; }
    .tmpl-id { font-size: 10px; color: #94a3b8; }
    .tmpl-badges { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .badge-type { font-size: 9px; padding: 2px 4px; background: #0284c7; border-radius: 4px; font-weight: 700; }
    .badge-attr { font-size: 9px; color: #fef08a; }
    .preset-bar { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #94a3b8; }
    .btn-preset { background: rgba(56, 189, 248, 0.1); border: 1px solid #38bdf8; color: #38bdf8; font-size: 11px; border-radius: 6px; padding: 4px 8px; cursor: pointer; }
    .editor-form { display: flex; flex-direction: column; gap: 12px; }
    .form-row { display: flex; gap: 12px; }
    .form-group { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    label { font-size: 11px; font-weight: 600; color: #cbd5e1; }
    input, select {
      background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.1); color: white;
      padding: 8px; border-radius: 6px; font-size: 12px;
    }
    .toggle-box {
      background: rgba(15, 23, 42, 0.8); border: 1px dashed rgba(56, 189, 248, 0.4);
      padding: 10px; border-radius: 8px; margin-top: 4px;
    }
    .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .toggle-title { font-size: 12px; font-weight: 700; color: #38bdf8; }
    .attributes-section { display: flex; flex-direction: column; gap: 8px; background: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 8px; }
    .attr-header { display: flex; justify-content: space-between; align-items: center; }
    .attr-header h4 { font-size: 12px; font-weight: 700; margin: 0; color: #fef08a; }
    .attr-row { display: grid; grid-template-columns: 1fr 100px 1fr 1fr 30px; gap: 6px; align-items: center; }
    .btn-small { background: #0284c7; border: none; color: white; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
    .btn-danger { background: #ef4444; border: none; color: white; font-size: 12px; border-radius: 4px; cursor: pointer; height: 32px; }
    .empty-attr-note { font-size: 11px; color: #64748b; font-style: italic; }
    .form-actions { display: flex; gap: 8px; margin-top: 8px; }
    .btn-primary { background: #0284c7; border: none; color: white; font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
    .btn-secondary { background: #475569; border: none; color: white; font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
    .status-msg { font-size: 12px; font-weight: 700; color: #4ade80; margin: 0; }
    .status-msg.error { color: #f87171; }
  `]
})
export class AdminPanelComponent implements OnInit {
  showModal$ = this.state.showAdminModal$;
  templates: ItemTemplate[] = [];
  selectedTemplate: ItemTemplate | null = null;
  isEditing = false;
  statusMsg = '';
  isError = false;

  form: ItemTemplate = {
    template_id: '',
    name: '',
    type: 0,
    base_attack: 10,
    base_defense: 0,
    rarity: 'Common',
    base_price: 100,
    has_attributes: false,
    attributes: []
  };

  constructor(private api: ApiService, private state: GameStateService) {}

  ngOnInit() {
    this.loadTemplates();
  }

  close() {
    this.state.showAdminModal$.next(false);
  }

  loadTemplates() {
    this.api.getItemTemplates().subscribe(res => {
      if (res?.templates) {
        this.templates = res.templates;
      }
    });
  }

  selectTemplate(tmpl: ItemTemplate) {
    this.selectedTemplate = tmpl;
    this.isEditing = true;
    this.form = JSON.parse(JSON.stringify(tmpl));
    if (!this.form.attributes) this.form.attributes = [];
  }

  resetForm() {
    this.selectedTemplate = null;
    this.isEditing = false;
    this.statusMsg = '';
    this.form = {
      template_id: '',
      name: '',
      type: 0,
      base_attack: 10,
      base_defense: 0,
      rarity: 'Common',
      base_price: 100,
      has_attributes: false,
      attributes: []
    };
  }

  addAttribute() {
    if (!this.form.attributes) this.form.attributes = [];
    this.form.attributes.push({
      key: '',
      type: 'DAMAGE',
      value: '',
      calculation_expr: ''
    });
  }

  removeAttribute(index: number) {
    this.form.attributes.splice(index, 1);
  }

  loadPreset(presetName: string) {
    if (presetName === 'stone_picker') {
      this.form = {
        template_id: 'wep_stone_picker',
        name: 'Stone Picker',
        type: 0,
        base_attack: 5,
        base_defense: 0,
        rarity: 'Common',
        base_price: 25,
        has_attributes: true,
        attributes: [
          { key: 'speed', type: 'BUFF', value: '1.2', calculation_expr: 'speed * 1.2' },
          { key: 'type', type: 'SPECIAL', value: 'Short Sword / Knife', calculation_expr: '' }
        ]
      };
    } else if (presetName === 'iron_gladiator') {
      this.form = {
        template_id: 'wep_iron_gladiator',
        name: 'Iron Gladiator',
        type: 0,
        base_attack: 15,
        base_defense: 0,
        rarity: 'Rare',
        base_price: 250,
        has_attributes: true,
        attributes: [
          { key: 'speed', type: 'BUFF', value: '1.0', calculation_expr: 'speed * 1.0' },
          { key: 'aeras_crystal', type: 'DAMAGE', value: 'Wind (+4 Physical Atk, 2 Pierce)', calculation_expr: 'base_atk + 4' },
          { key: 'fotia_crystal', type: 'DAMAGE', value: 'Fire (Burn 5/sec for 2s)', calculation_expr: 'burn_dmg = 5 * 2s' },
          { key: 'vronti_crystal', type: 'DAMAGE', value: 'Lightning (Shock 2.5/sec, 20% Stagger)', calculation_expr: 'shock_dmg = 2.5 * 2s' }
        ]
      };
    } else if (presetName === 'havoc_axe') {
      this.form = {
        template_id: 'wep_havoc_axe',
        name: 'Havoc Axe',
        type: 0,
        base_attack: 25,
        base_defense: 0,
        rarity: 'Epic',
        base_price: 600,
        has_attributes: true,
        attributes: [
          { key: 'speed', type: 'BUFF', value: '0.75', calculation_expr: 'speed * 0.75' },
          { key: 'element_socket', type: 'SPECIAL', value: 'Middle Crystal Socket', calculation_expr: 'base_atk * 1.25' }
        ]
      };
    }
  }

  saveTemplate() {
    this.statusMsg = '';
    this.isError = false;

    if (this.isEditing) {
      this.api.updateItemTemplate(this.form).subscribe({
        next: () => {
          this.statusMsg = '✓ Item template updated successfully!';
          this.loadTemplates();
        },
        error: (err) => {
          this.isError = true;
          this.statusMsg = err?.error?.error || 'Failed to update item template.';
        }
      });
    } else {
      this.api.createItemTemplate(this.form).subscribe({
        next: () => {
          this.statusMsg = '✓ Item template created successfully!';
          this.loadTemplates();
          this.resetForm();
        },
        error: (err) => {
          this.isError = true;
          this.statusMsg = err?.error?.error || 'Failed to create item template.';
        }
      });
    }
  }

  getTypeName(type: number): string {
    switch (type) {
      case 0: return 'WEAPON';
      case 1: return 'ARMOUR';
      case 2: return 'ARMAMENT';
      default: return 'ITEM';
    }
  }
}
