//simbolicke konstante
//dimenzije canvasa 
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BORDER_WIDTH = 5;
//broj cigli
const BRICK_ROWS = 5;
const BRICK_COLUMNS = 10;
const BRICK_COUNT = BRICK_ROWS * BRICK_COLUMNS;
//dimenzije i pozicije cigli
const BRICK_H = 25;
const BRICK_HORIZONTAL_GAP = 30;
const BRICK_VERTICAL_GAP = 15;
const BRICK_OFFSET_TOP = 50;
const BRICK_W = (CANVAS_WIDTH - BRICK_HORIZONTAL_GAP * (BRICK_COLUMNS + 1)) / BRICK_COLUMNS;
//dimenzije i pozicija palice
const PADDLE_W = 120;
const PADDLE_H = 14;
const PADDLE_OFFSET_BOTTOM = 30;
const PADDLE_SPEED = 5;
//dimenzije i brzina loptice
const BALL_SIZE = 10;
const BALL_SPEED = 4;
const BALL_SPEED_INCREMENT_ON_CORNER = 1; //ubrzanje kad lupi u kut cigle

//boje cigli
const BRICK_COLORS = [
  'rgb(153,51,0)',
  'rgb(255,0,0)',
  'rgb(255,153,204)',
  'rgb(0,255,0)',
  'rgb(255,255,153)'
];
//globalne varijable
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let highscore = parseInt(localStorage.getItem('highscore') || '0');

let bricks = []; 

//objekt palice
let paddle = {
  x: (CANVAS_WIDTH - PADDLE_W) / 2,
  y: CANVAS_HEIGHT - PADDLE_OFFSET_BOTTOM - PADDLE_H,
  w: PADDLE_W,
  h: PADDLE_H
};

//objekt loptice
let ball = {
  x: paddle.x + (paddle.w - BALL_SIZE) / 2,
  y: paddle.y - BALL_SIZE,
  size: BALL_SIZE,
  vx: 0,
  vy: 0
};
//stanja igre
let keys = { left: false, right: false };
let playing = false;
let gameOver = false;
let gameWin = false;


//osjencani pravokutnik
function draw3DRect(x, y, w, h, fill, shadowColor = 'rgba(0,0,0,0.4)') {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h)
  //sjencanje ruba
  ctx.beginPath();
  ctx.moveTo(x + 2, y + h - 2);
  ctx.lineTo(x + w - 2, y + h - 2);
  ctx.lineTo(x + w - 2, y + 2);
  ctx.strokeStyle = shadowColor;
  ctx.lineWidth = 2;
  ctx.stroke();
}



//iscrtavanje canvasa
function draw() {
  //pozadina
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  //rub
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeRect(BORDER_WIDTH / 2, BORDER_WIDTH / 2, CANVAS_WIDTH - BORDER_WIDTH, CANVAS_HEIGHT - BORDER_WIDTH);

  //score
  ctx.font = '16px Helvetica, Verdana, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Score: ' + score, 20 + BORDER_WIDTH, 20 + BORDER_WIDTH);

  //highscore
  ctx.textAlign = 'right';
  ctx.fillText('Highscore: ' + highscore, CANVAS_WIDTH - BORDER_WIDTH - 20, 20 + BORDER_WIDTH);

  //cigle
  for (let b of bricks) {
    if (!b.alive) continue;
    draw3DRect(b.x, b.y, b.w, b.h, b.color);
  }

  draw3DRect(paddle.x, paddle.y, paddle.w, paddle.h, 'rgb(200,200,200)'); //palica
  draw3DRect(ball.x, ball.y, ball.size, ball.size, 'rgb(200,200,200)'); //loptica

  //pocetni tekst
  if (!playing && !gameOver && !gameWin) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Helvetica, Verdana';
    ctx.fillText('BREAKOUT', CANVAS_WIDTH / 2 + BORDER_WIDTH, CANVAS_HEIGHT / 2 + BORDER_WIDTH);

    ctx.font = 'italic bold 18px Helvetica, Verdana, sans-serif';
    ctx.fillText('Press SPACE to begin', CANVAS_WIDTH / 2 + BORDER_WIDTH, CANVAS_HEIGHT / 2 + 10 + 36/2 + BORDER_WIDTH);
  }

  //game over tekst
  if (gameOver) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'yellow';
    ctx.font = 'bold 40px Helvetica, Verdana, sans-serif';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2 + BORDER_WIDTH, CANVAS_HEIGHT / 2 + BORDER_WIDTH);
  }
  //victory tekst
  if (gameWin) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'yellow';
    ctx.font = 'bold 40px Helvetica, Verdana, sans-serif';
    ctx.fillText('YOU WON!', CANVAS_WIDTH / 2 + BORDER_WIDTH, CANVAS_HEIGHT / 2 + BORDER_WIDTH);
  }
}

