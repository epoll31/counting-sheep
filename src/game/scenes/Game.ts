import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    sheep: Phaser.Physics.Arcade.Sprite;
    inAir: boolean = true;

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

        this.anims.createFromAseprite('sheep');
        this.sheep = this.physics.add.sprite(512, 383, 'sheep').setOrigin(0.5).setScale(5).setGravityY(400).setCollideWorldBounds(true, undefined, 0.3, true);
        this.sheep.play({
            key: 'jumping',
            repeat: -1,
        });

        const jump = (_: any) => {
            if (!this.inAir) {
                this.sheep.setVelocityY(-400);
                this.inAir = true;
                this.sheep.anims.play({ key: 'jumping', repeat: -1 });
            }
        }

        const spaceBar = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        const upKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        const wKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        spaceBar?.on('down', jump);
        upKey?.on('down', jump);
        wKey?.on('down', jump);
        this.input.on('pointerdown', jump);

        this.physics.world.on("worldbounds", (body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean, left: boolean, right: boolean) => {
            const { gameObject } = body;

            if (gameObject === this.sheep) {
                if (down && this.inAir && Math.abs(this.sheep.body?.velocity.y ?? 0) < 200) { //130 ~ second bounce, 200 ~ first bounce
                    this.sheep.anims.play({ key: 'running', repeat: -1 });
                    this.inAir = false;
                }
            }
        });

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        // console.log(this.sheep.body?.velocity.y);
    }


    changeScene() {
        this.scene.start('GameOver');
    }
}
