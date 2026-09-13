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
    private estatePortal!: Phaser.GameObjects.Sprite;

    // Green Grass Walkable Rectangles
    private walkablePaths: Phaser.Geom.Rectangle[] = [
        new Phaser.Geom.Rectangle(720, 180, 360, 240),   // Haven Citadel Plaza
        new Phaser.Geom.Rectangle(1150, 280, 360, 260),  // Blacksmith Forge Courtyard
        new Phaser.Geom.Rectangle(290, 280, 360, 260),   // Mystic Sanctuary Courtyard
        new Phaser.Geom.Rectangle(220, 480, 1360, 140),  // Main Horizontal Green Road
        new Phaser.Geom.Rectangle(820, 180, 160, 980),   // Main Vertical Green Road
        new Phaser.Geom.Rectangle(500, 880, 600, 220),   // South Portals Plaza
    ];

    constructor()
    {
        super('SafeZoneScene');
    }

    create()
    {
        this.cameras.main.setBackgroundColor(0x0f172a);
        const mapWidth = 1800;
        const mapHeight = 1400;

        // 1. Base Layer: Tiled Water Background
        const waterBg = this.add.tileSprite(mapWidth / 2, mapHeight / 2, mapWidth, mapHeight, 'ts_water_bg');
        waterBg.setAlpha(0.9);

        // 2. Unreachable Terrain: Grey Grass Tile Base
        const greyBase = this.add.tileSprite(mapWidth / 2, mapHeight / 2, 1560, 1160, 'ts_grey_grass_tile');

        // 3. Walkable Paths: Green Grass Tile Courtyards & Roads
        this.walkablePaths.forEach(rect => {
            this.add.tileSprite(rect.x + rect.width / 2, rect.y + rect.height / 2, rect.width, rect.height, 'ts_green_grass_tile');
        });

        // 4. Scatter Rocks & Trees on Unreachable Grey Grass
        const rockPositions = [
            { x: 200, y: 200, key: 'ts_rock1' }, { x: 1600, y: 200, key: 'ts_rock2' },
            { x: 200, y: 1200, key: 'ts_rock3' }, { x: 1600, y: 1200, key: 'ts_rock4' },
            { x: 700, y: 220, key: 'ts_rock2' }, { x: 1100, y: 220, key: 'ts_rock1' },
            { x: 220, y: 700, key: 'ts_rock4' }, { x: 1580, y: 700, key: 'ts_rock3' },
            { x: 400, y: 1150, key: 'ts_rock1' }, { x: 1350, y: 1150, key: 'ts_rock2' }
        ];
        rockPositions.forEach(r => {
            this.add.image(r.x, r.y, r.key).setScale(1.2);
        });

        const treePositions = [
            { x: 250, y: 230 }, { x: 1550, y: 230 }, { x: 250, y: 1150 }, { x: 1550, y: 1150 },
            { x: 720, y: 800 }, { x: 1080, y: 800 }
        ];
        treePositions.forEach(t => {
            this.add.image(t.x, t.y, 'ts_tree1').setScale(0.9);
        });

        // Tiny Swords Buildings
        // Castle (Haven Citadel)
        const castle = this.add.image(900, 300, 'ts_castle').setScale(1.2);
        this.add.text(900, 150, '🏰 Citadel of Haven', {
            fontFamily: 'sans-serif', fontSize: '16px', color: '#fef08a', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Monastery (Lyra's Sanctuary - Left side)
        const monastery = this.add.image(450, 380, 'ts_monastery').setScale(1.0);
        this.add.text(450, 270, '✨ Mystic Sanctuary', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#f0abfc', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Blacksmith Forge (Garrick's House - Right side)
        const forge = this.add.image(1350, 380, 'ts_house1').setScale(1.1);
        this.add.text(1350, 270, '⚒️ Garrick\'s Armory & Forge', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#fdba74', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Watchtowers & Barracks
        this.add.image(350, 850, 'ts_tower').setScale(1.0);
        this.add.image(1450, 850, 'ts_barracks').setScale(1.0);

        // Zone Banner HUD (Fixed to camera)
        this.add.text(20, 20, '🛡️ HAVEN TOWN SQUARE (SAFE ZONE)', {
            fontFamily: 'sans-serif', fontSize: '18px', color: '#4ade80', fontStyle: 'bold',
            backgroundColor: '#0f172a', padding: { x: 10, y: 6 }
        }).setScrollFactor(0).setDepth(100);

        // Spawn NPCs with Animations
        // Garrick Blacksmith (Pawn NPC)
        this.blacksmith = this.add.sprite(1280, 480, 'ts_pawn_idle').setScale(0.75);
        this.blacksmith.play('pawn_idle');
        this.add.text(1280, 530, 'Garrick (Blacksmith)', { fontSize: '13px', color: '#fdba74', fontStyle: 'bold' }).setOrigin(0.5);

        // Lyra Mystic (Monk NPC)
        this.alchemist = this.add.sprite(520, 480, 'ts_monk_idle').setScale(0.75);
        this.alchemist.play('monk_idle');
        this.add.text(520, 530, 'Lyra (Mystic)', { fontSize: '13px', color: '#f0abfc', fontStyle: 'bold' }).setOrigin(0.5);

        // Dungeon Portal
        this.dungeonPortal = this.add.sprite(900, 950, 'portal').setScale(1.3);
        this.tweens.add({
            targets: this.dungeonPortal,
            scaleX: 1.45, scaleY: 1.45,
            duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        this.add.text(900, 1010, '⚡ Crypt Dungeon Portal', {
            fontSize: '15px', color: '#67e8f9', fontStyle: 'bold',
            backgroundColor: '#0f172a', padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // Private Estate Portal
        this.estatePortal = this.add.sprite(650, 950, 'portal').setTint(0x34d399).setScale(1.3);
        this.tweens.add({
            targets: this.estatePortal,
            scaleX: 1.45, scaleY: 1.45,
            duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        this.add.text(650, 1010, '🏠 Private Estate / Properties', {
            fontSize: '15px', color: '#6ee7b7', fontStyle: 'bold',
            backgroundColor: '#0f172a', padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // Spawn Blue Warrior Player
        this.player = this.add.sprite(900, 550, 'ts_warrior_idle').setScale(0.75);
        this.player.play('warrior_idle');

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

        // Camera Setup
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.1);

        // Interaction Prompt Text
        this.promptText = this.add.text(0, 0, '', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#fef08a',
            backgroundColor: '#0f172a', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        EventBus.emit('current-scene-ready', this);
        EventBus.emit('zone-changed', 'safe_zone_1');
    }

    private isWalkable(x: number, y: number): boolean
    {
        return this.walkablePaths.some(rect => rect.contains(x, y));
    }

    override update()
    {
        const speed = 4.5;
        let vx = 0;
        let vy = 0;

        if (this.cursors.left?.isDown || this.keyWASD['A']?.isDown) vx = -speed;
        else if (this.cursors.right?.isDown || this.keyWASD['D']?.isDown) vx = speed;

        if (this.cursors.up?.isDown || this.keyWASD['W']?.isDown) vy = -speed;
        else if (this.cursors.down?.isDown || this.keyWASD['S']?.isDown) vy = speed;

        // Path Collision check: only move onto green grass paths
        const targetX = this.player.x + vx;
        const targetY = this.player.y + vy;

        if (vx !== 0 || vy !== 0)
        {
            if (this.isWalkable(targetX, targetY))
            {
                this.player.x = targetX;
                this.player.y = targetY;
            }
            else if (this.isWalkable(targetX, this.player.y))
            {
                this.player.x = targetX; // Wall slide X
            }
            else if (this.isWalkable(this.player.x, targetY))
            {
                this.player.y = targetY; // Wall slide Y
            }

            if (this.player.anims.currentAnim?.key !== 'warrior_run')
            {
                this.player.play('warrior_run');
            }
            if (vx < 0) this.player.setFlipX(true);
            else if (vx > 0) this.player.setFlipX(false);
        }
        else
        {
            if (this.player.anims.currentAnim?.key !== 'warrior_idle')
            {
                this.player.play('warrior_idle');
            }
        }

        // Proximity Checks
        const distCitadel = Phaser.Math.Distance.Between(this.player.x, this.player.y, 900, 300);
        const distBlacksmith = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.blacksmith.x, this.blacksmith.y);
        const distAlchemist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.alchemist.x, this.alchemist.y);
        const distPortal = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.dungeonPortal.x, this.dungeonPortal.y);
        const distEstate = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.estatePortal.x, this.estatePortal.y);

        if (distCitadel < 90)
        {
            this.promptText.setPosition(900, 210).setText('👑 [E] Citadel Royal Throne - Prestige Rank Up').setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE))
            {
                EventBus.emit('open-prestige-modal');
            }
        }
        else if (distBlacksmith < 70)
        {
            this.promptText.setPosition(this.blacksmith.x, this.blacksmith.y - 50).setText('[E] Talk to Garrick (Blacksmith)').setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE))
            {
                EventBus.emit('open-npc-shop', {
                    id: 'npc_blacksmith',
                    name: 'Garrick the Blacksmith',
                    dialogue: 'Welcome traveler! Upgrade your armaments and forge high attribute gear here.',
                    shop_item_template_ids: ['weapon_stone_picker', 'weapon_iron_gladiator', 'weapon_havoc_axe', 'wep_iron_sword', 'arm_plate_armour']
                });
            }
        }
        else if (distAlchemist < 70)
        {
            this.promptText.setPosition(this.alchemist.x, this.alchemist.y - 50).setText('[E] Talk to Lyra (Mystic)').setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE))
            {
                EventBus.emit('open-npc-shop', {
                    id: 'npc_alchemist',
                    name: 'Lyra the Mystic',
                    dialogue: 'Seeking rare elemental crystals and mystical trinkets? Peruse my collection.',
                    shop_item_template_ids: ['arm_ring_power', 'wep_mana_blade', 'arm_leather_vest']
                });
            }
        }
        else if (distPortal < 70)
        {
            this.promptText.setPosition(this.dungeonPortal.x, this.dungeonPortal.y - 55).setText('[E] Enter Shadow Crypt Dungeon').setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE))
            {
                this.scene.start('DungeonScene');
            }
        }
        else if (distEstate < 70)
        {
            this.promptText.setPosition(this.estatePortal.x, this.estatePortal.y - 55).setText('[E] Enter Private Estate / Properties').setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE))
            {
                this.scene.start('PropertyScene');
            }
        }
        else
        {
            this.promptText.setVisible(false);
        }
    }
}


