/// <reference path="./types/index.d.ts" />

let playerScore = 0;
class EndScene extends Phaser.Scene{
    constructor(){
        super({
            key: 'EndScene'
        });
    }

    preload(){
        this.load.image('endBackground', 'assets/menu/mainmenu.png');
        this.load.image('gameOver', 'assets/end/gameover.png');
        this.load.image('finalScore', 'assets/end/score.png');
    }

    create(){
        this.endbackground = this.add.sprite(0,0, 'endBackground');
        this.endbackground.setOrigin(0,0);

        this.finalscore = this.add.sprite(180, 320, 'finalScore');

        this.gameover = this.add.sprite(180,260, 'gameOver');
        this.tweens.add({
            targets: this.gameover,
            scale: {
                from: 1,
                to: 1.1
            },
            duration: 1000,
            yoyo: true,
            repeat: -1,
        });

        this.scoreText = this.add.text(160, 360, playerScore, {
            font:'20px Arial',
            fill: '#ffffff',
            align: 'center'
        });

    }
    update(){
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        if(Phaser.Input.Keyboard.JustDown(this.spacebar)){
            this.scene.stop();
            playerScore = 0;
        }
    }
}

class MenuScene extends Phaser.Scene{

    constructor(){
        super({
            key: 'MainMenu'
        });
    }

    preload(){
        this.load.audio('backgroundMusic', 'assets/music/gameplayMusic.mp3');
        this.load.image('menuBackground', 'assets/menu/mainmenu.png');
        this.load.image('logo', 'assets/menu/logoText.png');
        this.load.image('press', 'assets/menu/pressText.png');
    }
    create(){
        this.backgroundmusic = this.sound.add('backgroundMusic', {
            volume: 0.5,
            loop: true
        });
        this.backgroundmusic.play();

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
            repeat: -1
        });

    }
    update(){
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        if(Phaser.Input.Keyboard.JustDown(this.spacebar)){
            this.scene.start('GameScene');
        }
    }
}

class PauseScene extends Phaser.Scene{
    constructor(){
        super({
            key: 'PauseScene'
        });
    }

    preload(){
        this.load.image('pauseText', 'assets/pause/pauseText.png');
    }

