function startCountdown(finalText = "Let's Go", callback) {
    const steps = ['three', 'two', 'one', 'go'];
    let index = 0;

    $('#go').text(finalText);

    function showNext() {
        if (index > 0) {
            $('#' + steps[index - 1]).hide();
        }

        if (index < steps.length) {
            const el = $('#' + steps[index]);
            el.show().addClass('countdown');
            setTimeout(() => {
                el.hide();
                index++;
                showNext();
            }, 1000);
        } else {
            if (callback) callback();
        }
    }

    showNext();
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

let score = 0;
let timeElapsed = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameLoop;
let gameRunning = true;

let cabSpeed = 1;
let cabIntervalTime = 5000;

let busSpeed = 1.2;
let busIntervalTime = 5500;

let primeMoverSpeed = 1.4;
let primeMoverIntervalTime = 6000;

const lanes = [0, 1, 2, 3];
const lanePositions = [0, 100, 200, 300];
let activeObstaclesInLane = [false, false, false, false];

function getAvailableLane() {
    let available = lanes.filter((lane, i) => !activeObstaclesInLane[i]);
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}

function updateScore(amount) {
    score += amount;
    $('#score').text(score);
}

function updateTime() {
    timeElapsed++;
    $('#time').text(timeElapsed);
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

    cabSpeed = 1;
    busSpeed = 1.2;
    primeMoverSpeed = 1.4;
    cabIntervalTime = 8000;
    busIntervalTime = 10000;
    primeMoverIntervalTime = 13000;
    gameRunning = true;

    startCountdown("Play Again", () => {
        startGameLoop();
    });
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
        gameOver();
    }

    return isColliding;
}

function createObstacle(type, speed, interval, className) {
    const obstacle = function () {
        this.lane = getAvailableLane();
        if (this.lane === null) return;

        activeObstaclesInLane[this.lane] = true;
        this.element = $('<div class="' + className + '"></div>');
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

                that.positionY += speed;
                that.element.css('top', that.positionY + 'vh');

                if (that.positionY > 80) {
                    clearInterval(fallInterval);
                    that.element.remove();
                    activeObstaclesInLane[that.lane] = false;
                    updateScore(10);
                }

                if (checkCollision($('#playerCar'), that.element, type)) {
                    clearInterval(fallInterval);
                    activeObstaclesInLane[that.lane] = false;
                }
            }, 30);
        };
    };

    return () => {
        let newObs = new obstacle();
        if (newObs.lane !== null) newObs.fall();
    };
}

const spawnCab = createObstacle('cab', cabSpeed, cabIntervalTime, 'cab');
const spawnBus = createObstacle('bus', busSpeed, busIntervalTime, 'bus');
const spawnPM = createObstacle('primeMover', primeMoverSpeed, primeMoverIntervalTime, 'primeMover');

function startGameLoop() {
    timeElapsed = 0;
    score = 0;
    $('#score').text(score);
    $('#time').text(timeElapsed);
    $('#recordMessage').text('');

    setInterval(updateTime, 1000);
    gameLoop = [
        setInterval(spawnCab, cabIntervalTime),
        setInterval(spawnBus, busIntervalTime),
        setInterval(spawnPM, primeMoverIntervalTime)
    ];

    setInterval(() => {
        if (gameRunning) {
            cabSpeed += 0.05;
            busSpeed += 0.05;
            primeMoverSpeed += 0.05;

            cabIntervalTime = Math.max(3000, cabIntervalTime - 50);
            busIntervalTime = Math.max(3500, busIntervalTime - 50);
            primeMoverIntervalTime = Math.max(4000, primeMoverIntervalTime - 50);
        }
    }, 10000);
}

$(document).ready(() => {
    let playerCar = new Car('#playerCar');

    $(document).on('keydown', function (e) {
        if (!gameRunning) return;

        if (e.key === 'ArrowLeft') {
            playerCar.moveLeft();
        } else if (e.key === 'ArrowRight') {
            playerCar.moveRight();
        }
    });

    startCountdown("Let's Go", () => {
        startGameLoop();
    });
});