//fizika
function update() {
  if (!playing) {
    //micanje palice prije pocetka
    if (keys.left) {
      paddle.x -= PADDLE_SPEED;
      ball.x = paddle.x + (paddle.w - ball.size) / 2;
      ball.y = paddle.y - ball.size;
      if (paddle.x < BORDER_WIDTH) { paddle.x = BORDER_WIDTH; }
    }
    if (keys.right) {
      paddle.x += PADDLE_SPEED;
      ball.x = paddle.x + (paddle.w - ball.size) / 2;
      ball.y = paddle.y - ball.size;
      if (paddle.x + paddle.w > (CANVAS_WIDTH - BORDER_WIDTH)) { paddle.x = CANVAS_WIDTH - BORDER_WIDTH - paddle.w; }
    }
    return;
  }

  //micanje palice
  if (keys.left) {
    paddle.x -= PADDLE_SPEED;
    if (paddle.x < BORDER_WIDTH) { paddle.x = BORDER_WIDTH; }
  }
  if (keys.right) {
    paddle.x += PADDLE_SPEED;
    if (paddle.x + paddle.w > (CANVAS_WIDTH - BORDER_WIDTH)) { paddle.x = CANVAS_WIDTH - BORDER_WIDTH - paddle.w; }
  }

  //micanje loptice
  ball.x += ball.vx;
  ball.y += ball.vy;

  //sudar s rubovima
  if (ball.x <= BORDER_WIDTH) { ball.x = BORDER_WIDTH; ball.vx = -ball.vx; } //lijevi zid
  if (ball.x + ball.size >= (CANVAS_WIDTH - BORDER_WIDTH)) {
    ball.x = CANVAS_WIDTH - BORDER_WIDTH - ball.size;
    ball.vx = -ball.vx;
  } //desni zid
  if (ball.y <= BORDER_WIDTH) { ball.y = BORDER_WIDTH; ball.vy = -ball.vy; } //gornji zid

  //sudar s palicom 
  if ((ball.x < paddle.x + paddle.w && ball.x + ball.size > paddle.x && ball.y < paddle.y + paddle.h && ball.y + ball.size > paddle.y)) { //overlap loptice i palice
    let hitPosition = (ball.x + ball.size / 2) - (paddle.x + paddle.w / 2); //koji dio palice je sudaren u odnosu na sredinu
    let normal = hitPosition / (paddle.w / 2); //svodenje na -1 do 1 
    let angle = normal * (60 * (Math.PI / 180)); //-1 do 1 -> -60° do 60°
    let speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);;
    ball.vx = speed * Math.sin(angle);
    ball.vy = speed * (-Math.abs(Math.cos(angle)));
    ;
  }

  // sudar s ciglama
  for (let b of bricks) {
    if (!b.alive) continue;
    if (ball.x < b.x + b.w && ball.x + ball.size > b.x && ball.y < b.y + b.h && ball.y + ball.size > b.y) { //overlap loptice i cigle
      let overlapLeft = (ball.x + ball.size) - b.x;
      let overlapRight = (b.x + b.w) - ball.x;
      let overlapTop = (ball.y + ball.size) - b.y;
      let overlapBottom = (b.y + b.h) - ball.y;
      let minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom); //kojoj strani je najblize

      if (minOverlap === overlapLeft) { //sudar s lijeve strane
        ball.x = b.x - ball.size - 0.1; ball.vx = -Math.abs(ball.vx);
      } else if (minOverlap === overlapRight) { //sudar s desne strane
        ball.x = b.x + b.w + 0.1; ball.vx = Math.abs(ball.vx);
      } else if (minOverlap === overlapTop) { //sudar s gornje strane
        ball.y = b.y - ball.size - 0.1; ball.vy = -Math.abs(ball.vy);
      } else {
        ball.y = b.y + b.h + 0.1; ball.vy = Math.abs(ball.vy); //sudar s donje strane
      }

      //provjera sudara u kut cigle
      if (Math.abs(overlapLeft - overlapTop) < 1 || Math.abs(overlapRight - overlapTop) < 1 || Math.abs(overlapLeft - overlapBottom) < 1 || Math.abs(overlapRight - overlapBottom) < 1) {
        let speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        let newSpeed = speed * BALL_SPEED_INCREMENT_ON_CORNER;
        ball.vx *= newSpeed / speed;
        ball.vy *= newSpeed / speed;
      }

      b.alive = false;
      score += 1;

      if (score >= BRICK_COUNT) {
        playing = false; 
        gameWin = true;
        if (score > highscore) {
          highscore = score;
          localStorage.setItem('highscore', String(highscore));
        }
      }
      break;
    }
  }

  //kraj igre ako loptica prode ispod
  if (ball.y > CANVAS_HEIGHT - BORDER_WIDTH) {
    playing = false;
    gameOver = true;
    if (score > highscore) {
      highscore = score;
      localStorage.setItem('highscore', String(highscore));
    }

  }
}

