let score = 0;
let timeElapsed = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameLoop;
let gameRunning = true;

let comingVehicleSpeed = 1.5;
let goingVehicleSpeed = 0.5;  
let cabIntervalTime = 5000;
let busIntervalTime = 5500;
let primeMoverIntervalTime = 6000;

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

function updateScore(amount) {
    score += amount;
    $('#score').text(score);
}

function updateTime() {
    timeElapsed++;
    $('#time').text(timeElapsed);
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

    if (this.lane < 2) {
        this.element.css('transform', 'rotate(180deg)');
    }

    this.fall = () => {
        const that = this;
        let fallInterval = setInterval(() => {
            if (!gameRunning) {
                clearInterval(fallInterval);
                that.element.remove();
                activeObstaclesInLane[that.lane] = false;
                return;
            }

            const speed = this.lane < 2 ? comingVehicleSpeed : goingVehicleSpeed;
            that.positionY += speed;
            that.element.css('top', that.positionY + 'vh');

            if (that.positionY > 80) {
                clearInterval(fallInterval);
                that.element.remove();
                activeObstaclesInLane[that.lane] = false;
                updateScore(20); 
            }

            if (checkCollision($('#playerCar'), that.element, 'cab')) {
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

    if (this.lane < 2) {
        this.element.css('transform', 'rotate(180deg)');
    }

    this.fall = () => {
        const that = this;
        let fallInterval = setInterval(() => {
            if (!gameRunning) {
                clearInterval(fallInterval);
                that.element.remove();
                activeObstaclesInLane[that.lane] = false;
                return;
            }

            const speed = this.lane < 2 ? comingVehicleSpeed : goingVehicleSpeed;
            that.positionY += speed;
            that.element.css('top', that.positionY + 'vh');

            if (that.positionY > 80) {
                clearInterval(fallInterval);
                that.element.remove();
                activeObstaclesInLane[that.lane] = false;
                updateScore(20);
            }

            if (checkCollision($('#playerCar'), that.element, 'bus')) {
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

    if (this.lane < 2) {
        this.element.css('transform', 'rotate(180deg)');
    }

    this.fall = () => {
        const that = this;
        let fallInterval = setInterval(() => {
            if (!gameRunning) {
                clearInterval(fallInterval);
                that.element.remove();
                activeObstaclesInLane[that.lane] = false;
                return;
            }

            const speed = this.lane < 2 ? comingVehicleSpeed : goingVehicleSpeed;
            that.positionY += speed;
            that.element.css('top', that.positionY + 'vh');

            if (that.positionY > 80) {
                clearInterval(fallInterval);
                that.element.remove();
                activeObstaclesInLane[that.lane] = false;
                updateScore(20); 
            }

            if (checkCollision($('#playerCar'), that.element, 'primeMover')) {
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
    stopScrollingLines();
    $('#gameOverScreen').fadeIn();
    $('#overlay').show();

    if (score > highScore) {
        localStorage.setItem('highScore', score);
        $('#recordMessage').text('🎉 New Record!');
    } else {
        $('#recordMessage').text('');
    }

    clearInterval(gameLoop);
}

function restartGame() {
    $('#gameOverScreen').hide();
    $('#overlay').hide();
    $('#playerCar').css('left', '175px');
    $('.cab, .bus, .primeMover').remove();

    $('#road-white-line .white-line-1').css('animation', 'scrollLineOne 2s linear infinite');
    $('#road-white-line .white-line-2').css('animation', 'scrollLineTwo 2s linear infinite');
    $('#road-white-line-right .white-line-1').css('animation', 'scrollLineOne 2s linear infinite');
    $('#road-white-line-right .white-line-2').css('animation', 'scrollLineTwo 2s linear infinite');

    score = 0;
    timeElapsed = 0;
    $('#score').text(score);
    $('#time').text(timeElapsed);
    $('#recordMessage').text('');

    comingVehicleSpeed = 1.5;
    goingVehicleSpeed = 0.5;
    cabIntervalTime = 5000;
    busIntervalTime = 8000;
    primeMoverIntervalTime = 10000;
    gameRunning = true;

    startGameLoop();
}

function increaseSpeed() {
    setInterval(() => {
        if (gameRunning) {
            comingVehicleSpeed += 0.1; 
            goingVehicleSpeed += 0.05; 
        }
    }, 5000); 
}

function startGameLoop() {
    timeElapsed = 0;
    score = 0;
    $('#score').text(score);
    $('#time').text(timeElapsed);
    $('#recordMessage').text('');

    increaseSpeed();

    let timerInterval = setInterval(updateTime, 1000);

    let cabLoop = setInterval(() => {
        let newCab = new CabObstacle();
        if (newCab.lane !== null) newCab.fall();
    }, cabIntervalTime);

    let busLoop = setInterval(() => {
        let newBus = new BusObstacle();
        if (newBus.lane !== null) newBus.fall();
    }, busIntervalTime);

    let primeMoverLoop = setInterval(() => {
        let newPM = new PrimeMoverObstacle();
        if (newPM.lane !== null) newPM.fall();
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
