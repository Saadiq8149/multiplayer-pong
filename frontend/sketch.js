
const WIDTH = 900, HEIGHT = 600;
let score2 = 0, score1 = 0, running=true, startGame = false
let player, enemy, id, ball;

function setup() {
  createCanvas(WIDTH, HEIGHT);

  socket = io.connect('http://localhost:3000')

  ball = {
    x: WIDTH/2,
    y: HEIGHT/2,
    r: 8,
    x_vel: 0,
    y_vel: 0
  }
  player = {
    x: 0,
    y: 0,
    w: 15,
    h: 70
  }
  enemy = {
    x: 0,
    y: 0,
    w: 15,
    h: 70
  }

  socket.on('updateGameState', (data) => {
    ball.x = data.ball.x
    ball.y = data.ball.y
    ball.x_vel = data.ball.x_vel
    ball.y_vel = data.ball.y_vel
    if (id == 1) {
      player.x = data.paddle1.x; player.y = data.paddle1.y
      enemy.x = data.paddle2.x; enemy.y = data.paddle2.y
    } else {
      player.x = data.paddle2.x; player.y = data.paddle2.y
      enemy.x = data.paddle1.x; enemy.y = data.paddle1.y
    }
    score1 = data.score1
    score2 = data.score2
    running = data.running
    startGame = data.start
  })
}

function draw() {
  background(28, 25, 23)
  if (startGame) {
    gameLoop()
  } else {
    fill(255)
    textSize(40)
    textAlign(CENTER)
    text("Waiting for opponent to connect...", WIDTH/2, HEIGHT/2)
    socket.on('startGame', (data) => {
      id = data
      if (data == 1) {
        startGame = true
      } else if (data == 2) {
        startGame = true
      }
    })
  }
}

function gameLoop() {
  stroke(255, 255, 255)
  line(WIDTH/2, 0, WIDTH/2, HEIGHT)

  if (running) {
    fill(255, 255, 255)
    rectMode(CENTER)
    rect(player.x, player.y, player.w, player.h)
    rect(enemy.x, enemy.y, enemy.w, enemy.h)
    circle(ball.x, ball.y, ball.r*2)

    textSize(40)
    textAlign(CENTER)
    text(score2, WIDTH/2-30, HEIGHT/2+20)
    text(score1, WIDTH/2+30, HEIGHT/2+20)

    if (keyIsPressed) {
      switch (keyCode) {
        case UP_ARROW:
          socket.emit('move', -1)
          break
        case DOWN_ARROW:
          socket.emit('move', 1)
          break
      }
    }
  }
}
