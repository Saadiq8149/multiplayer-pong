const {Ball, Paddle} = require("./util.js")

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const {v4: uuidv4} = require('uuid')

const app = express()
const server = http.createServer(app)
const io = new Server(server)
const PORT = 3000
const WIDTH = 900, HEIGHT = 600

app.use(express.static('frontend'));

let rooms = []

server.listen(PORT, () => {
    console.log("Hello world")
    rooms.push(new Room(uuidv4()))
})

io.on("connection", socket => {
    addToRoom(socket)
    if (rooms[rooms.length - 1].playerCount == 2) {
        rooms[rooms.length - 1].startGame()
    }
    socket.on("disconnect", () => {
        console.log("Someone disconnected")
        handlePlayerDisconnect(socket)
    })
})

function addToRoom(socket) {
    for (let room of rooms) {
        if (room.playerCount < 2) {
            room.addToRoom(socket)
            return
        }
    }
    rooms.push(new Room(uuidv4()))
    addToRoom(socket)
}


function handlePlayerDisconnect(socket) {
    for (let i = 0; i<rooms.length; i++) {
        let room = rooms[i]
        for (let j = 0; j<room.players.length; j++) {
            if (socket.id == room.players[j].id) {
                room.players.splice(j, 1)
                room.playerCount--
                room.start = false
                if (room.players.length == 0) {
                    rooms.splice(i, 1)
                }
            }
        }
    }
}

class Room {
    constructor (id) {
        this.id = id
        this.players = []
        this.playerCount = this.players.length
        this.ball = new Ball(WIDTH/2, HEIGHT/2)
        this.paddle1 = new Paddle(WIDTH-35, HEIGHT/2)
        this.paddle2 = new Paddle(35, HEIGHT/2)
        this.score1 = 0
        this.score2 = 0
        this.running = true
        this.resetTimer = 0
        this.start = true
    }
    addToRoom (socket) {
        this.players.push(socket)
        this.playerCount++
    }
    startGame () {
        this.start = true
        this.resetRoom()
        let player1 = rooms[rooms.length-1].players[0]
        let player2 = rooms[rooms.length-1].players[1]
        player1.emit('startGame', 1)
        player2.emit('startGame', 2)
        player1.on('move', (data) => {
            this.paddle1.move(data)
        })
        player2.on('move', (data) => {
            this.paddle2.move(data)
        })

        const gameloop = setInterval(() => {
            // console.log(this.playerCount)
            if (this.playerCount < 2) {
                clearInterval(gameloop)
                for (const player of this.players) {
                    player.emit('updateGameState', {
                        ball: {
                            x: this.ball.x,
                            y: this.ball.y,
                            x_vel: this.ball.x_vel,
                            y_vel: this.ball.y_vel
                        },
                        paddle1: {
                            x: this.paddle1.x,
                            y: this.paddle1.y
                        },
                        paddle2: {
                            x: this.paddle2.x,
                            y: this.paddle2.y
                        },
                        running: this.running,
                        score1: this.score1,
                        score2: this.score2,
                        start: this.start
                    })
                }
            }
            if (this.running) {
                this.ball.collisionWithPaddle(this.paddle1.x, this.paddle1.y, this.paddle1.w, this.paddle1.h)
                this.ball.collisionWithPaddle(this.paddle2.x, this.paddle2.y, this.paddle2.w, this.paddle2.h)
                this.ball.update()
                if (this.ball.x + this.ball.r >= WIDTH) {
                    this.score2++
                    this.running=false
                } else if (this.ball.x - this.ball.r <= 0) {
                    this.score1++
                    this.running=false
                }
            } else {
                this.resetTimer++
                if (this.resetTimer == 200) {
                  this.resetRound(this.ball, this.enemy, this.player)
                  this.running = true
                  this.resetTimer = 0
                }
            }

            for (const player of this.players) {
                player.emit('updateGameState', {
                    ball: {
                        x: this.ball.x,
                        y: this.ball.y,
                        x_vel: this.ball.x_vel,
                        y_vel: this.ball.y_vel
                    },
                    paddle1: {
                        x: this.paddle1.x,
                        y: this.paddle1.y
                    },
                    paddle2: {
                        x: this.paddle2.x,
                        y: this.paddle2.y
                    },
                    running: this.running,
                    score1: this.score1,
                    score2: this.score2,
                    start: this.start
                })
            }
        }, 1000/120)
    }
    resetRound() {
        this.ball.reset()
        this.paddle1.reset()
        this.paddle2.reset()
    }
    resetRoom() {
        this.resetRound()
        this.score1 = 0
        this.score2 = 0
        this.running = true
        this.resetTimer = 0
    }
}
