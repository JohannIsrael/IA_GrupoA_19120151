export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'game' });
    }

    preload() {
        this.load.image('background', 'assets/game/background.avif');
        this.load.spritesheet('character', 'assets/sprites/altair.png', { frameWidth: 32, frameHeight: 48 });
        this.load.image('ship', 'assets/game/ufo.png');
        this.load.image('ship2', 'assets/game/ufo.png');
        this.load.image('ship3', 'assets/game/ufo.png');
        this.load.image('bullet', 'assets/sprites/purple_ball.png');
        this.load.image('menu', 'assets/game/menu.png');
    }

    create() {

        // Agrega la imagen de fondo
        this.background = this.add.image(0, 0, 'background');

        // Establece el origen de la imagen en la esquina superior izquierda
        this.background.setOrigin(0, 0);

        // Escala la imagen de fondo para que ocupe toda la pantalla
        this.background.setScale(this.scale.width / this.background.width, this.scale.height / this.background.height);


    }

    pause() {
        this.scene.pause();
    }

    pauseClick(event) {
        if (this.scene.isPaused()) {
            const menu_x1 = this.scale.width / 2 - 270 / 2,
                menu_x2 = this.scale.width / 2 + 270 / 2,
                menu_y1 = this.scale.height / 2 - 180 / 2,
                menu_y2 = this.scale.height / 2 + 180 / 2;

            const mouse_x = event.x,
                mouse_y = event.y;

            if (mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2) {
                if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 && mouse_y <= menu_y1 + 90) {
                    this.trainingComplete = false;
                    this.trainingData = [];
                    this.trainingData2 = [];
                    this.autoMode = false;
                    this.newGame = true;
                } else if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 + 90 && mouse_y <= menu_y2) {
                    this.newGame = true;
                    if (!this.trainingComplete) {
                        console.log('Entrenamiento: ', this.trainingData.length);
                        console.log('Entrenamiento2: ', this.trainingData2.length);
                        this.neuralNetwork();
                        this.neuralNetworkAdvance();
                        this.trainingComplete = true;
                    }
                    this.autoMode = true;
                }

                this.menu.destroy();
                this.resetVariables();
                this.scene.resume();
            }
        }
    }

    resetVariables() {
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        this.player.body.position.x = 50;

        this.bullet.body.velocity.x = 0;
        this.bullet.position.x = this.scale.width - 100;

        this.bullet2.body.velocity.y = this.bulletSpeed2;
        this.bullet2.position.y = this.scale.height - 350;
        this.bulletD2 = false;
        this.bulletD = false;

        this.bullet3.body.velocity.x = -this.bulletSpeed3 * 5;
        this.bullet3.body.velocity.y = this.bulletSpeed3;
        this.bullet3.position.x = this.scale.width - 100;
        this.bullet3.position.y = 70;
        this.bulletD3 = false;
    }

    jumpAction() {
        this.player.body.velocity.y = -270;
    }

    moveRight() {
        if (this.player.body.position.x < 100)
            this.player.body.position.x += 10;
    }

    moveRight2() {
        if (this.player.body.position.x < 100)
            this.player.body.position.x += 20;
    }

    update() {

    }

    fire() {
        this.bulletSpeed = -1 * this.randomSpeed(300, 400);
        this.bullet.body.velocity.y = 0;
        this.bullet.body.velocity.x = this.bulletSpeed;
        this.bulletD = true;
        this.bulletD2 = true;
    }

    fire2() {
        this.bullet2.body.velocity.y = this.bulletSpeed2;
        this.bulletD2 = true;
    }

    fire3() {
        var dx = this.player.position.x - this.bullet3.position.x;
        var dy = this.player.position.y - this.bullet3.position.y;
        var magnitude = Math.sqrt(dx * dx + dy * dy);

        this.bullet3.body.velocity.x = (dx / magnitude) * this.bulletSpeed3;
        this.bullet3.body.velocity.y = (dy / magnitude) * this.bulletSpeed3;

        this.bullet3.position.x = this.scale.width - 100;
        this.bullet3.position.y = this.scale.height - 50;
        this.bulletD3 = true;
    }

    collisionHandler() {
        this.pause();
    }

    randomSpeed(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    neuralNetwork() {
        this.nnTraining.train(this.trainingData, { rate: 0.0003, iterations: 10000, shuffle: true });
    }

    neuralNetworkAdvance() {
        this.nnTraining2.train(this.trainingData2, { rate: 0.0003, iterations: 10000, shuffle: true });
    }

    neuralNetwork3() {
        this.nnTraining3.train(this.trainingData3, { rate: 0.0003, iterations: 10000, shuffle: true });
    }

    trainingDataInput(param_input) {
        this.nnOutput = this.nnNetwork.activate(param_input);
        var air = Math.round(this.nnOutput[0] * 100);
        var ground = Math.round(this.nnOutput[1] * 100);
        return this.nnOutput[0] >= this.nnOutput[1];
    }

    trainingDataInputBullet2(param_input) {
        this.nnOutput2 = this.nnNetwork2.activate(param_input);
        var progress = Math.round(this.nnOutput2[0] * 100);
        var still = Math.round(this.nnOutput2[1] * 100);
        return this.nnOutput2[0] >= this.nnOutput2[1];
    }

    trainingDataInputBullet3(param_input) {
        this.nnOutput3 = this.nnNetwork3.activate(param_input);
        var horizontalMovement = Math.round(this.nnOutput3[0] * 100);
        var verticalMovement = Math.round(this.nnOutput3[1] * 100);

        return this.nnOutput3[0] >= this.nnOutput3[1];
    }
}
