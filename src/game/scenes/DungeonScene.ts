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

    constructor() {
        super('DungeonScene');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x18181b);

        // Draw Dungeon Grid
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x3f3f46, 0.4);
        for (let x = 0; x < 1000; x += 40) {
            graphics.moveTo(x, 0); graphics.lineTo(x, 1000);
        }
        for (let y = 0; y < 1000; y += 40) {
            graphics.moveTo(0, y); graphics.lineTo(1000, y);
        }
        graphics.strokePath();

        // Zone Header
        this.add.text(20, 20, '⚔️ SHADOW CRYPT (DUNGEON)', {
            fontFamily: 'sans-serif', fontSize: '18px', color: '#f87171', fontStyle: 'bold'
        }).setScrollFactor(0);

        // Spawn Portal Return
        this.returnPortal = this.add.sprite(100, 100, 'portal');
        this.add.text(100, 140, '🛡️ Return to Haven', { fontSize: '12px', color: '#86efac' }).setOrigin(0.5);

        // Spawn Dungeon Monster
        this.monster = this.add.sprite(600, 500, 'monster_ghoul');
        this.monsterHPText = this.add.text(600, 460, `Shadow Ghoul (HP: ${this.monsterHP}/100)`, {
            fontSize: '12px', color: '#fca5a5', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Spawn Player
        this.player = this.add.sprite(200, 200, 'player');

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

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.2);

        this.promptText = this.add.text(0, 0, '', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#fef08a',
            backgroundColor: '#0f172a', padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setVisible(false);

        EventBus.emit('current-scene-ready', this);
        EventBus.emit('zone-changed', 'dungeon_1');
    }

    override update() {
        const speed = 4;
        let vx = 0; let vy = 0;

        if (this.cursors.left?.isDown || this.keyWASD['A']?.isDown) vx = -speed;
        else if (this.cursors.right?.isDown || this.keyWASD['D']?.isDown) vx = speed;

        if (this.cursors.up?.isDown || this.keyWASD['W']?.isDown) vy = -speed;
        else if (this.cursors.down?.isDown || this.keyWASD['S']?.isDown) vy = speed;

        this.player.x += vx;
        this.player.y += vy;

        // Proximity checks
        const distPortal = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.returnPortal.x, this.returnPortal.y);
        const distMonster = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.monster.x, this.monster.y);

        if (distPortal < 60) {
            this.promptText.setPosition(this.returnPortal.x, this.returnPortal.y - 45).setText('[E] Return to Haven').setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                this.scene.start('SafeZoneScene');
            }
        } else if (distMonster < 70 && this.monsterHP > 0) {
            this.promptText.setPosition(this.monster.x, this.monster.y - 45).setText('[E] Attack Shadow Ghoul').setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                this.attackMonster();
            }
        } else {
            this.promptText.setVisible(false);
        }
    }

    private attackMonster() {
        const dmg = 25;
        this.monsterHP -= dmg;

        // Floating Damage Number
        const dmgText = this.add.text(this.monster.x, this.monster.y - 30, `-${dmg}`, {
            fontSize: '18px', color: '#ef4444', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: dmgText, y: dmgText.y - 40, alpha: 0, duration: 800,
            onComplete: () => dmgText.destroy()
        });

        if (this.monsterHP <= 0) {
            this.monsterHP = 0;
            this.monsterHPText.setText('Defeated! Respawning...');
            this.monster.setAlpha(0.3);
            EventBus.emit('dungeon-combat-victory', { enemy_id: 'monster_ghoul', reward_gold: 50, reward_xp: 100 });

            this.time.delayedCall(3000, () => {
                this.monsterHP = 100;
                this.monster.setAlpha(1);
                this.monsterHPText.setText('Shadow Ghoul (HP: 100/100)');
            });
        } else {
            this.monsterHPText.setText(`Shadow Ghoul (HP: ${this.monsterHP}/100)`);
        }
    }
}
