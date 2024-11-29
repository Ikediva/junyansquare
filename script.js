
const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const grid = 50; // Larger grid for bigger images
const rows = 20;
const cols = 10;

// Load custom square images
const squareImages = {
    rectangleStanding: "rectangle-standing.jpg",
    rectangleLying: "rectangle-lying.jpg",
    square: "square.jpg"
};

const pieceShapes = {
    rectangleStanding: [[1], [1], [1], [1]],
    rectangleLying: [[1, 1, 1, 1]],
    square: [
        [1, 1],
        [1, 1]
    ]
};

// Game variables
let gridMatrix = Array.from({ length: rows }, () => Array(cols).fill(0));
let currentPiece = createPiece();
let gameOver = false;

// Create new piece
function createPiece() {
    const pieceTypes = Object.keys(pieceShapes);
    const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
    return {
        shape: pieceShapes[randomType],
        x: Math.floor(cols / 2) - 1,
        y: 0,
        type: randomType
    };
}

// Draw the grid and pieces
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing pieces
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (gridMatrix[row][col]) {
                drawSquare(col, row, gridMatrix[row][col]);
            }
        }
    }

    // Draw current piece
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawSquare(currentPiece.x + x, currentPiece.y + y, currentPiece.type);
            }
        });
    });
}

// Draw a single square
function drawSquare(x, y, type) {
    const img = new Image();
    img.src = squareImages[type];
    img.onload = () => {
        context.drawImage(img, x * grid, y * grid, grid, grid);
    };
}

// Move piece down
function dropPiece() {
    currentPiece.y++;

    if (collides()) {
        currentPiece.y--;
        mergePiece();
        currentPiece = createPiece();

        if (collides()) {
            gameOver = true;
        }
    }

    draw();
}

// Check collision
function collides() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x] &&
                (gridMatrix[currentPiece.y + y] === undefined ||
                    gridMatrix[currentPiece.y + y][currentPiece.x + x] === undefined ||
                    gridMatrix[currentPiece.y + y][currentPiece.x + x])) {
                return true;
            }
        }
    }
    return false;
}

// Merge piece into grid
function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                gridMatrix[currentPiece.y + y][currentPiece.x + x] = currentPiece.type;
            }
        });
    });

    // Check for full rows
    gridMatrix = gridMatrix.filter(row => row.some(value => !value));
    while (gridMatrix.length < rows) {
        gridMatrix.unshift(Array(cols).fill(0));
    }
}

// Keyboard and on-screen button controls
document.addEventListener("keydown", event => {
    if (gameOver) return;

    if (event.key === "ArrowLeft") movePiece(-1);
    else if (event.key === "ArrowRight") movePiece(1);
    else if (event.key === "ArrowDown") dropPiece();
    else if (event.key === "ArrowUp") rotatePiece();
    draw();
});

document.getElementById("left").addEventListener("click", () => movePiece(-1));
document.getElementById("right").addEventListener("click", () => movePiece(1));
document.getElementById("drop").addEventListener("click", dropPiece);
document.getElementById("rotate").addEventListener("click", rotatePiece);

function movePiece(direction) {
    currentPiece.x += direction;
    if (collides()) currentPiece.x -= direction;
}

function rotatePiece() {
    const shape = currentPiece.shape.map((_, i) => currentPiece.shape.map(row => row[i]));
    currentPiece.shape = shape.map(row => row.reverse());
    if (collides()) currentPiece.shape = shape;
}

// Play sound effect
document.addEventListener("click", () => {
    const clickSound = document.getElementById("click-sound");
    clickSound.play();
});

// Game loop
function gameLoop() {
    if (!gameOver) {
        dropPiece();
        setTimeout(gameLoop, 500);
    } else {
        alert("Game Over!");
    }
}

// Start game
draw();
gameLoop();
