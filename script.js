// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');

const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let obstaclePositions = [];
let setIntervalId;
let score = 0;
let hasTriggeredHighScoreConfetti = false;

// Getting high score from the local storage
let highScore = parseInt(localStorage.getItem("high-score"), 10) || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

const confettiContainer = document.querySelector('.confetti-container');
const confettiColors = ['#FFC907', '#2E9DF7', '#4FCB53', '#FF902A', '#F5402C', '#8BD1CB'];

const getRandomBoardPosition = () => {
  return [Math.floor(Math.random() * 30) + 1, Math.floor(Math.random() * 30) + 1];
};

const isPositionOccupied = (x, y) => {
  if (foodX === x && foodY === y) return true;
  if (snakeX === x && snakeY === y) return true;
  for (const [bodyX, bodyY] of snakeBody) {
    if (bodyX === x && bodyY === y) return true;
  }
  for (const [obstacleX, obstacleY] of obstaclePositions) {
    if (obstacleX === x && obstacleY === y) return true;
  }
  return false;
};

const createObstacle = () => {
  let obstacleX, obstacleY;
  let attempts = 0;
  do {
    [obstacleX, obstacleY] = getRandomBoardPosition();
    attempts += 1;
  } while (isPositionOccupied(obstacleX, obstacleY) && attempts < 1000);

  if (!isPositionOccupied(obstacleX, obstacleY)) {
    obstaclePositions.push([obstacleX, obstacleY]);
  }
};

const createConfettiParticle = () => {
  const confetti = document.createElement('span');
  confetti.className = 'confetti';
  confetti.style.left = `${Math.random() * 100}%`;
  confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
  confetti.style.width = `${Math.random() * 6 + 6}px`;
  confetti.style.height = `${Math.random() * 12 + 10}px`;
  confetti.style.setProperty('--x', `${Math.random() * 120 - 60}px`);
  confettiContainer.appendChild(confetti);

  setTimeout(() => confetti.remove(), 1900);
};

const burstConfetti = () => {
  for (let i = 0; i < 30; i += 1) {
    setTimeout(createConfettiParticle, i * 40);
  }
};

// Passing a random 1 - 30 value as food position
const updateFoodPosition = () => {
  foodX = Math.floor(Math.random() * 30) + 1;
  foodY = Math.floor(Math.random() * 30) + 1;
}

// Clearing the timer and reloading the page on game over
const handleGameOver = () => {
    clearInterval(setIntervalId);
    alert("Don't worry, this is only a bump in the road! Click okay to try again!");
    location.reload();
  }

// Change the snake's velocity when the user presses an arrow key or WASD key.
const changeDirection = (event) => {
    const key = event.key.toLowerCase();

    if ((key === "arrowup" || key === "w") && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    } else if ((key === "arrowdown" || key === "s") && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    } else if ((key === "arrowleft" || key === "a") && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    } else if ((key === "arrowright" || key === "d") && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

document.addEventListener("keydown", changeDirection);

let touchStartX = 0;
let touchStartY = 0;

const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
};

const handleTouchEnd = (event) => {
    const touch = event.changedTouches[0];
    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
        if (diffX > 0 && velocityX !== -1) {
            velocityX = 1;
            velocityY = 0;
        } else if (diffX < 0 && velocityX !== 1) {
            velocityX = -1;
            velocityY = 0;
        }
    } else if (Math.abs(diffY) > 30) {
        if (diffY > 0 && velocityY !== -1) {
            velocityX = 0;
            velocityY = 1;
        } else if (diffY < 0 && velocityY !== 1) {
            velocityX = 0;
            velocityY = -1;
        }
    }
};

playBoard.addEventListener("touchstart", handleTouchStart, { passive: true });
playBoard.addEventListener("touchend", handleTouchEnd, { passive: true });

const initGame = () => {
    if(gameOver) return handleGameOver();
    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;
    // Checking if the snake hit the food
    if(snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        snakeBody.push([foodY, foodX]); // Pushing food position to snake body array
        score++; // increment score by 1
        scoreElement.innerText = `Score: ${score}`;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("high-score", highScore);
            highScoreElement.innerText = `High Score: ${highScore}`;
            if (!hasTriggeredHighScoreConfetti) {
                burstConfetti();
                hasTriggeredHighScoreConfetti = true;
            }
        }

        if (score % 5 === 0) {
            createObstacle();
        }
    }
    // Updating the snake's head position based on the current velocity
    snakeX += velocityX;
    snakeY += velocityY;
    
    // Shifting forward the values of the elements in the snake body by one
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    snakeBody[0] = [snakeX, snakeY]; // Setting first element of snake body to current snake position
    // Checking if the snake's head is out of wall, if so setting gameOver to true
    if(snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        return gameOver = true;
    }
    for (const [obstacleX, obstacleY] of obstaclePositions) {
        html += `<div class="obstacle" style="grid-area: ${obstacleY} / ${obstacleX}"></div>`;
        if (snakeX === obstacleX && snakeY === obstacleY) {
            gameOver = true;
        }
    }

    for (let i = 0; i < snakeBody.length; i++) {
        // Add a div for the snake head, and a different class for the rest of the body
        const snakeClass = i === 0 ? "head" : "body";
        html += `<div class="${snakeClass}" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
        // Checking if the snake head hit the body, if so set gameOver to true
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }
    playBoard.innerHTML = html;
}
updateFoodPosition();
setIntervalId = setInterval(initGame, 100);
document.addEventListener("keyup", changeDirection);