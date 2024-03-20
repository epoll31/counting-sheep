import { EventBus } from '../EventBus';
import { Scene } from 'phaser';


class Fence {
    parallax: number;
    parallax_center: number;
    parallax_range: number;
    collider: Phaser.GameObjects.Rectangle;
    front_post: Phaser.GameObjects.Sprite;
    back_post: Phaser.GameObjects.Sprite;
    rows: Phaser.GameObjects.Rectangle[];
    row_count: number;
    prevFenceX: number;

    constructor(game: Game, startX: number) {
        this.parallax = 50;
        this.parallax_center = 1200;
        this.parallax_range = 2000;

        this.collider = game.add.rectangle(startX, 300, 10, 60, 0x000000, 0.0).setOrigin(0.5, 1);
        this.prevFenceX = this.collider.x;
        this.front_post = game.add.sprite(startX, 300, 'fence-post').setOrigin(0.5, 1).setScale(3.5).setDepth(0.1).setTint(0x8f563b);
        // this.front_post.setAlpha(0.9);
        this.back_post = game.add.sprite(startX, 300, 'fence-post').setOrigin(0.5, 1).setScale(3).setDepth(-0.1).setTint(0x8f563b);
        // this.back_post.setAlpha(0.8);
        this.rows = [];
        this.row_count = 5;
        for (let i = 0; i < this.row_count; i++) {
            this.rows.push(game.add.rectangle(startX, 300, 20, 4, 0x663931, 2).setOrigin(0, 0).setDepth(-0.05));
        }
        this.collider = game.physics.add.existing(this.collider);
    }

    /**
     * @param game the current scene
     * @returns whether the fence is off the screen
     */
    update(game: Game): boolean {
        this.prevFenceX = this.collider.x;
        this.collider.x -= game.speed;

        if (this.collider.x < -100) {
            return true;
        }

        const parallax = (this.parallax_center - this.collider.x) / this.parallax_range * this.parallax;
        this.front_post.x = this.collider.x + parallax * 1;
        this.back_post.x = this.collider.x - parallax * 0.5;

        for (let i = 0; i < this.row_count; i++) {
            this.rows[i].x = this.front_post.x;

            const h1 = (this.front_post.displayHeight * 0.95) / this.row_count * i;
            const h2 = (this.back_post.displayHeight * 0.95) / this.row_count * i;
            const w = this.back_post.x - this.front_post.x;

            const width = Math.sqrt(w * w + (h2 - h1) * (h2 - h1));
            this.rows[i].displayWidth = width;
            this.rows[i].angle = Math.atan2(h1 - h2, w) * 180 / Math.PI;
            this.rows[i].y = this.front_post.y - h1;
        }


        return false;
    }
}

class Background {
    parallax: number;
    parallax_center: number;
    parallax_range: number;
    fencePostCount: number;
    fenceRowCount: number;
    fencePosts: Phaser.GameObjects.Sprite[];
    fenceRows: Phaser.GameObjects.Rectangle[];
    timer: number;
    hills: Phaser.GameObjects.Sprite[];
    hillTags: Phaser.Animations.Animation[];
    hillColors: number[];
    rand: Phaser.Math.RandomDataGenerator;

    constructor(game: Game) {
        this.timer = 0;

        this.parallax = 50;
        this.parallax_center = 900;
        this.parallax_range = 1000;

        this.fencePostCount = 10;
        this.fenceRowCount = 5;
        this.fencePosts = [];
        this.fenceRows = [];
        this.rand = new Phaser.Math.RandomDataGenerator();
        for (let i = 0; i < this.fencePostCount; i++) {
            this.fencePosts.push(game.add.sprite(1200 / this.fencePostCount * i, 300, 'fence-post').setOrigin(0.5, 1).setScale(2.5).setDepth(-0.2).setTint(0x70432e));
            this.fencePosts[i].setDisplaySize(this.fencePosts[i].displayWidth, this.fencePosts[i].displayHeight * this.rand.realInRange(0.9, 1.1));
            for (let i = 0; i < this.fenceRowCount; i++) {
                this.fenceRows.push(game.add.rectangle(0, 0, 1, 3, 0x663931, 0.8).setOrigin(0, 0).setDepth(-0.3));
            }
        }

        this.hillTags = game.anims.createFromAseprite('hills');
        this.hills = [];
        this.hillColors = [0x6abe30, 0x4b692f, 0x99512c]
        for (let i = 0; i < 5; i++) {
            this.hills.push(game.add.sprite(this.rand.integerInRange(0, 1000), 300 + 50 * i, 'hills').setOrigin(0.5, 1).setDepth(-0.4).setTint(this.hillColors[Phaser.Math.RND.integerInRange(0, this.hillColors.length - 1)]));
            this.hills[i].play({
                key: this.hillTags[this.rand.integerInRange(0, this.hillTags.length - 1)].key,
                repeat: -1,
            });
            // const tint = this.rand.integerInRange(0, 255);
            // this.hills[i].setTint(tint << 16 | tint << 8 | tint);
            // this.hills[i].setAlpha(i / 5);
            // this.hills[i].setAlpha(0.7);
        }
    }

