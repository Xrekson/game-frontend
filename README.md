# Incremental Dungeon Crawler & Trading Game - Frontend

A modern, high-performance web client combining **Angular 19** for UI dashboard panels and **Phaser 3** for top-down 2D canvas world exploration, dungeon crawling, and real-time combat.

---

## 🎮 What It Is

This application is the frontend client for the Incremental Dungeon Crawler & Trading game. It features a side-by-side layout:
- **Left / Center Viewport**: Phaser 3 2D canvas rendering town safe zones, dungeon crypts, player WASD keyboard movement, interactive NPCs, dungeon monsters, attack animations, and floating damage numbers.
- **Right Sidebar Overlay**: Angular 19 glassmorphism HUD dashboard containing tabs for:
  - **⚡ Revenue & Upgrades**: Live gold balance counter ticking every 100ms, offline income claim, utility upgrades (Gold Miner, Blacksmith Forge, Mana Crystal Extractor, Merchant Guild), and Prestige reset button.
  - **🛡️ Armory & Gear**: Equipped gear slots, grid of owned weapons, armours, armaments with Attack/Defense/Rarity badges, and Equip/Unequip buttons.
  - **🏪 P2P Marketplace**: Trade listings table, "Sell Item" modal, and instant purchase.
  - **💬 Safe Zone NPC Shop**: Interactive shop modal triggered when approaching town NPCs in Phaser.
  - **🔐 Auth Modal**: Glassmorphism Login & Register overlay.

All game graphics (Player, NPCs, Monsters, Portals, Weapons, Armour, Coins) are resolution-independent **SVG vector assets** loaded via Phaser 3 `this.load.svg(...)`.

---

## 🚀 Prerequisites

Ensure you have the following installed:
- **Node.js**: `v18.0.0+` (LTS recommended)
- **npm**: `v9.0.0+` (or `bun` / `yarn`)

---

## 🛠️ Basic Setup & Running Locally

### Step 1: Install Dependencies

Navigate to the frontend project directory and install dependencies:

```bash
cd template-angular-main
npm install
```

### Step 2: Start Development Server

Run the Angular CLI development server:

```bash
npm run dev
# or
ng serve
```

Navigate to **`http://localhost:4200`** in your browser. The application will automatically reload if you change any of the source files.

*(Make sure your Go Backend API Gateway is running on `http://localhost:8080` and `ws://localhost:8081/ws`).*

---

## 📦 Production Build

To compile and bundle the application for production deployment:

```bash
npm run build
# or
ng build --base-href='./'
```

The build artifacts will be stored in the `dist/template-angular` directory.

---

## ⌨️ Controls & Gameplay Guide

| Action | Control |
|---|---|
| **Movement** | `W` `A` `S` `D` or `Arrow Keys` |
| **Interact / Talk to NPC** | `E` (when near Garrick the Blacksmith or Lyra the Mystic) |
| **Enter Dungeon Portal** | `E` (when near Dungeon Portal) |
| **Attack Monster** | `E` (when near Shadow Ghoul monster in Dungeon) |
| **Claim Offline Income** | Click `🎁 Claim Income` button in Upgrades panel |
| **Equip Item** | Click `Equip` button in Armory panel |
| **Sell Item** | Click `+ Sell Gear` button in Marketplace panel |
