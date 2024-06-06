var canvasWidth = 800;
var canvasHeight = 400;
var player;
var ship, ship2, ship3;
var background;

/// Intial Variables 
var bulletSpeed;
var bulletSpeed2 = 203;
var bulletSpeed3 = 160;

var bullet, bulletD = false;
var bullet2, bulletD2 = false;
var bullet3, bulletD3 = false;

/// Variables inputkeys
var jump, left, right, direction = 1;
var keyescape;
var menu;

var bulletDistance;

var bullet2Distancex;
var bullet2Distancey;

var bullet3Distancex;
var bullet3Distancey;

/// Variables for input layers
var airStatus;
var groundStatus;
var statusmoveRight
var statusmoveLeft

/// Variables for training
var nnNetworkJump, nnTrainingJump, nnOutputJump, trainingDataJump = [];
var nnNetworkMoveLeft, nnTrainingMoveLeft, nnOutputMoveLeft, trainingDataMoveLeft = [];
var nnNetworkMoveRight, nnTrainingMoveRight, nnOutputMoveRight, trainingDataMoveRight = [];
var autoMode = false, trainingComplete = false;

var game = new Phaser.Game(canvasWidth, canvasHeight, Phaser.CANVAS, '', {
    preload: preload,
    create: create,
    update: update,
});

console.log('Phaser Version:', Phaser.VERSION);

function preload() {
    game.load.image('background', 'assets/game/fondo.png');
    game.load.spritesheet('character', 'assets/sprites/altair.png', 32, 48);
    game.load.image('ship', 'assets/game/ufo.png');
    game.load.image('bullet', 'assets/sprites/purple_ball.png');
    game.load.image('menu', 'assets/game/menu.png');
}


function create() {

    // setup of physics
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 800;
    game.time.desiredFps = 30;

    // Objects with physics
    background = game.add.tileSprite(0, 0, canvasWidth, canvasHeight, 'background');
    ship = game.add.sprite(canvasWidth - 100, canvasHeight - 70, 'ship');
    ship2 = game.add.sprite(20, canvasHeight - 400, 'ship');
    ship3 = game.add.sprite(canvasWidth - 100, 0, 'ship');
    bullet = game.add.sprite(canvasWidth - 100, canvasHeight, 'bullet');
    bullet2 = game.add.sprite(55, canvasHeight - 350, 'bullet');
    bullet3 = game.add.sprite(canvasWidth - 100, 70, 'bullet');
    player = game.add.sprite(50, canvasHeight - 48, 'character');

    game.physics.enable(player);
    game.physics.enable(bullet);
    game.physics.enable(bullet2);
    game.physics.enable(bullet3);

    player.body.collideWorldBounds = true;

    // set aimation of run
    var run = player.animations.add('run', [8, 9, 10, 11]);
    player.animations.play('run', 10, true);

    // Actions of stop
    pauseLabel = game.add.text(canvasWidth - 100, 20, 'Pause', { font: '20px Arial', fill: '#fff' });
    pauseLabel.inputEnabled = true;
    pauseLabel.events.onInputUp.add(pause, this);
    game.input.onDown.add(pauseClick, this);

    // Actions of physics
    jump = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    left = game.input.keyboard.addKey(Phaser.Keyboard.A);
    right = game.input.keyboard.addKey(Phaser.Keyboard.D);
    keyescape = game.input.keyboard.addKey(Phaser.Keyboard.ESC);


    // Variables trainer
    nnNetworkJump = new synaptic.Architect.Perceptron(2, 16, 16, 1);
    nnTrainingJump = new synaptic.Trainer(nnNetworkJump);

    nnNetworkMoveLeft = new synaptic.Architect.Perceptron(3, 16, 16, 1);
    nnTrainingMoveLeft = new synaptic.Trainer(nnNetworkMoveLeft);

    nnNetworkMoveRight = new synaptic.Architect.Perceptron(2, 16, 16, 1);
    nnTrainingMoveRight = new synaptic.Trainer(nnNetworkMoveRight);

}