    update(game: Game) {
        for (let i = 0; i < this.fencePostCount; i++) {
            this.fencePosts[i].x -= game.speed * 1.1;
            if (this.fencePosts[i].x < -100) {
                this.fencePosts[i].x = 1100;
            }

            const prev = i === 0 ? this.fencePosts[this.fencePostCount - 1] : this.fencePosts[i - 1];
            const prevx = prev.x > this.fencePosts[i].x ? this.fencePosts[i].x - 1200 / this.fencePostCount : prev.x;
            for (let j = 0; j < this.fenceRowCount; j++) {
                const h1 = (prev.displayHeight * 0.95) / this.fenceRowCount * j;
                const h2 = (this.fencePosts[i].displayHeight * 0.95) / this.fenceRowCount * j;
                const w = this.fencePosts[i].x - prevx;

                const width = Math.sqrt(w * w + (h2 - h1) * (h2 - h1));
                this.fenceRows[i * this.fenceRowCount + j].x = prevx;
                this.fenceRows[i * this.fenceRowCount + j].displayWidth = width;
                this.fenceRows[i * this.fenceRowCount + j].angle = Math.atan2(h1 - h2, w) * 180 / Math.PI;
                this.fenceRows[i * this.fenceRowCount + j].y = prev.y - h1;
            }
        }

        for (let i = 0; i < this.hills.length; i++) {
            this.hills[i].x -= game.speed * 0.2 * (i + 1);
            if (this.hills[i].x < -500) {
                this.hills[i].x = 1500
                this.hills[i].y = 300 + + 50 * i;
                this.hills[i].play({
                    key: this.hillTags[this.rand.integerInRange(0, this.hillTags.length - 1)].key,
                    repeat: -1,
                });
                this.hills[i].setTint(this.hillColors[Phaser.Math.RND.integerInRange(0, this.hillColors.length - 1)]);
                // const tint = this.rand.integerInRange(0, 255);
                // this.hills[i].setTint(tint << 16 | tint << 8 | tint);
            }

        }
    }
}

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Background;
    sheep: Phaser.Physics.Arcade.Sprite;
    fences: Fence[];
    inAir: boolean;
    dead: boolean;
    speed: number;
    canAddScore: boolean;
    score: number;
    scoreLabel: Phaser.GameObjects.Text;
    timer: Phaser.Time.TimerEvent;
    sheepReachedTarget: boolean;

    constructor() {
        super('Game');
    }

    preload() {
        this.load.aseprite('sheep', 'assets/sheep.png', 'assets/sheep.json');
        this.load.image('fence', 'assets/fence.png');
        this.load.image('fence-post', 'assets/fence-post.png');
        this.load.image('back-fence-post', 'assets/back-fence-post.png');
        this.load.aseprite('hills', 'assets/hills.png', 'assets/hills.json');
    }

    create() {
        this.inAir = true;
        this.dead = false;
        this.speed = 3;
        this.canAddScore = true;
        this.score = 0;
        this.sheepReachedTarget = false;

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x9ed3fe);

        this.background = new Background(this);

        this.anims.createFromAseprite('sheep');
        this.sheep = this.physics.add.sprite(0, 300, 'sheep').setOrigin(0.5, 1).setScale(5).setDepth(0).setGravityY(600).setCollideWorldBounds(true, undefined, 0.3, true);
        this.sheep.play({
            key: 'jumping',
            repeat: -1,
        });

        this.fences = [];
        for (let i = 0; i < 2; i++) {
            this.fences.push(new Fence(this, 1100 + i * 600));

            this.physics.add.collider(this.sheep, this.fences[i].collider, () => {
                if (this.dead) return;
                this.sheep.setVelocityY(-75);
                this.sheep.play({
                    key: 'dead',
                    repeat: 0,
                });
                this.timer = this.time.delayedCall(5000, () => {
                    this.changeScene();
                });
                this.dead = true;

                const distFromHeadToFence = Math.abs(this.fences[i].collider.x - (this.sheep.x + this.sheep.displayWidth / 2));
                console.log(distFromHeadToFence);
                this.speed = -(distFromHeadToFence / 10 + 3);

            }, undefined, this);
        }

        const jump = () => {
            if (!this.inAir && !this.dead) {
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
        this.input.on('pointerdown', () => {
            if (this.dead) {
                this.changeScene();
            }
            else {
                jump();
            }
        });

        this.input.keyboard?.on('keydown', (_: KeyboardEvent) => {
            if (this.dead) {
                this.changeScene();
            }
        });

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
        this.background.update(this);
        let lastFencePassed = -1;

        for (let i = 0; i < this.fences.length; i++) {
            if (this.fences[i].update(this)) {
                if (this.dead) {
                    this.changeScene();
                }
                else {
                    this.fences[i].collider.x = 1100;
                }
            }

            if (this.fences[i].collider.x < this.sheep.x && lastFencePassed !== i) {
                lastFencePassed = i;
            }
        }

        if (lastFencePassed >= 0 && this.fences[lastFencePassed].prevFenceX >= this.sheep.x && !this.canAddScore) {
            this.canAddScore = true;
        }


        if (!this.dead && this.canAddScore) {
            this.score++;
            this.scoreLabel.setText(`Score: ${this.score}`);
            this.canAddScore = false;
            if (this.score % 5 === 0) {
                this.speed += 0.5;
            }
        }
        else if (this.dead) {
            this.speed = Phaser.Math.Linear(this.speed, 0, 0.1);
        }

        if (!this.sheepReachedTarget) {
            this.sheep.x = Phaser.Math.Linear(this.sheep.x, 400, 0.01);
            // console.log(this.sheep.x);
            if (this.sheep.x > 375) {
                this.sheepReachedTarget = true;
            }
        }
    }


    changeScene() {
        this.scene.start('MainMenu');
    }
}
