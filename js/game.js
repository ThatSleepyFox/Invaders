/// <reference path="./types/index.d.ts" />

/*

    TODO:
    -Több elleséges sprite készítése
    -Ellenség mozgatása
    -Ellenség tüzelése
    -Hitboxok kezelése
    -HP kezelése
    -HP sprite létrehozása
    -Score rendszer implementálása
    -Endscreen implementálása
    -Pause menü implementálása
    -Képesség létrehozása
    -Képességhez tartozó sprite létrehozása
    -Hangok implementálása

*/

class MenuScene extends Phaser.Scene{

    constructor(){
        super({
            key: 'MainMenu'
        });
    }

    preload(){
        this.load.image('menuBackground', 'assets/menu/mainmenu.png');
        this.load.image('logo', 'assets/menu/logoText.png');
        this.load.image('press', 'assets/menu/pressText.png');
    }
    create(){
        this.menubackground = this.add.sprite(0,0, 'menuBackground');
        this.menubackground.setOrigin(0,0);
        this.logo = this.add.sprite(180, 180, 'logo');
        this.startButton = this.add.sprite(180, 320, 'press');

        this.tweens.add({
            targets: this.logo,
            scale: {
                from: 1,
                to: 1.2
            },
            duration: 1000,
            yoyo: true,
            repeat: -1,
        });

        this.tweens.add({
            targets: this.startButton,
            angle: { from: -15, to: 15 }, 
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

    }
    update(){
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        if(Phaser.Input.Keyboard.JustDown(this.spacebar)){
            this.scene.start('GameScene');
        }
    }
}

class GameScene extends Phaser.Scene{
    constructor(){
        super({
            key: 'GameScene'
        });
    }
    init() {
        this.playerSpeed = 200;
        this.playerBulletSpeed = 300;
        this.reloadTimer = 3000;

        this.enemySpeed = 150;
        this.enemyBulletSpeed = 300; 
    }
    preload(){
        this.load.image('background', 'assets/background.png');
        this.load.image('ship', 'assets/enemy01.png');
        this.load.image('enemy', 'assets/enemy02.png');
        this.load.spritesheet('shield', 'assets/shiled.png', {
            frameWidth:96,
            frameHeight: 32,
            margin: 0,
            spacing: 0
        });
        this.load.spritesheet('meteor', 'assets/meteor.png', {
            frameWidth:16,
            frameHeight: 32,
            margin: 0,
            spacing: 0
        });

        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('enemybullet', 'assets/enemybullet.png');
    }
    create(){
        //Háttér
        this.background = this.add.sprite(0,0, 'background');
        this.background.setOrigin(0,0);

        //Játékos
        this.player = this.add.sprite(180, 580, 'ship');
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        
        //Ellenség
        this.enemy = this.add.sprite(180, 50, 'enemy');
        this.enemy.setFlip(0, 1);

        //Játékos lövedék
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 15,
        });

        this.ammoText = this.add.text(this.player.x-16, this.player.y, '', {
            font:'20px Arial',
            fill: '#ffffff'
        });

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cursor = this.input.keyboard.createCursorKeys();
    }
    update(){
        const ammoCounter = this.bullets.getTotalFree();
        if(ammoCounter == 0){
            this.ammoText.setText("Reloading");
        }

        this.ammoText.setPosition(this.player.x+16, this.player.y-5);
        if(Phaser.Input.Keyboard.JustDown(this.spacebar)){

            this.onShooting();
            this.onAmmoCount();
        }
        if(this.cursor.right.isDown){
            this.player.body.setVelocityX(this.playerSpeed);

        }
        else if(this.cursor.left.isDown){
            this.player.body.setVelocityX(-this.playerSpeed);
        }
        else {
            this.player.body.setVelocityX(0);
        }
    }

    onShooting(){
        const bullet = this.bullets.get();
        if(bullet){
            bullet.setActive(true).setVisible(true);
            bullet.setPosition(this.player.x, this.player.y);
            bullet.body.velocity.y = -this.playerBulletSpeed;
        } else {
            this.time.delayedCall(this.reloadTimer, () => {
                this.onReload();
                this.onAmmoCount();
            });
        }
    }
    onReload(){
        this.bullets.clear(true, true);
    }

    onAmmoCount(){
        const leftAmmo = this.bullets.getTotalFree();
        const maxAmmo = this.bullets.maxSize;
        this.ammoText.setText(`${leftAmmo}/${maxAmmo}`);
    }
}

const gameScene = new GameScene('game');
const menuScene = new MenuScene('menu');

const game = new Phaser.Game({
    width: 360,
    height: 640,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 0
            },
            debug: false
        }
    },
    scene: [menuScene, gameScene]
});