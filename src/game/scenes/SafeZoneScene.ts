import * as Phaser from 'phaser';
import { EventBus } from '../EventBus';

export class SafeZoneScene extends Phaser.Scene
{
    private player!: Phaser.GameObjects.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private keyWASD!: { [key: string]: Phaser.Input.Keyboard.Key };
    private keyE!: Phaser.Input.Keyboard.Key;
    private promptText!: Phaser.GameObjects.Text;

    private blacksmith!: Phaser.GameObjects.Sprite;
    private alchemist!: Phaser.GameObjects.Sprite;
    private dungeonPortal!: Phaser.GameObjects.Sprite;

    constructor()
    {
        super('SafeZoneScene');
    }

    create()
    {
        this.cameras.main.setBackgroundColor(0x0f172a);

        // Draw 2D Safe Zone Tile Grid
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x1e293b, 0.5);
        for (let x = 0; x < 1000; x += 40)
        {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, 1000);
        }
        for (let y = 0; y < 1000; y += 40)
        {
            graphics.moveTo(0, y);
            graphics.lineTo(1000, y);
        }
        graphics.strokePath();

        // Zone Title
        this.add.text(20, 20, '🛡️ HAVEN TOWN SQUARE (SAFE ZONE)', {
            fontFamily: 'sans-serif', fontSize: '18px', color: '#4ade80', fontStyle: 'bold'
        }).setScrollFactor(0);

        // Spawn NPCs
        this.blacksmith = this.add.sprite(300, 300, 'npc_blacksmith');
        this.add.text(300, 335, 'Garrick (Blacksmith)', { fontSize: '12px', color: '#fdba74' }).setOrigin(0.5);

        this.alchemist = this.add.sprite(600, 300, 'npc_alchemist');
        this.add.text(600, 335, 'Lyra (Mystic)', { fontSize: '12px', color: '#f0abfc' }).setOrigin(0.5);

        // Dungeon Portal
        this.dungeonPortal = this.add.sprite(800, 500, 'portal');
        this.add.text(800, 540, '⚡ Dungeon Portal', { fontSize: '14px', color: '#67e8f9', fontStyle: 'bold' }).setOrigin(0.5);

        // Spawn Player Sprite
        this.player = this.add.sprite(500, 500, 'player');

        // Setup Controls
        if (this.input.keyboard)
        {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.keyWASD = {
                W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            };
            this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        }

        // Camera follow
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.2);

        // Interaction Prompt Text
        this.promptText = this.add.text(0, 0, '', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#fef08a',
            backgroundColor: '#0f172a', padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setVisible(false);

        EventBus.emit('current-scene-ready', this);
        EventBus.emit('zone-changed', 'safe_zone_1');
    }

    override update()
    {
        console.log("yoooooy!");
        const speed = 4;
        let vx = 0;
        let vy = 0;

        if (this.cursors.left?.isDown || this.keyWASD['A']?.isDown) vx = -speed;
        else if (this.cursors.right?.isDown || this.keyWASD['D']?.isDown) vx = speed;

        if (this.cursors.up?.isDown || this.keyWASD['W']?.isDown) vy = -speed;
        else if (this.cursors.down?.isDown || this.keyWASD['S']?.isDown) vy = speed;

        this.player.x += vx;
        this.player.y += vy;

        // Proximity Checks
        const distBlacksmith = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.blacksmith.x, this.blacksmith.y);
        const distAlchemist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.alchemist.x, this.alchemist.y);
        const distPortal = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.dungeonPortal.x, this.dungeonPortal.y);

        if (distBlacksmith < 60)
        {
            this.promptText.setPosition(this.blacksmith.x, this.blacksmith.y - 40).setText('[E] Talk to Blacksmith').setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE))
            {
                EventBus.emit('open-npc-shop', { id: 'npc_blacksmith', name: 'Garrick the Blacksmith', dialogue: 'Welcome traveler! Look at my weapons and armours.', shop_item_template_ids: ['wep_iron_sword', 'wep_mana_blade', 'arm_leather_vest', 'arm_plate_armour'] });
            }
        } else if (distAlchemist < 60)
        {
            this.promptText.setPosition(this.alchemist.x, this.alchemist.y - 40).setText('[E] Talk to Mystic').setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE))
            {
                EventBus.emit('open-npc-shop', { id: 'npc_alchemist', name: 'Lyra the Mystic', dialogue: 'Seeking grand power? Behold the legendary artifacts.', shop_item_template_ids: ['arm_ring_power'] });
            }
        } else if (distPortal < 60)
        {
            this.promptText.setPosition(this.dungeonPortal.x, this.dungeonPortal.y - 45).setText('[E] Enter Crypt Dungeon').setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE))
            {
                this.scene.start('DungeonScene');
            }
        } else
        {
            this.promptText.setVisible(false);
        }
    }
}
