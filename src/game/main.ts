import { Boot } from './scenes/Boot';
import { DungeonScene } from './scenes/DungeonScene';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { SafeZoneScene } from './scenes/SafeZoneScene';
import { PropertyScene } from './scenes/PropertyScene';
import { AUTO, Game } from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#0f172a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        SafeZoneScene,
        DungeonScene,
        PropertyScene
    ]
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
