var canvasWidth = 600;
var canvasHeight = 600;
var player;
var background;

const bulllet_x = canvasWidth - 100
const bulllet_y =  canvasHeight / 2


/// Intial Variables 
var bulletSpeed;

var bullet, bulletD = false;

/// Variables inputkeys
var left, right, down, up;
var press = false
var keyescape;
var menu;

var bulletDistancex;
var bulletDistancey;

/// Variables for input layers
var statusmoveRight = 0;
var statusmoveLeft = 0;
var statusmoveUp = 0;
var statusmoveDown = 0;

/// Variables for training
var nnNetwork, nnTraining, nnOutput, trainingData = [];
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
    // Setup of physics
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 0;

    // Objects with physics
    background = game.add.tileSprite(0, 0, canvasWidth, canvasHeight, 'background');
    bullet = game.add.sprite(canvasWidth - 100, canvasHeight / 2, 'bullet');
    player = game.add.sprite(canvasWidth / 2, canvasHeight / 2, 'character');

    game.physics.enable(player);
    game.physics.enable(bullet);

    player.body.collideWorldBounds = true;
    bullet.body.collideWorldBounds = true;

    // Make the bullet bounce
    bullet.body.bounce.set(1);

    // Set a random initial velocity for the bullet
    bullet.body.velocity.setTo(randomSpeed(200, 300), randomSpeed(200, 300));

    // Set animation of run
    var run = player.animations.add('run', [8, 9, 10, 11]);
    player.animations.play('run', 10, true);

    // Actions of stop
    pauseLabel = game.add.text(canvasWidth - 100, 20, 'Pause', { font: '20px Arial', fill: '#fff' });
    pauseLabel.inputEnabled = true;
    pauseLabel.events.onInputUp.add(pause, this);
    game.input.onDown.add(pauseClick, this);

    // Actions of physics
    left = game.input.keyboard.addKey(Phaser.Keyboard.A);
    right = game.input.keyboard.addKey(Phaser.Keyboard.D);
    down = game.input.keyboard.addKey(Phaser.Keyboard.S);
    up = game.input.keyboard.addKey(Phaser.Keyboard.W);
    keyescape = game.input.keyboard.addKey(Phaser.Keyboard.ESC);

    // Variables trainer
    nnNetwork = new synaptic.Architect.Perceptron(4, 8, 8, 4);
    nnTraining = new synaptic.Trainer(nnNetwork);
}

function update() {

    tpCentro()
    // Displacement of the scene
    background.tilePosition.x -= 1;

    // Physics of the collide
    handleBulletCollisions();

    // Update bullet movement
    handleBulletMovement();

    if (!autoMode) {
        // Actions of keypress
        handlePlayerActions();
    }

    /* Operations from Trainer */

    // Distance between the bullets and the player
    bulletDistancex = Math.floor(player.position.x - bullet.position.x);
    bulletDistancey = Math.floor(player.position.y - bullet.position.y);

    groundStatus = 1;
    airStatus = 0;
    progress = 0;
    still = 1;

    var distanciaBolaX = bullet.x - player.x;
    var distanciaBolaY = bullet.y - player.y;        
    var cuadrante = getCuadrante(distanciaBolaX,distanciaBolaY)

    const distance = Math.sqrt(Math.pow(bullet.x - player.x, 2) + Math.pow(bullet.y - player.y, 2));    

    if (!autoMode) {
        if ( distance < 300) {
            trainingData.push({
                'input': [cuadrante,distance, bullet.x, bullet.y],
                'output': [statusmoveRight, statusmoveLeft, statusmoveUp, statusmoveDown]
            });

            // console.log('output', statusmoveRight, statusmoveLeft, statusmoveUp, statusmoveDown);
        }
    }

    // Actions in mode auto = true
    if (autoMode == true && distance < 150) {
        const result = gettrainingData([cuadrante,distance,bullet.x, bullet.y])
        //if (gettrainingData([bulletDistancey,bulletDistancex,distance])) {

            switch(result){
                case 0: //Right
                console.log("derecha");
                moveRight()
                break;
                case 1: //Left
                console.log("izquierda");
                moveLeft()
                break;
                case 2: //Up
                console.log("arriba");
                moveUp()
                break;
                case 3: //Down
                console.log("abajo");
                moveDown()
                break;
            }
        //}
    }
    statusmoveRight = statusmoveLeft = statusmoveUp = statusmoveDown = 0
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
                autoMode = false;
            } else if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 + 90 && mouse_y <= menu_y2) {
                if (!trainingComplete) {
                    console.log('Entrenamiento data: ', trainingData.length);
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

function tpCentro(){
    if(
        player.position.x > (560) ||
        player.position.x < 20 ||
        player.position.y < 20 ||
        player.position.y > (550)
    ){
        handlePlayerMovement()
    }
}

// Funciones de reinicio
function resetVariables() {
    // Prevent bounce of player
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    player.position.x = 50;

    //bullet.body.velocity.x = 0;
    //bullet.position.x = canvasWidth - 100;

    bullet.x = bulllet_x
    bullet.y = bulllet_y



    handlePlayerMovement()
    bulletD = false;
}

/* Handlers from update */
function handlePlayerMovement() {
    player.x = canvasWidth / 2 - player.width / 2;
    player.y = canvasHeight / 2 - player.height / 2;
}

function handleBulletCollisions() {
    game.physics.arcade.collide(bullet, player, collisionHandler, null, this);
}

function handleBulletMovement() {
    // Ensure the bullet bounces within the world bounds without increasing speed
    bullet.body.bounce.set(1);
}

function handlePlayerActions() {

    press = true

    if (right.isDown) {
        moveRight();
        press = true
        statusmoveRight = 1
    }

    if (left.isDown) {
        moveLeft();
        press = true
        statusmoveLeft = 1
    }

    if (down.isDown) {
        moveDown();
        press = true
        statusmoveDown =1 
    }

    if (up.isDown) {
        moveUp();
        press = true
        statusmoveUp = 1
    }

    if (keyescape.isDown) {
        pause();
    }

    if (!press) {
        player.body.velocity.y = 0;
        player.body.velocity.x = 0;   
    }
}

/* Displacement from bullets */
// Functions Bullet1
function fireBullet() {
    bulletSpeed = -1 * randomSpeed(200, 300);
    bullet.body.velocity.x = bulletSpeed;
    bulletD = true;
}

// Funciones de acciones físicas
function moveUp() {
    player.y -= 5;
}

function moveRight() {
    player.x += 5;
}

function moveLeft() {
    player.x -= 5;
}

function moveDown() {
    player.y += 5;
}

function collisionHandler() {
    pause();
}

function randomSpeed(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Functions of my Neuronal Networks */
function neuralNetworTraining() {
    nnTraining.train(trainingData, { rate: 0.0003, iterations: 5000, shuffle: true });
}

function gettrainingData(param_input) {
    nnOutput = nnNetwork.activate(param_input);
    let result = Math.round(nnOutput[0] * 100);
    const max_value = Math.max(...nnOutput)
    
    if (max_value > 0.04){    
        return nnOutput.indexOf(max_value)    
    }
    //return result >= 40;
    console.log(nnOutput);
}


function getCuadrante(x, y) {
    if (x > 0 && y < 0) {
        return 1;
    } else if (x < 0 && y < 0) {
        return 2;
    } else if (x < 0 && y > 0) {
        return 3;
    } else if (x > 0 && y > 0) {
        return 4;
    }
    return 0
}