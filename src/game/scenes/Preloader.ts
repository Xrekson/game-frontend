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
    }

    create()
    {
        EventBus.emit('current-scene-ready', this);
        this.scene.start('SafeZoneScene');
    }
}
