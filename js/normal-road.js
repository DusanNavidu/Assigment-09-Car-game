let cabSpeed = 1;
let cabIntervalTime = 5000;

let busSpeed = 0.7;
let busIntervalTime = 8000;

let primeMoverSpeed = 0.6;
let primeMoverIntervalTime = 10000;

let gameLoop;
let gameRunning = true;

const lanes = [0, 1, 2, 3];
const lanePositions = [0, 100, 200, 300];
let activeObstaclesInLane = [false, false, false, false];
function getAvailableLane() {
    let available = lanes.filter((lane, i) => !activeObstaclesInLane[i]);
    if (available.length === 0) return null; 
    return available[Math.floor(Math.random() * available.length)];
}

function Car(element) {
    this.element = $(element);
    this.positionX = 175;

    this.moveLeft = function () {
        if (this.positionX > 0) {
            this.positionX -= 25;
            this.updatePosition();
        }
    };

    this.moveRight = function () {
        if (this.positionX < 350) {
            this.positionX += 25;
            this.updatePosition();
        }
    };

    this.updatePosition = function () {
        this.element.css('left', this.positionX + 'px');
    };
}

function checkCollision(car, obstacle, type) {
    let carPos = car.position();
    let obstaclePos = obstacle.position();
    const carWidth = 50;

    const isColliding =
        obstaclePos.top + obstacle.height() >= carPos.top &&
        obstaclePos.left < carPos.left + carWidth &&
        obstaclePos.left + obstacle.width() > carPos.left;

    if (isColliding) {
        switch (type) {
            case 'cab':
                handleCabCollision();
                break;
            case 'bus':
                handleBusCollision();
                break;
            case 'primeMover':
                handlePrimeMoverCollision();
                break;
        }
    }
    
    return isColliding;
}

function handleCabCollision() {
    console.log("You hit a cab! Penalty: -5 points.");
    gameOver(); 
}

function handleBusCollision() {
    console.log("You hit a bus! Penalty: -10 points.");
    gameOver(); 
}

function handlePrimeMoverCollision() {
    console.log("You hit a prime mover! Penalty: -20 points.");
    gameOver(); 
}

function CabObstacle() {
    this.lane = getAvailableLane();
    if (this.lane === null) return; 

    activeObstaclesInLane[this.lane] = true;

    this.element = $('<div class="cab"></div>');
    $('#gameContainer').append(this.element);

    this.positionY = -100;
    this.positionX = lanePositions[this.lane];
    this.element.css({ left: this.positionX + 'px', top: this.positionY + 'px' });

    this.fall = () => {
        const that = this;
        let fallInterval = setInterval(() => {
            if (!gameRunning) {
                clearInterval(fallInterval);
                that.element.remove();
                activeObstaclesInLane[that.lane] = false;
                return;
            }

            that.positionY += cabSpeed;
            that.element.css('top', that.positionY + 'vh');

            if (that.positionY > 80) {
                clearInterval(fallInterval);
                that.element.remove();
                activeObstaclesInLane[that.lane] = false;
            }

            if (checkCollision($('#playerCar'), that.element, 'cab')) { // Pass 'cab' as the type
                clearInterval(fallInterval);
                activeObstaclesInLane[that.lane] = false;
            }
        }, 30);
    };
}

function BusObstacle() {
    this.lane = getAvailableLane();
    if (this.lane === null) return;

    activeObstaclesInLane[this.lane] = true;

    this.element = $('<div class="bus"></div>');
    $('#gameContainer').append(this.element);

    this.positionY = -100;
    this.positionX = lanePositions[this.lane];
    this.element.css({ left: this.positionX + 'px', top: this.positionY + 'px' });

    this.fall = () => {
        const that = this;
        let fallInterval = setInterval(() => {
            if (!gameRunning) {
                clearInterval(fallInterval);
                that.element.remove();
                activeObstaclesInLane[that.lane] = false;
                return;
            }

            that.positionY += busSpeed;
            that.element.css('top', that.positionY + 'vh');

            if (that.positionY > 80) {
                clearInterval(fallInterval);
                that.element.remove();
                activeObstaclesInLane[that.lane] = false;
            }

            if (checkCollision($('#playerCar'), that.element, 'bus')) { // Pass 'bus' as the type
                clearInterval(fallInterval);
                activeObstaclesInLane[that.lane] = false;
            }
        }, 30);
    };
}