function update() {

    //displacement of the scene
    background.tilePosition.x -= 1;

    // physics of the collide
    handleBulletCollisions()

    // displacement of the bullets
    handleBulletMovement()
    handleBullet2Movement()
    handleBullet3Movement()

    // console.log(bullet3.position.y);
    // console.log(bullet2.body.velocity.y);


    if (!autoMode) {
        //Actions of keyspress
        handlePlayerActions()
    }

    /* Operations from Trainer */

    // distance between from the bullets and tha player
    bulletDistance = Math.floor(player.position.x - bullet.position.x);

    bullet2Distancey = Math.floor(player.position.y - bullet2.position.y);
    bullet2Distancex = Math.floor(player.position.x - bullet2.position.x);

    bullet3Distancey = Math.floor(player.position.y - bullet3.position.y);
    bullet3Distancex = Math.floor(player.position.x - bullet3.position.x);

    groundStatus = 1;
    airStatus = 0;
    progress = 0;
    still = 1;

    if (!player.body.onFloor()) {
        groundStatus = 0;
        airStatus = 1;
    }
    if (player.body.position.x > 50) {
        progress = 1;
        still = 0;
    }

    // console.log(bullet.position.x);

    if (!autoMode) {

        if (bullet.position.x > 0 && bullet2.position.y > 100 && bullet2Distancey > 0) {
            trainingDataJump.push({
                'input': [bulletDistance, bulletSpeed],
                'output': [airStatus]
            });

            // console.log("Nave1: Desplazamiento Bala, Velocidad Bala, AirEstatus, GroundEstatus: ", bulletDistance + " " + bulletSpeed + " " + airStatus + " " + groundStatus);
        }

        if (bullet2.position.y > 100) {
            trainingDataMoveLeft.push({
                'input': [ bullet2Distancey, player.position.x, bullet2.position.x],
                'output': [statusmoveLeft]
            });

            // console.log("Nave2: Desplazamiento Y Bala, Velocidad Bala, Estatus, Estatus: ",
            //     bullet2Distancey + " " + bulletSpeed2 + " " + airStatus + " " + groundStatus);
        }

        if (bullet3.position.y >= 200 && bullet3.position.x > 0) {
            trainingDataMoveRight.push({
                'input': [bullet3Distancex, bullet3Distancey],
                'output': [statusmoveRight]
            });

            // console.log("Nave3: Desplazamiento X Bala, Velocidad Bala, Estatus, Estatus: ",
            //     bullet3Distancex + " " + bulletSpeed3 + " " + airStatus + " " + groundStatus);
        }
    }

    // actions in mode auto = true

    if (autoMode == true ) {
        
        if (gettrainingDataMoveRight([bullet3Distancex, bullet3Distancey])  && bullet3.position.y > 300 && bullet3.position.x > 0) {      
            moveRight();
        }

        if (gettrainingDataJump([bulletDistance, bulletSpeed]) && bullet.position.x > 0 && player.body.onFloor()) {
            jumpAction();        
        }

        if (gettrainingDataMoveLeft([bullet2Distancex, player.position.x ,bulletSpeed3]) && bullet2.position.y > 200) {
            moveLeft()
        }
    }
    

}

// Funciones de pause


function pause() {
    game.paused = true;
    menu = game.add.sprite(canvasWidth / 2, canvasHeight / 2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}


function pauseClick(event) {

    if (game.paused) {
        var menu_x1 = canvasWidth / 2 - 270 / 2,
            menu_x2 = canvasWidth / 2 + 270 / 2,
            menu_y1 = canvasHeight / 2 - 180 / 2,
            menu_y2 = canvasHeight / 2 + 180 / 2;

        var mouse_x = event.x,
            mouse_y = event.y;

        if (mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2) {
            if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 && mouse_y <= menu_y1 + 90) {
                // Reset Variables
                trainingComplete = false;
                trainingData = [];
                trainingData2 = [];
                trainingData3 = [];
                autoMode = false;
            } else if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 + 90 && mouse_y <= menu_y2) {

                if (!trainingComplete) {
                    console.log('Entrenamiento Salto data: ', trainingDataJump.length);
                    console.log('Entrenamiento Mov Derecha data: ', trainingDataMoveLeft.length);
                    console.log('Entrenamiento Mov Izq data: ', trainingDataMoveRight.length);
                    neuralNetworTraining();
                    trainingComplete = true;
                }
                autoMode = true;
            }

            menu.destroy();
            resetVariables();
            game.paused = false;
        }
    }
}


// Funciones de reinicio


function resetVariables() {
    // prevent bounce of player
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    player.position.x = 50;

    bullet.body.velocity.x = 0;
    bullet.position.x = canvasWidth - 100;

    bullet2.body.velocity.y = bulletSpeed2;
    bullet2.position.y = canvasHeight - 350;

    bullet3.body.velocity.x = -bulletSpeed3 * 5;
    bullet3.body.velocity.y = bulletSpeed3;
    bullet3.position.x = canvasWidth - 100;
    bullet3.position.y = 70;

    // console.log('RESET');
    // console.log(bullet3.body.velocity.x);
    // console.log('RESET');

    bulletD = false;
    bulletD2 = false;
    bulletD3 = false;
}


