import * as Phaser from 'phaser';
import { EventBus } from '../EventBus';

export interface PropertyData {
    id: string;
    name: string;
    level: number;
    base_cost?: number;
    current_cost?: number;
    income_bonus_per_sec?: number;
    description?: string;
}

export class PropertyScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private keyWASD!: { [key: string]: Phaser.Input.Keyboard.Key };
    private keyE!: Phaser.Input.Keyboard.Key;
    private promptText!: Phaser.GameObjects.Text;
    private returnPortal!: Phaser.GameObjects.Sprite;

    private prestigeMultiplier = 1.0;
    private liveUpgrades: PropertyData[] = [];
    private plotSprites: Map<string, { sprite: Phaser.GameObjects.Image; text: Phaser.GameObjects.Text; plot: any; data?: PropertyData }> = new Map();

    // Green Grass Walkable Courtyards & Paths
    private walkablePaths: Phaser.Geom.Rectangle[] = [
        new Phaser.Geom.Rectangle(320, 280, 260, 220),   // Gold Mine Courtyard
        new Phaser.Geom.Rectangle(720, 280, 260, 220),   // Forge Courtyard
        new Phaser.Geom.Rectangle(1120, 280, 260, 220),  // Mystic Academy Courtyard
        new Phaser.Geom.Rectangle(720, 600, 260, 240),   // Royal Citadel Plaza
        new Phaser.Geom.Rectangle(320, 600, 260, 240),   // Garrison Courtyard
        new Phaser.Geom.Rectangle(1120, 600, 260, 240),  // Watchtower Courtyard
        new Phaser.Geom.Rectangle(720, 920, 260, 240),   // Shadow Reliquary Courtyard
        new Phaser.Geom.Rectangle(200, 950, 240, 200),   // Return Portal Plaza
        new Phaser.Geom.Rectangle(220, 480, 1360, 120),  // Main Horizontal Green Road
        new Phaser.Geom.Rectangle(220, 830, 1360, 120),  // Lower Horizontal Green Road
        new Phaser.Geom.Rectangle(820, 200, 160, 980),   // Main Vertical Green Road
    ];

    constructor() {
        super('PropertyScene');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x064e3b);
        const mapWidth = 1800;
        const mapHeight = 1400;

        // 1. Water Background Base
        const waterBg = this.add.tileSprite(mapWidth / 2, mapHeight / 2, mapWidth, mapHeight, 'ts_water_bg');
        waterBg.setAlpha(0.9);

        // 2. Unreachable Terrain: Grey Grass Tile Base
        const greyBase = this.add.tileSprite(mapWidth / 2, mapHeight / 2, 1560, 1160, 'ts_grey_grass_tile');

        // 3. Walkable Green Grass Tile Courtyards & Paths
        this.walkablePaths.forEach(rect => {
            this.add.tileSprite(rect.x + rect.width / 2, rect.y + rect.height / 2, rect.width, rect.height, 'ts_green_grass_tile');
        });

        // 4. Scatter Rocks & Trees on Unreachable Grey Grass
        const rockPositions = [
            { x: 180, y: 180, key: 'ts_rock1' }, { x: 1620, y: 180, key: 'ts_rock2' },
            { x: 180, y: 1220, key: 'ts_rock3' }, { x: 1620, y: 1220, key: 'ts_rock4' },
            { x: 620, y: 200, key: 'ts_rock2' }, { x: 1060, y: 200, key: 'ts_rock1' },
            { x: 200, y: 720, key: 'ts_rock4' }, { x: 1600, y: 720, key: 'ts_rock3' }
        ];
        rockPositions.forEach(r => {
            this.add.image(r.x, r.y, r.key).setScale(1.2);
        });

        const treePositions = [
            { x: 250, y: 220 }, { x: 1550, y: 220 }, { x: 250, y: 1200 }, { x: 1550, y: 1200 }
        ];
        treePositions.forEach(t => {
            this.add.image(t.x, t.y, 'ts_tree1').setScale(0.9);
        });

        // Zone Banner HUD
        this.add.text(20, 20, '🏰 PRIVATE ESTATE & PROPERTIES SHOWCASE', {
            fontFamily: 'sans-serif', fontSize: '18px', color: '#fef08a', fontStyle: 'bold',
            backgroundColor: '#064e3b', padding: { x: 12, y: 6 }
        }).setScrollFactor(0).setDepth(100);

        // Define Property Plots mapped to backend upgrade IDs & Tiny Swords visual assets
        const plots = [
            { id: 'miner_1', defaultName: 'Gold Mine', x: 450, y: 380, image: 'ts_house2' },
            { id: 'forge_1', defaultName: 'Blacksmith Forge', x: 850, y: 380, image: 'ts_house1' },
            { id: 'dungeon_extract', defaultName: 'Mana Crystal Extractor', x: 1250, y: 380, image: 'ts_monastery' },
            { id: 'trade_guild', defaultName: 'Merchant Guild', x: 850, y: 720, image: 'ts_castle' },
            { id: 'upg_barracks', defaultName: 'Town Garrison', x: 450, y: 720, image: 'ts_barracks' },
            { id: 'upg_tower', defaultName: 'Watchtower Beacon', x: 1250, y: 720, image: 'ts_tower' },
            { id: 'upg_reliquary', defaultName: 'Shadow Reliquary', x: 850, y: 1040, image: 'ts_red_castle' },
        ];

        this.plotSprites.clear();

        plots.forEach(plot => {
            const sprite = this.add.image(plot.x, plot.y, plot.image);
            sprite.setScale(plot.image === 'ts_castle' || plot.image === 'ts_red_castle' ? 1.2 : 1.0);
            sprite.setAlpha(0.35);
            sprite.setTint(0x64748b);

            const textObj = this.add.text(plot.x, plot.y - (plot.image === 'ts_castle' ? 140 : 90), `🔒 ${plot.defaultName}\nUnowned Plot`, {
                fontFamily: 'sans-serif', fontSize: '13px', color: '#94a3b8', fontStyle: 'bold', align: 'center',
                backgroundColor: '#0f172a', padding: { x: 8, y: 4 }
            }).setOrigin(0.5);

            this.plotSprites.set(plot.id, { sprite, text: textObj, plot });
        });

        // EventBus listeners for live sync with Angular economy state
        EventBus.on('sync-upgrades', (payload: { upgrades: any[]; multiplier: number }) => {
            if (payload) {
                this.prestigeMultiplier = payload.multiplier || 1.0;
                this.updateUpgradesDisplay(payload.upgrades || []);
            }
        });

        // Request current upgrades from Angular state
        EventBus.emit('request-upgrades');

        // Return Portal to Haven Town
        this.returnPortal = this.add.sprite(300, 1050, 'portal').setScale(1.3);
        this.tweens.add({
            targets: this.returnPortal,
            scaleX: 1.45, scaleY: 1.45,
            duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        this.add.text(300, 1110, '⚡ Return to Haven Town', {
            fontSize: '14px', color: '#67e8f9', fontStyle: 'bold',
            backgroundColor: '#0f172a', padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // Spawn Player Sprite
        this.player = this.add.sprite(850, 860, 'ts_warrior_idle').setScale(0.75);
        this.player.play('warrior_idle');

        // Setup Controls
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.keyWASD = {
                W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            };
            this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        }

        // Camera Setup
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.1);

        // Prompt Text
        this.promptText = this.add.text(0, 0, '', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#fef08a',
            backgroundColor: '#0f172a', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        EventBus.emit('current-scene-ready', this);
        EventBus.emit('zone-changed', 'property_estate');
    }

    private updateUpgradesDisplay(upgradesList: any[]) {
        this.liveUpgrades = upgradesList;

        this.plotSprites.forEach((entry, plotId) => {
            const matching = upgradesList.filter(u => u.id.startsWith(plotId) || u.id === plotId);
            let totalLevel = 0;
            let totalYield = 0;
            let displayName = entry.plot.defaultName;

            matching.forEach(u => {
                const level = u.level || 0;
                const baseBonus = u.income_bonus_per_sec || 0;
                totalLevel += level;
                totalYield += level * baseBonus * this.prestigeMultiplier;
                if (level > 0 && u.name) {
                    displayName = u.name;
                }
            });

            if (totalLevel > 0) {
                entry.sprite.setAlpha(1.0);
                entry.sprite.clearTint();
                entry.text.setText(`🏰 ${displayName}\nLv. ${totalLevel} • +${totalYield.toFixed(1)}/s`);
                entry.text.setColor('#4ade80');
            } else {
                entry.sprite.setAlpha(0.35);
                entry.sprite.setTint(0x64748b);
                const activeItem = matching[0];
                const cost = activeItem ? (activeItem.current_cost || activeItem.base_cost || 0) : 0;
                entry.text.setText(`🔒 ${entry.plot.defaultName}\nUnowned (${cost.toFixed(0)} Gold)`);
                entry.text.setColor('#94a3b8');
            }
        });
    }

    private isWalkable(x: number, y: number): boolean {
        return this.walkablePaths.some(rect => rect.contains(x, y));
    }

    override update() {
        const speed = 4.5;
        let vx = 0;
        let vy = 0;

        if (this.cursors.left?.isDown || this.keyWASD['A']?.isDown) vx = -speed;
        else if (this.cursors.right?.isDown || this.keyWASD['D']?.isDown) vx = speed;

        if (this.cursors.up?.isDown || this.keyWASD['W']?.isDown) vy = -speed;
        else if (this.cursors.down?.isDown || this.keyWASD['S']?.isDown) vy = speed;

        // Path Collision check: restrict movement strictly to green grass paths
        const targetX = this.player.x + vx;
        const targetY = this.player.y + vy;

        if (vx !== 0 || vy !== 0) {
            if (this.isWalkable(targetX, targetY)) {
                this.player.x = targetX;
                this.player.y = targetY;
            } else if (this.isWalkable(targetX, this.player.y)) {
                this.player.x = targetX; // Wall slide X
            } else if (this.isWalkable(this.player.x, targetY)) {
                this.player.y = targetY; // Wall slide Y
            }

            if (this.player.anims.currentAnim?.key !== 'warrior_run') {
                this.player.play('warrior_run');
            }
            if (vx < 0) this.player.setFlipX(true);
            else if (vx > 0) this.player.setFlipX(false);
        } else {
            if (this.player.anims.currentAnim?.key !== 'warrior_idle') {
                this.player.play('warrior_idle');
            }
        }

        // Proximity check for Return Portal
        const distPortal = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.returnPortal.x, this.returnPortal.y);
        if (distPortal < 70) {
            this.promptText.setPosition(this.returnPortal.x, this.returnPortal.y - 55).setText('[E] Return to Haven Town Square').setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                this.scene.start('SafeZoneScene');
            }
            return;
        }

        // Proximity check for Property Plots
        let nearProperty = false;
        for (const [id, entry] of this.plotSprites.entries()) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.sprite.x, entry.sprite.y);
            if (dist < 85) {
                nearProperty = true;
                const data = entry.data;
                const name = data?.name || entry.plot.defaultName;
                const level = data?.level || 0;
                const baseBonus = data?.income_bonus_per_sec || 0;
                const yieldVal = level * baseBonus * this.prestigeMultiplier;
                const cost = data?.current_cost || data?.base_cost || 0;

                const actionText = level > 0
                    ? `[E] Upgrade ${name} to Lv. ${level + 1} (Cost: ${cost.toFixed(0)} Gold | Current: +${yieldVal.toFixed(1)}/s)`
                    : `[E] Purchase ${name} (Cost: ${cost.toFixed(0)} Gold)`;

                this.promptText.setPosition(entry.sprite.x, entry.sprite.y - 110)
                    .setText(actionText)
                    .setVisible(true);

                if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                    EventBus.emit('buy-upgrade-from-game', id);
                }
                break;
            }
        }

        if (!nearProperty) {
            this.promptText.setVisible(false);
        }
    }
}