//glavna petlja
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

//pritisci tipki
window.addEventListener('keydown', (e) => {
  //micanje palice
  if (e.code === 'ArrowLeft' || e.key === 'a') { keys.left = true; }
  if (e.code === 'ArrowRight' || e.key === 'd') { keys.right = true; }

  //pocetak igre
  if (e.code === 'Space') {
    if (!playing && !gameOver && !gameWin) {
      let direction = Math.random() < 0.5 ? -1 : 1;
      let s = BALL_SPEED / Math.SQRT2;
      ball.vx = direction * s;
      ball.vy = -s;
      playing = true;
      gameOver = false; 
      gameWin = false;
    } else if (gameOver || gameWin) {
      startNewGame();
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { keys.left = false; }
  if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keys.right = false; }
});

function startNewGame() {
  score = 0;
  playing = false;
  gameOver = false;
  gameWin = false;
  //vracanje loptice na palicu
  paddle.x = (CANVAS_WIDTH - paddle.w) / 2;
  ball.size = BALL_SIZE;
  ball.x = paddle.x + (paddle.w - ball.size) / 2;
  ball.y = paddle.y - ball.size;
  ball.vx = 0;
  ball.vy = 0;
  //inicijaliziranje cigli
  bricks = [];
  for (let i = 0; i < BRICK_ROWS; i++) {
    for (let j = 0; j < BRICK_COLUMNS; j++) {
      let brick = {
        x: BRICK_HORIZONTAL_GAP + j * (BRICK_W + BRICK_HORIZONTAL_GAP),
        y: BRICK_OFFSET_TOP + i * (BRICK_H + BRICK_VERTICAL_GAP),
        w: BRICK_W,
        h: BRICK_H,
        alive: true,
        color: BRICK_COLORS[i % BRICK_COLORS.length]
      }
      bricks.push(brick);
    }
  }
  draw();
}

//pocetak igre
startNewGame();
requestAnimationFrame(loop);