/* Handlers from update */


function handleBulletCollisions() {
    game.physics.arcade.collide(bullet, player, collisionHandler, null, this);
    game.physics.arcade.collide(bullet2, player, collisionHandler, null, this);
    game.physics.arcade.collide(bullet3, player, collisionHandler, null, this);
}

function handleBulletMovement() {
    if (!bulletD) {
        fireBullet();
    }

    if (bullet.position.x <= 0) {
        resetFireBullet();
    }

    // displacement horizontal form the bullet
    bullet.position.y = canvasHeight - (bullet.height + 3);
    bullet.body.velocity.y = 0;
}

function handleBullet2Movement() {

    if (bullet2.body.velocity.y > 70) {
        bulletSpeed2 = fireBullet2()
        bullet2.body.velocity.y = bulletSpeed2
    }

    if (bullet2.position.y >= canvasHeight) {
        resetFireBullet2();
    }
}

function handleBullet3Movement() {
    if (!bulletD3) {
        fireBullet3();
    }

    if (bullet3.position.x <= 0) {
        resetFireBullet3();
    }
}

function handlePlayerActions() {
    if (right.isDown) {
        moveRight();

        statusmoveRight = 1
        statusmoveLeft = 0
    }

    if (left.isDown) {
        moveLeft();

        statusmoveRight = 0
        statusmoveLeft = 1
    }

    if (jump.isDown && player.body.onFloor()) {
        jumpAction();

        airStatus = 1
        groundStatus = 0
    }

    if (keyescape.isDown) {
        pause()
    }
}


/*displacement from bullets*/

// Funtions Bullet1
function fireBullet() {
    bulletSpeed = -1 * randomSpeed(200, 300);
    bullet.body.velocity.x = bulletSpeed;
    bulletD = true;
}

function resetFireBullet() {
    bullet.body.velocity.x = 0;
    bullet.position.x = canvasWidth - 100;
    bulletD = false;
}

// Funtions Bullet2
function fireBullet2() {
    return bullet2.body.velocity.y = randomSpeed(30, 70)
}

function resetFireBullet2() {
    bullet2.body.velocity.y = 0;
    bullet2.position.y = canvasHeight - 350;
}

// Funtions Bullet3
function fireBullet3() {

    var dx = player.position.x - bullet3.position.x;
    var dy = player.position.y - bullet3.position.y;
    var magnitude = Math.sqrt(dx * dx + dy * dy);

    // console.log(magnitude);

    bullet3.body.velocity.x = - (((dx / magnitude) * bulletSpeed3) * 4.6) * -1;
    bullet3.body.velocity.y = (dy / magnitude) * bulletSpeed3;

    // console.log(bullet3.body.velocity.x);

    bullet3.position.x = canvasWidth - 100;
    bullet3.position.y = 50;

    bulletD3 = true;
}

function resetFireBullet3() {
    bullet3.position.x = canvasWidth - 100;
    bullet3.position.y = 50;
    bulletD3 = false;
}

// Funciones de acciones físicas

function jumpAction() {
    player.body.velocity.y = -270;
}

function moveRight() {
    if (player.body.position.x < 100)
        player.body.position.x += 10;
}

function moveLeft() {
    if (player.body.position.x > 50)
        player.body.position.x -= 10;
}

function collisionHandler() {
    pause();
}

function randomSpeed(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Functions of my Neuronal Networks */

function neuralNetworTraining() {
    nnTrainingJump.train(trainingDataJump, { rate: 0.0003, iterations: 5000, shuffle: true });
    nnTrainingMoveLeft.train(trainingDataMoveLeft, { rate: 0.0003, iterations: 50000, shuffle: true });
    nnTrainingMoveRight.train(trainingDataMoveRight, { rate: 0.0003, iterations: 50000, shuffle: true });
}


function gettrainingDataJump(param_input) {
    nnOutputJump = nnNetworkJump.activate(param_input);
    let air = Math.round(nnOutputJump[0] * 100);
    console.log("Valor ","En el Aire %: "+ air );
    return air >= 40;
}

function gettrainingDataMoveLeft(param_input) {
    nnOutputMoveLeft = nnNetworkMoveLeft.activate(param_input);
    let left = Math.round(nnOutputMoveLeft[0] * 100);
    return left > 20;
}

function gettrainingDataMoveRight(param_input) {
    nnOutputMoveRight = nnNetworkMoveRight.activate(param_input);
    let right = Math.round(nnOutputMoveRight[0] * 100);
    return right >= 20 ;
}
