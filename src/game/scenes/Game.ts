import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    sheep: Phaser.Physics.Arcade.Sprite;
    inAir: boolean = true;
    fence: Phaser.GameObjects.Sprite;
    fenceCollider: Phaser.GameObjects.Rectangle;
    dead: boolean = false;
    speed: number = 2;
    canAddScore: boolean = true;
    score: number = 0;
    scoreLabel: Phaser.GameObjects.Text;

    constructor() {
        super('Game');
    }

    preload() {
        this.load.aseprite('sheep', 'assets/sheep.png', 'assets/sheep.json');
        this.load.image('fence', 'assets/fence.png');
    }

    create() {
        this.inAir = true;
        this.dead = false;
        this.speed = 2;
        this.canAddScore = true;
        this.score = 0;

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x9ed3fe);

        this.anims.createFromAseprite('sheep');
        this.sheep = this.physics.add.sprite(512, 383, 'sheep').setOrigin(0.5).setScale(5).setGravityY(400).setCollideWorldBounds(true, undefined, 0.3, true);
        this.sheep.play({
            key: 'jumping',
            repeat: -1,
        });


        // this.fenceCollider = this.physics.add.body(1100, 200, 10, 100);
        // this.fenceCollider.setVelocityX(-100);
        this.fence = this.add.sprite(1100, 300, 'fence').setOrigin(0.5, 1).setScale(5);
        this.fenceCollider = this.add.rectangle(900, 300, 10, 80, 0x000000, 0.0).setOrigin(0.5, 1);
        this.physics.add.existing(this.fenceCollider);

        this.physics.add.collider(this.sheep, this.fenceCollider, () => {
            if (this.dead) return;
            this.sheep.setVelocityY(-75);
            this.sheep.play({
                key: 'dead',
                repeat: 0,
            });
            this.dead = true;
        }, undefined, this);

        const jump = (_: any) => {
            if (!this.inAir && !this.dead) {
                this.sheep.setVelocityY(-350);
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
                if (down && !this.dead && this.inAir && Math.abs(this.sheep.body?.velocity.y ?? 0) < 200) { //130 ~ second bounce, 200 ~ first bounce
                    this.sheep.anims.play({ key: 'running', repeat: -1 });
                    this.inAir = false;
                }
            }
        });

        this.scoreLabel = this.add.text(10, 10, 'Score: 0', { fontSize: '32px', color: '#000' }).setScrollFactor(0);

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        if (this.fenceCollider.x < -100) {
            this.fenceCollider.x = 1100;
            this.canAddScore = true;

            if (this.dead) {
                this.changeScene();
            }
        }
        this.fenceCollider.x -= this.speed;
        this.fence.x = this.fenceCollider.x;

        if (!this.dead && this.canAddScore && this.fence.x < this.sheep.x) {
            this.score++;
            this.scoreLabel.setText(`Score: ${this.score}`);
            this.canAddScore = false;
            if (this.score % 5 === 0) {
                this.speed += 0.5;
            }
        }
    }


    changeScene() {
        this.scene.start('MainMenu');
    }
}
