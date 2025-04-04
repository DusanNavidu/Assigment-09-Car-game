let cabSpeed = 0.7;
let cabIntervalTime = 2500;

let busSpeed = 0.5;
let busIntervalTime = 3000;

let primeMoverSpeed = 0.3;
let primeMoverIntervalTime = 4000;

let gameLoop;
let gameRunning = true;

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

function CabObstacle() {
    this.element = $('<div class="cab"></div>');
    $('#gameContainer').append(this.element);

    this.positionY = -100;
    this.positionX = Math.floor(Math.random() * 350);
    this.element.css({ left: this.positionX + 'px', top: this.positionY + 'px' });

    this.fall = () => {
        const that = this;
        let fallInterval = setInterval(() => {
            if (!gameRunning) {
                clearInterval(fallInterval);
                that.element.remove();
                return;
            }

            that.positionY += cabSpeed;
            that.element.css('top', that.positionY + 'vh');

            if (that.positionY > 80) {
                clearInterval(fallInterval);
                that.element.remove();
            }

            if (checkCollision($('#playerCar'), that.element)) {
                clearInterval(fallInterval);
                gameOver();
            }
        }, 30);
    };
}

function BusObstacle() {
    this.element = $('<div class="bus"></div>');
    $('#gameContainer').append(this.element);

    this.positionY = -100;
    this.positionX = Math.floor(Math.random() * 350);
    this.element.css({ left: this.positionX + 'px', top: this.positionY + 'px' });

    this.fall = () => {
        const that = this;
        let fallInterval = setInterval(() => {
            if (!gameRunning) {
                clearInterval(fallInterval);
                that.element.remove();
                return;
            }

            that.positionY += busSpeed;
            that.element.css('top', that.positionY + 'vh');

            if (that.positionY > 80) {
                clearInterval(fallInterval);
                that.element.remove();
            }

            if (checkCollision($('#playerCar'), that.element)) {
                clearInterval(fallInterval);
                gameOver();
            }
        }, 30);
    };
}

function checkCollision(car, cab) {
    let carPos = car.position();
    let cabPos = cab.position();
    return (
        cabPos.top + 100 >= carPos.top &&
        cabPos.left < carPos.left + 50 &&
        cabPos.left + 50 > carPos.left
    );
}

function gameOver() {
    gameRunning = false;
    $('#gameOverScreen').fadeIn();
    $('#overlay').show();
    clearInterval(gameLoop);
}

function restartGame() {
    $('#gameOverScreen').hide();
    $('#overlay').hide();
    $('#playerCar').css('left', '175px');
    $('.cab').remove();

    cabSpeed = 0.7;
    cabIntervalTime = 2500;
    gameRunning = true;
    clearInterval(gameLoop);
    startGameLoop();
}

function startGameLoop() {
    gameLoop = setInterval(() => {
        let newCab = new CabObstacle();
        newCab.fall();

        // Increase difficulty gradually
        if (cabSpeed < 15) cabSpeed += 0.1;

        if (cabIntervalTime > 800) {
            clearInterval(gameLoop);
            cabIntervalTime -= 100;
            startGameLoop();
        }
    }, cabIntervalTime);
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
