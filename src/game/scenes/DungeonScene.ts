import * as Phaser from 'phaser';
import { EventBus } from '../EventBus';

export class DungeonScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite;
    private monster!: Phaser.GameObjects.Sprite;
    private returnPortal!: Phaser.GameObjects.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private keyWASD!: { [key: string]: Phaser.Input.Keyboard.Key };
    private keyE!: Phaser.Input.Keyboard.Key;
    private promptText!: Phaser.GameObjects.Text;
    private monsterHPText!: Phaser.GameObjects.Text;
    private monsterHP = 100;
    private isAttacking = false;

    // Green Grass Walkable Paths
    private walkablePaths: Phaser.Geom.Rectangle[] = [
        new Phaser.Geom.Rectangle(200, 650, 300, 200),   // Return Portal Plaza
        new Phaser.Geom.Rectangle(350, 500, 950, 240),   // Main Arena Pathway
        new Phaser.Geom.Rectangle(700, 220, 200, 320),   // Shadow Citadel Path
    ];

    constructor() {
        super('DungeonScene');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x09090b);
        const mapWidth = 1600;
        const mapHeight = 1200;

        // 1. Water Background Base
        const waterBg = this.add.tileSprite(mapWidth / 2, mapHeight / 2, mapWidth, mapHeight, 'ts_water_bg');
        waterBg.setAlpha(0.9);

        // 2. Unreachable Terrain: Red Crypt Tile Base
        const cryptBase = this.add.tileSprite(mapWidth / 2, mapHeight / 2, 1400, 1000, 'ts_red_crypt_tile');

        // 3. Walkable Green Grass Tile Paths
        this.walkablePaths.forEach(rect => {
            this.add.tileSprite(rect.x + rect.width / 2, rect.y + rect.height / 2, rect.width, rect.height, 'ts_green_grass_tile');
        });

        // 4. Scatter Rocks on Unreachable Grey Crypt Areas
        const rockPositions = [
            { x: 180, y: 180, key: 'ts_rock1' }, { x: 1420, y: 180, key: 'ts_rock2' },
            { x: 180, y: 1000, key: 'ts_rock3' }, { x: 1420, y: 1000, key: 'ts_rock4' },
            { x: 500, y: 220, key: 'ts_rock2' }, { x: 1100, y: 220, key: 'ts_rock3' },
            { x: 200, y: 450, key: 'ts_rock4' }, { x: 1400, y: 450, key: 'ts_rock1' },
            { x: 600, y: 950, key: 'ts_rock1' }, { x: 1100, y: 950, key: 'ts_rock2' }
        ];
        rockPositions.forEach(r => {
            this.add.image(r.x, r.y, r.key).setScale(1.2).setTint(0x94a3b8);
        });

        // Tiny Swords Red Crypt Buildings
        // Red Castle (Shadow Citadel)
        this.add.image(800, 280, 'ts_red_castle').setScale(1.2);
        this.add.text(800, 140, '👑 Crypt Citadel of Shadow', {
            fontFamily: 'sans-serif', fontSize: '16px', color: '#fca5a5', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Red Towers
        this.add.image(300, 320, 'ts_red_tower').setScale(1.0);
        this.add.image(1300, 320, 'ts_red_tower').setScale(1.0);

        // Zone Header HUD
        this.add.text(20, 20, '⚔️ SHADOW CRYPT (DUNGEON)', {
            fontFamily: 'sans-serif', fontSize: '18px', color: '#f87171', fontStyle: 'bold',
            backgroundColor: '#18181b', padding: { x: 10, y: 6 }
        }).setScrollFactor(0).setDepth(100);

        // Return Portal
        this.returnPortal = this.add.sprite(300, 750, 'portal').setScale(1.2);
        this.tweens.add({
            targets: this.returnPortal,
            scaleX: 1.35, scaleY: 1.35,
            duration: 1000, yoyo: true, repeat: -1
        });
        this.add.text(300, 810, '🛡️ Return to Haven Town', { fontSize: '13px', color: '#86efac', fontStyle: 'bold' }).setOrigin(0.5);

        // Spawn Red Warrior Monster
        this.monster = this.add.sprite(950, 600, 'ts_red_warrior_idle').setScale(0.85);
        this.monster.play('red_warrior_idle');
        this.monster.setFlipX(true);

        this.monsterHPText = this.add.text(950, 520, `Shadow Gladiator (HP: ${this.monsterHP}/100)`, {
            fontSize: '14px', color: '#fca5a5', fontStyle: 'bold',
            backgroundColor: '#000000', padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // Spawn Blue Warrior Player
        this.player = this.add.sprite(450, 600, 'ts_warrior_idle').setScale(0.75);
        this.player.play('warrior_idle');

        // Controls
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

        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.1);

        this.promptText = this.add.text(0, 0, '', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#fef08a',
            backgroundColor: '#0f172a', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        EventBus.emit('current-scene-ready', this);
        EventBus.emit('zone-changed', 'dungeon_1');
    }

    private isWalkable(x: number, y: number): boolean {
        return this.walkablePaths.some(rect => rect.contains(x, y));
    }

    override update() {
        const speed = 4.5;
        let vx = 0; let vy = 0;

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

            if (!this.isAttacking) {
                if (this.player.anims.currentAnim?.key !== 'warrior_run') {
                    this.player.play('warrior_run');
                }
                if (vx < 0) this.player.setFlipX(true);
                else if (vx > 0) this.player.setFlipX(false);
            }
        } else {
            if (!this.isAttacking) {
                if (this.player.anims.currentAnim?.key !== 'warrior_idle') {
                    this.player.play('warrior_idle');
                }
            }
        }

        // Proximity checks
        const distPortal = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.returnPortal.x, this.returnPortal.y);
        const distMonster = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.monster.x, this.monster.y);

        if (distPortal < 70) {
            this.promptText.setPosition(this.returnPortal.x, this.returnPortal.y - 55).setText('[E] Return to Haven Town').setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                this.scene.start('SafeZoneScene');
            }
        } else if (distMonster < 90 && this.monsterHP > 0) {
            this.promptText.setPosition(this.monster.x, this.monster.y - 55).setText('[E] Attack Shadow Gladiator').setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                this.attackMonster();
            }
        } else {
            this.promptText.setVisible(false);
        }
    }

    private attackMonster() {
        if (this.isAttacking) return;
        this.isAttacking = true;

        // Face monster
        if (this.player.x > this.monster.x) {
            this.player.setFlipX(true);
        } else {
            this.player.setFlipX(false);
        }

        // Play Player Attack Animation
        this.player.play('warrior_attack');
        this.player.once('animationcomplete', () => {
            this.isAttacking = false;
            this.player.play('warrior_idle');
        });

        // Damage calculation & visuals
        const dmg = 25;
        this.monsterHP -= dmg;

        // Monster hit flash & counter-attack anim
        this.monster.setTint(0xff6666);
        this.monster.play('red_warrior_attack');
        this.monster.once('animationcomplete', () => {
            this.monster.clearTint();
            if (this.monsterHP > 0) {
                this.monster.play('red_warrior_idle');
            }
        });

        // Floating Damage Text
        const dmgText = this.add.text(this.monster.x, this.monster.y - 40, `-${dmg}`, {
            fontSize: '20px', color: '#ef4444', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: dmgText, y: dmgText.y - 50, alpha: 0, duration: 800,
            onComplete: () => dmgText.destroy()
        });

        if (this.monsterHP <= 0) {
            this.monsterHP = 0;
            this.monsterHPText.setText('Defeated! Respawning...');
            this.monster.setAlpha(0.2);
            EventBus.emit('dungeon-combat-victory', { enemy_id: 'red_warrior', reward_gold: 50, reward_xp: 100 });

            this.time.delayedCall(3500, () => {
                this.monsterHP = 100;
                this.monster.setAlpha(1);
                this.monster.play('red_warrior_idle');
                this.monsterHPText.setText('Shadow Gladiator (HP: 100/100)');
            });
        } else {
            this.monsterHPText.setText(`Shadow Gladiator (HP: ${this.monsterHP}/100)`);
        }
    }
}

