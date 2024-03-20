import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    sheep: any;

    constructor() {
        super('Game');
    }

    preload() {
        this.load.aseprite('sheep', 'assets/sheep.png', 'assets/sheep.json');
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x9ed3fe);
        // this.add.image(10, 10, 'sheep').setOrigin(0).setDepth(100).setScale(0.2);

        const tags = this.anims.createFromAseprite('sheep');
        console.log(tags);
        const sprite = this.add.sprite(512, 383, 'sheep').setOrigin(0.5).setScale(5);
        sprite.play({
            key: 'running',
            // frameRate: 60,
            repeat: -1
        });

        EventBus.emit('current-scene-ready', this);
    }


    changeScene() {
        this.scene.start('GameOver');
    }
}
