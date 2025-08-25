const board = document.getElementById('game-board');
const statusDiv = document.getElementById('status');
const restartBtn = document.getElementById('restart');


let cells = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;
let winLine = null;
let moveQueue = [];

function renderBoard() {
    board.innerHTML = '';
    cells.forEach((cell, idx) => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell';
        cellDiv.textContent = cell || '';
        // Only fade/blink the oldest move if game is active
        if (gameActive && moveQueue.length === 5 && moveQueue[0].idx === idx) {
            cellDiv.classList.add('fade-blink');
        }
        cellDiv.addEventListener('click', () => handleCellClick(idx));
        board.appendChild(cellDiv);
    });
    // Draw win line if needed
    if (winLine) {
        drawWinLine(winLine);
    }
}

function handleCellClick(idx) {
    if (!gameActive || cells[idx]) return;
    // Add move to queue
    moveQueue.push({ idx, player: currentPlayer });
    if (moveQueue.length > 5) {
        // Remove oldest move
        const oldest = moveQueue.shift();
        cells[oldest.idx] = null;
    }
    cells[idx] = currentPlayer;
    const win = getWinPattern(currentPlayer);
    renderBoard();
    if (win) {
        statusDiv.textContent = `Player ${currentPlayer} wins!`;
        gameActive = false;
        winLine = win;
        renderBoard();
        showConfetti();
    } else if (moveQueue.length === 9) {
        statusDiv.textContent = "It's a draw!";
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDiv.textContent = `Player ${currentPlayer}'s turn`;
    }
// Confetti and particle effect
function showConfetti() {
    // Remove previous confetti
    const oldConfetti = document.getElementById('confetti-canvas');
    if (oldConfetti) oldConfetti.remove();
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.width = board.offsetWidth;
    canvas.height = board.offsetHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '3';
    board.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    // Confetti particles
    const colors = ['#ff00c8', '#00fff7', '#fff700', '#00ff4c', '#ff4c00'];
    const particles = Array.from({length: 40}, () => ({
        x: Math.random() * canvas.width,
        y: -20,
        r: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random()*colors.length)],
        speed: 2 + Math.random() * 3,
        dx: (Math.random()-0.5)*2
    }));
    let frame = 0;
    function animate() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, 2*Math.PI);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.8;
            ctx.fill();
            ctx.globalAlpha = 1;
            p.y += p.speed;
            p.x += p.dx;
        });
        frame++;
        if (frame < 60) {
            requestAnimationFrame(animate);
        } else {
            canvas.remove();
        }
    }
    animate();
}
}

function getWinPattern(player) {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8], // rows
        [0,3,6],[1,4,7],[2,5,8], // cols
        [0,4,8],[2,4,6]          // diags
    ];
    for (let pattern of winPatterns) {
        if (pattern.every(idx => cells[idx] === player)) {
            return pattern;
        }
    }
    return null;
}

function restartGame() {
    cells = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    winLine = null;
    moveQueue = [];
    statusDiv.textContent = `Player ${currentPlayer}'s turn`;
    renderBoard();
}


function drawWinLine(pattern) {
    // Remove any previous SVG
    const oldSvg = document.getElementById('win-svg');
    if (oldSvg) oldSvg.remove();
    // Get cell positions
    const cellsDivs = Array.from(board.getElementsByClassName('cell'));
    if (cellsDivs.length !== 9) return;
    // Get bounding rects
    const rects = pattern.map(idx => cellsDivs[idx].getBoundingClientRect());
    // Get board rect
    const boardRect = board.getBoundingClientRect();
    // Calculate start and end points (center of first and last cell)
    const start = {
        x: rects[0].left + rects[0].width/2 - boardRect.left,
        y: rects[0].top + rects[0].height/2 - boardRect.top
    };
    const end = {
        x: rects[2].left + rects[2].width/2 - boardRect.left,
        y: rects[2].top + rects[2].height/2 - boardRect.top
    };
    // Create SVG line
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'win-svg');
    svg.setAttribute('width', board.offsetWidth);
    svg.setAttribute('height', board.offsetHeight);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '2';
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', start.x);
    line.setAttribute('y1', start.y);
    line.setAttribute('x2', end.x);
    line.setAttribute('y2', end.y);
    line.setAttribute('stroke', '#ff00c8');
    line.setAttribute('stroke-width', '8');
    line.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line);
    board.style.position = 'relative';
    board.appendChild(svg);
}

restartBtn.addEventListener('click', restartGame);

// Initial render
restartGame();