function PrimeMoverObstacle() {
    this.lane = getAvailableLane();
    if (this.lane === null) return;

    activeObstaclesInLane[this.lane] = true;

    this.element = $('<div class="primeMover"></div>');
    $('#gameContainer').append(this.element);

    this.positionY = -100;
    this.positionX = lanePositions[this.lane];
    this.element.css({ left: this.positionX + 'px', top: this.positionY + 'px' });

    this.fall = () => {
        const that = this;
        let fallInterval = setInterval(() => {
            if (!gameRunning) {
                clearInterval(fallInterval);
                that.element.remove();
                activeObstaclesInLane[that.lane] = false;
                return;
            }

            that.positionY += primeMoverSpeed;
            that.element.css('top', that.positionY + 'vh');

            if (that.positionY > 80) {
                clearInterval(fallInterval);
                that.element.remove();
                activeObstaclesInLane[that.lane] = false;
            }

            if (checkCollision($('#playerCar'), that.element, 'primeMover')) { // Pass 'primeMover' as the type
                clearInterval(fallInterval);
                activeObstaclesInLane[that.lane] = false;
            }
        }, 30);
    };
}

function stopScrollingLines() {
    $('#road-white-line .white-line-1').css('animation', 'none');
    $('#road-white-line .white-line-2').css('animation', 'none');
    $('#road-white-line-right .white-line-1').css('animation', 'none');
    $('#road-white-line-right .white-line-2').css('animation', 'none');
}

function gameOver() {
    gameRunning = false;
    stopScrollingLines();  // Stop the scrolling lines
    $('#gameOverScreen').fadeIn();
    $('#overlay').show();
    clearInterval(gameLoop);
}

function restartGame() {
    $('#gameOverScreen').hide();
    $('#overlay').hide();
    $('#playerCar').css('left', '175px');
    $('.cab, .bus, .primeMover').remove();

    // Restart the animations
    $('#road-white-line .white-line-1').css('animation', 'scrollLineOne 2s linear infinite');
    $('#road-white-line .white-line-2').css('animation', 'scrollLineTwo 2s linear infinite');
    $('#road-white-line-right .white-line-1').css('animation', 'scrollLineOne 2s linear infinite');
    $('#road-white-line-right .white-line-2').css('animation', 'scrollLineTwo 2s linear infinite');

    cabSpeed = 1;
    busSpeed = 0.7;
    primeMoverSpeed = 0.6;
    cabIntervalTime = 8000;
    busIntervalTime = 10000;
    primeMoverIntervalTime = 13000;
    gameRunning = true;

    if (Array.isArray(gameLoop)) {
        gameLoop.forEach(loop => clearInterval(loop));
    }
    startGameLoop();
}


function startGameLoop() {
    let cabLoop = setInterval(() => {
        let newCab = new CabObstacle();
        if (newCab.lane !== null) newCab.fall();

        if (cabSpeed < 15) cabSpeed += 0.1;
    }, cabIntervalTime);

    let busLoop = setInterval(() => {
        let newBus = new BusObstacle();
        if (newBus.lane !== null) newBus.fall();

        if (busSpeed < 10) busSpeed += 0.05;
    }, busIntervalTime);

    let primeMoverLoop = setInterval(() => {
        let newPM = new PrimeMoverObstacle();
        if (newPM.lane !== null) newPM.fall();

        if (primeMoverSpeed < 8) primeMoverSpeed += 0.03;
    }, primeMoverIntervalTime);

    gameLoop = [cabLoop, busLoop, primeMoverLoop];
}

$(document).ready(function () {
    let playerCar = new Car('#playerCar');

    $(document).on('keydown', function (e) {
        if (!gameRunning) return;

        if (e.key === 'ArrowLeft') {
            playerCar.moveLeft();
        } else if (e.key === 'ArrowRight') {
            playerCar.moveRight();
        }
    });

    startGameLoop();
});
