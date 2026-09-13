import * as Phaser from 'phaser';
import { EventBus } from '../EventBus';

export class Preloader extends Phaser.Scene
{
    constructor()
    {
        super('Preloader');
    }

    init()
    {
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0x38bdf8);
        this.load.on('progress', (progress: number) =>
        {
            bar.width = 4 + (460 * progress);
        });
    }

    preload()
    {
        // SVG Assets (Item icons and fallback graphics)
        this.load.setPath('assets/svg');

        this.load.svg('player', 'player.svg', { width: 48, height: 48 });
        this.load.svg('npc_blacksmith', 'npc_blacksmith.svg', { width: 48, height: 48 });
        this.load.svg('npc_alchemist', 'npc_alchemist.svg', { width: 48, height: 48 });
        this.load.svg('monster_ghoul', 'monster_ghoul.svg', { width: 48, height: 48 });
        this.load.svg('portal', 'portal.svg', { width: 54, height: 54 });
        this.load.svg('gold_coin', 'gold_coin.svg', { width: 24, height: 24 });

        this.load.svg('wep_iron_sword', 'wep_iron_sword.svg', { width: 32, height: 32 });
        this.load.svg('wep_mana_blade', 'wep_mana_blade.svg', { width: 32, height: 32 });
        this.load.svg('arm_leather_vest', 'arm_leather_vest.svg', { width: 32, height: 32 });
        this.load.svg('arm_plate_armour', 'arm_plate_armour.svg', { width: 32, height: 32 });
        this.load.svg('arm_ring_power', 'arm_ring_power.svg', { width: 32, height: 32 });

        this.load.svg('weapon_iron_gladiator', 'weapon_iron_gladiator.svg', { width: 64, height: 64 });
        this.load.svg('weapon_havoc_axe', 'weapon_havoc_axe.svg', { width: 64, height: 64 });
        this.load.svg('weapon_stone_picker', 'weapon_stone_picker.svg', { width: 64, height: 64 });
        this.load.svg('crystal_vronti', 'crystal_vronti.svg', { width: 16, height: 16 });
        this.load.svg('crystal_fotia', 'crystal_fotia.svg', { width: 16, height: 16 });
        this.load.svg('crystal_aeras', 'crystal_aeras.svg', { width: 16, height: 16 });

        // Tiny Swords Assets (PixelFrog)
        this.load.setPath('assets/Tiny Swords');

        // Tileset & Water
        this.load.image('ts_tileset', 'Terrain/Tileset/Tilemap_color1.png');
        this.load.image('ts_tileset_red', 'Terrain/Tileset/Tilemap_color3.png');
        this.load.image('ts_tileset_grey', 'Terrain/Tileset/Tilemap_color4.png');
        this.load.image('ts_green_grass_tile', 'Terrain/Tileset/green_grass_tile.png');
        this.load.image('ts_grey_grass_tile', 'Terrain/Tileset/grey_grass_tile.png');
        this.load.image('ts_red_crypt_tile', 'Terrain/Tileset/red_crypt_tile.png');
        this.load.image('ts_water_bg', 'Terrain/Tileset/Water Background color.png');

        // Decorations & Rocks
        this.load.image('ts_rock1', 'Terrain/Decorations/Rocks/Rock1.png');
        this.load.image('ts_rock2', 'Terrain/Decorations/Rocks/Rock2.png');
        this.load.image('ts_rock3', 'Terrain/Decorations/Rocks/Rock3.png');
        this.load.image('ts_rock4', 'Terrain/Decorations/Rocks/Rock4.png');
        this.load.image('ts_tree1', 'Terrain/Resources/Wood/Trees/Tree1.png');
        this.load.image('ts_tree2', 'Terrain/Resources/Wood/Trees/Tree2.png');

        // Blue Haven Buildings
        this.load.image('ts_castle', 'Buildings/Blue Buildings/Castle.png');
        this.load.image('ts_house1', 'Buildings/Blue Buildings/House1.png');
        this.load.image('ts_house2', 'Buildings/Blue Buildings/House2.png');
        this.load.image('ts_barracks', 'Buildings/Blue Buildings/Barracks.png');
        this.load.image('ts_monastery', 'Buildings/Blue Buildings/Monastery.png');
        this.load.image('ts_tower', 'Buildings/Blue Buildings/Tower.png');

        // Red Crypt Buildings
        this.load.image('ts_red_tower', 'Buildings/Red Buildings/Tower.png');
        this.load.image('ts_red_castle', 'Buildings/Red Buildings/Castle.png');

        // Blue Units Spritesheets (192x192)
        this.load.spritesheet('ts_warrior_idle', 'Units/Blue Units/Warrior/Warrior_Idle.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('ts_warrior_run', 'Units/Blue Units/Warrior/Warrior_Run.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('ts_warrior_attack', 'Units/Blue Units/Warrior/Warrior_Attack1.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('ts_pawn_idle', 'Units/Blue Units/Pawn/Pawn_Idle.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('ts_monk_idle', 'Units/Blue Units/Monk/Idle.png', { frameWidth: 192, frameHeight: 192 });

        // Red Units Spritesheets (192x192)
        this.load.spritesheet('ts_red_warrior_idle', 'Units/Red Units/Warrior/Warrior_Idle.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('ts_red_warrior_attack', 'Units/Red Units/Warrior/Warrior_Attack1.png', { frameWidth: 192, frameHeight: 192 });
    }

    create()
    {
        // Global Sprite Animations Setup
        if (!this.anims.exists('warrior_idle'))
        {
            this.anims.create({
                key: 'warrior_idle',
                frames: this.anims.generateFrameNumbers('ts_warrior_idle', { start: 0, end: 7 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'warrior_run',
                frames: this.anims.generateFrameNumbers('ts_warrior_run', { start: 0, end: 5 }),
                frameRate: 12,
                repeat: -1
            });
            this.anims.create({
                key: 'warrior_attack',
                frames: this.anims.generateFrameNumbers('ts_warrior_attack', { start: 0, end: 3 }),
                frameRate: 12,
                repeat: 0
            });

            this.anims.create({
                key: 'pawn_idle',
                frames: this.anims.generateFrameNumbers('ts_pawn_idle', { start: 0, end: 7 }),
                frameRate: 8,
                repeat: -1
            });
            this.anims.create({
                key: 'monk_idle',
                frames: this.anims.generateFrameNumbers('ts_monk_idle', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            });

            this.anims.create({
                key: 'red_warrior_idle',
                frames: this.anims.generateFrameNumbers('ts_red_warrior_idle', { start: 0, end: 7 }),
                frameRate: 8,
                repeat: -1
            });
            this.anims.create({
                key: 'red_warrior_attack',
                frames: this.anims.generateFrameNumbers('ts_red_warrior_attack', { start: 0, end: 3 }),
                frameRate: 12,
                repeat: 0
            });
        }

        EventBus.emit('current-scene-ready', this);
        this.scene.start('SafeZoneScene');
    }
}
