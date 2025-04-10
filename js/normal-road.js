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
let gameLoop = [];
let timeInterval;
let gameRunning = true;
let gamePaused = false;
let level = 1;

let cabSpeed = 1;
let cabIntervalTime = 5000;

let busSpeed = 1.2;
let busIntervalTime = 5500;

let primeMoverSpeed = 1.4;
let primeMoverIntervalTime = 6000;

const lanes = [0, 1, 2, 3];
const lanePositions = [0, 100, 200, 300];
let activeObstaclesInLane = [false, false, false, false];
let activeObstacles = [];

let gameAudio = new Audio('/assets/audio/game-music-player-console-8bit-background-intro-theme-297305.mp3');
gameAudio.loop = true;
gameAudio.volume = 1;

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
    if (!gamePaused) {
        timeElapsed++;
        $('#time').text(timeElapsed);

        if (timeElapsed % 60 === 0) {
            level++;
            $('#level').text(level);
            increaseGameDifficulty();
        }
    }
}

function increaseGameDifficulty() {
    cabSpeed *= 1.2;
    busSpeed *= 1.2;
    primeMoverSpeed *= 1.2;

    cabIntervalTime = Math.max(3000, cabIntervalTime - 50);
    busIntervalTime = Math.max(3500, busIntervalTime - 50);
    primeMoverIntervalTime = Math.max(4000, primeMoverIntervalTime - 50);
}

function stopScrollingLines() {
    $('#road-white-line .white-line-1, #road-white-line .white-line-2, #road-white-line-right .white-line-1, #road-white-line-right .white-line-2')
        .css('animation', 'none');
}

function resumeScrollingLines() {
    $('#road-white-line .white-line-1, #road-white-line-right .white-line-1')
        .css('animation', 'scrollLineOne 2s linear infinite');
    $('#road-white-line .white-line-2, #road-white-line-right .white-line-2')
        .css('animation', 'scrollLineTwo 2s linear infinite');
}

function gameOver() {
    gameRunning = false;
    stopScrollingLines();
    $('#gameOverScreen').fadeIn();

    if (score > highScore) {
        localStorage.setItem('highScore', score);
        $('#recordMessage').text('🎉 New Record!');
    } else {
        $('#recordMessage').text('');
    }

    clearInterval(timeInterval);
    gameLoop.forEach(clearInterval);
    gameAudio.pause();
}

function restartGame() {
    $('#gameOverScreen').hide();
    $('#playerCar').css('left', '175px');
    $('.cab, .bus, .primeMover').remove();
    resumeScrollingLines();

    score = 0;
    timeElapsed = 0;
    level = 1; 
    $('#score').text(score);
    $('#time').text(timeElapsed);
    $('#level').text(level);
    $('#recordMessage').text('');

    cabSpeed = 1;
    busSpeed = 1.2;
    primeMoverSpeed = 1.4;
    cabIntervalTime = 8000;
    busIntervalTime = 10000;
    primeMoverIntervalTime = 13000;

    gameRunning = true;
    gamePaused = false;
    activeObstacles = [];

    $('#pause').show();
    $('#play').hide();

    startCountdown("Play Again", () => {
        startGameLoop();
        gameAudio.currentTime = 0;
        gameAudio.play();
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
        this.element.css({ left: this.positionX + 'px', top: this.positionY + 'vh' });

        const that = this;

        this.fall = () => {
            let fallInterval = setInterval(() => {
                if (!gameRunning || gamePaused) return;

                that.positionY += speed;
                that.element.css('top', that.positionY + 'vh');

                if (that.positionY > 100) {
                    clearInterval(fallInterval);
                    that.element.remove();
                    activeObstaclesInLane[that.lane] = false;
                    updateScore(10);
                    activeObstacles = activeObstacles.filter(obj => obj !== that);
                }

                if (checkCollision($('#playerCar'), that.element, type)) {
                    clearInterval(fallInterval);
                    activeObstaclesInLane[that.lane] = false;
                    activeObstacles = activeObstacles.filter(obj => obj !== that);
                }
            }, 30);
            that.fallInterval = fallInterval;
        };

        this.fall();
        activeObstacles.push(this);
    };

    return () => {
        let newObs = new obstacle();
    };
}

const spawnCab = createObstacle('cab', cabSpeed, cabIntervalTime, 'cab');
const spawnBus = createObstacle('bus', busSpeed, busIntervalTime, 'bus');
const spawnPM = createObstacle('primeMover', primeMoverSpeed, primeMoverIntervalTime, 'primeMover');

function startGameLoop() {
    timeElapsed = 0;
    score = 0;
    level = 1; 
    $('#score').text(score);
    $('#time').text(timeElapsed);
    $('#level').text(level); 
    $('#recordMessage').text('');

    timeInterval = setInterval(updateTime, 1000);

    gameLoop = [
        setInterval(spawnCab, cabIntervalTime),
        setInterval(spawnBus, busIntervalTime),
        setInterval(spawnPM, primeMoverIntervalTime)
    ];
}

$(document).ready(() => {
    let playerCar = new Car('#playerCar');
    $('#highScore').text(highScore);
    $('#play').hide();

    $(document).on('keydown', function (e) {
        if (!gameRunning || gamePaused) return;

        if (e.key === 'ArrowLeft') {
            playerCar.moveLeft();
        } else if (e.key === 'ArrowRight') {
            playerCar.moveRight();
        }
    });

    $('#pause').on('click', function () {
        gamePaused = true;
        gameRunning = false;

        gameLoop.forEach(clearInterval);
        clearInterval(timeInterval);
        stopScrollingLines();

        activeObstacles.forEach(obj => clearInterval(obj.fallInterval));
        gameAudio.pause();

        $(this).hide();
        $('#play').show();
    });

    $('#play').on('click', function () {
        gamePaused = false;
        gameRunning = true;

        resumeScrollingLines();

        timeInterval = setInterval(updateTime, 1000);
        gameLoop = [
            setInterval(spawnCab, cabIntervalTime),
            setInterval(spawnBus, busIntervalTime),
            setInterval(spawnPM, primeMoverIntervalTime)
        ];

        activeObstacles.forEach(obj => {
            obj.fall();
        });

        gameAudio.play();

        $(this).hide();
        $('#pause').show();
    });

    $('#mute').hide();
    $('#speacker').on('click', () => {
        gameAudio.pause();
        $('#speacker').hide();
        $('#mute').show();
    });

    $('#mute').on('click', () => {
        gameAudio.play();
        $('#mute').hide();
        $('#speacker').show();
    });

    startCountdown("Let's Go", () => {
        startGameLoop();
        gameAudio.play();
    });
});