    create(){
        this.pauseText = this.add.sprite(180,320, "pauseText");
        this.tweens.add({
            targets: this.pauseText,
            scale: {
                from: 1,
                to: 1.1 
            },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        this.escape = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    update(){
        if(Phaser.Input.Keyboard.JustDown(this.escape)){
            this.scene.stop();
            this.scene.resume('GameScene');
        }
    }
}



class GameScene extends Phaser.Scene{
    constructor(){
        super({
            key: 'GameScene'
        });
        this.levelCounter = 0;
    }
    init() {
        this.playerSpeed = 200;
        this.playerBulletSpeed = 300;
        this.reloadTimer = 3000;

        this.playerHealth = 3;

        this.enemySpeed = 100;
        this.enemyBulletSpeed = 300; 
        this.isSpellReady = 1;
        this.isSpellActive = 0;
    }
    preload(){


        this.load.image('background', 'assets/background.png');
        this.load.image('ship', 'assets/enemy01.png');
        this.load.image('enemy', 'assets/enemy02.png');
        this.load.image('enemy2', 'assets/enemy03.png');
        this.load.spritesheet('shield', 'assets/shiled.png', {
            frameWidth:32,
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

        this.load.spritesheet('health', 'assets/health.png', {
            frameWidth:32,
            frameHeight: 32,
            margin: 0,
            spacing: 0
        });

        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('enemybullet', 'assets/enemybullet.png');
    }
    create(){

        this.levelCounter++;
        //Háttér
        this.background = this.add.sprite(0,0, 'background');
        this.background.setOrigin(0,0);


        //Játékos
        this.onCreatePlayer();


        this.health1 = this.add.sprite(20,20, 'health', 0);
        this.health2 = this.add.sprite(50,20, 'health', 0);
        this.health3 = this.add.sprite(80,20, 'health', 0); 

        //Pajzs  
        this.anims.create({  
            key: 'shield',
            frames: this.anims.generateFrameNumbers('shield', {start: 0, end: 2}),
            frameRate: 8,
            repeat: -1
        });
        
        this.shieldSprite = this.add.sprite(-100, -100, 'shield'); 
        this.shieldSprite.play('shield');

        //Ellenség
        this.onCreateEnemy();

        //Ellenség lövedék
        this.enemyBullets = this.physics.add.group({
            defaultKey: 'enemybullet'
        });

        //Játékos lövedék
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 15
        });

        this.ammoText = this.add.text(this.player.x-16, this.player.y, '', {
            font:'20px Arial',
            fill: '#ffffff'
        });

        this.add.text(160, 20, `Level: ${this.levelCounter}`, {
             font: '20px Arial',
            fill: '#ffffff'
        });


        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escape = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.cursor = this.input.keyboard.createCursorKeys();
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.physics.add.overlap(this.player, this.enemyBullets, this.onRecieveDamage, null, this);
        this.physics.add.overlap(this.enemies, this.bullets, this.onDealDamage, null, this);

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

        if(Phaser.Input.Keyboard.JustDown(this.escape)){
            this.scene.pause();
            this.scene.launch('PauseScene');
        }

        if(Phaser.Input.Keyboard.JustDown(this.keyE)){
            if(this.isSpellReady == 1){
                this.isSpellReady = 0;
                this.isSpellActive = 1;
            }
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

        const enemyBulletEntity = this.enemyBullets.getChildren();
        for(let i = 0; i < this.bullets.length; i++){
            const eBullet = enemyBulletEntity[i];
            if(eBullet.active && this.bullets.y > 360){
                this.enemyBullets.killAndHide(eBullet);
            }
        }

        if (this.enemies && this.enemies.countActive(true) <= 0) {
            this.scene.restart();
        }

        if(this.isSpellActive == 1){
            this.shieldSprite.setPosition(this.player.x, this.player.y);
            this.time.delayedCall(3000, () => {
                this.isSpellActive = 0;
            });
        } else {
            this.shieldSprite.setPosition(-100,-100);
            this.time.delayedCall(10000, () => {
                this.isSpellReady = 1;
            });
        }

    }


    onDealDamage(enemy, bullet){
        bullet.setVisible(false);
        bullet.setActive(false);
        playerScore += 1000;
        this.enemies.killAndHide(enemy);
        this.enemies.remove(enemy, true, true);
        this.onAmmoCount();
    }

    onRecieveDamage(player, bullet){
        if(this.isSpellActive == 1){
            return;
        }
        this.enemyBullets.killAndHide(bullet);
        bullet.body.enable = false

        const health = this.playerHealth;
        this.playerHealth--;

        this.cameras.main.shake(200, 0.01);
        switch(health){
            case 1:{
                this.scene.restart();
                this.scene.launch('EndScene');
                break;
            }
            case 2:{
                this.health2.setFrame(1);
                break;
            }
            case 3:{
                this.health3.setFrame(1);
                break;
            }
        }
    }

    onCreatePlayer(){
        this.player = this.add.sprite(180, 580, 'ship');
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
    }

    onCreateEnemy(){
        this.enemies = this.physics.add.group({
            collideWorldBounds: true,
            bounceX: 1
        });
        for(let i = 0; i < 5; i++){
            const x = Phaser.Math.Between(50, 600);
            const y = Phaser.Math.Between(50, 300);

            const random = Phaser.Math.Between(0,1);
            switch(random){
                case 0:{
                    const enemy = this.enemies.create(x , y, 'enemy');
                    enemy.setVelocity(this.enemySpeed, 0);
                    enemy.setFlip(0, 1);
                    break;
                }
                case 1: {
                    const enemy = this.enemies.create(x , y, 'enemy2');
                    enemy.setVelocity(this.enemySpeed, 0);
                    enemy.setFlip(0, 1);
                    break;
                }
            }
        }
        this.physics.add.collider(this.enemies, this.enemies);
        
        this.time.addEvent({
            delay: 1000,
            callback: this.onEnemyShooting,
            callbackScope: this,
            loop: true
        });
    }

    onEnemyShooting() {
        const enemies = this.enemies.getChildren();
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i]; 
            const bullet = this.enemyBullets.get();
            if(enemy && enemy.active){
                if (bullet) {
                    bullet.body.enable = true;
                    bullet.setActive(true).setVisible(true);
                    bullet.setPosition(enemy.x, enemy.y);
                    bullet.body.velocity.y = this.enemySpeed; 
                }
            }
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
const pauseScene = new PauseScene('pause');
const endScene = new EndScene('end');

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
    audio: {
        disableWebAudio: false
    },
    scene: [menuScene, gameScene, pauseScene, endScene]
});