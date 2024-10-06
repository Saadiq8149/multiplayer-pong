const WIDTH = 900, HEIGHT = 600;
class Paddle {
    constructor(x, y) {
      this.x = x
      this.initialX = x
      this.initialY = y
      this.y = y
      this.w = 15
      this.h = 70
    }

    move(dir) {
      const SPEED = this.h/4
      const wallInWay = (dir==-1 ? this.y - this.h/2 <= 0 : this.y + this.h/2 >= HEIGHT)

      if (wallInWay) return
      this.y += SPEED*dir
    }

    // aiMove(ball_y) {
    //   if (this.y + this.h/2 < ball_y) {
    //     this.move(1)
    //   } else if (this.y - this.h/2 > ball_y) {
    //     this.move(-1)
    //   }
    // }

    reset() {
      this.x = this.initialX
      this.y = this.initialY
    }
  }

class Ball {
    constructor (x, y) {
      this.x = x
      this.y = y
      this.angle = Math.random(0, 2*Math.PI)
      this.x_vel = Math.random(0, 1) >= 0.5 ? 1 : -1
      this.y_vel = Math.sin(this.angle)
      this.r = 8
    }

    update() {
      const XSPEED = 8, YSPEED = 4
      if (this.x - this.r >= 0 && this.x + this.r <= WIDTH) {
        this.x += this.x_vel*XSPEED
      } else {
        this.x_vel *= -1
        this.x += this.x_vel*XSPEED
      }
      if (this.y - this.r >= 0 && this.y + this.r <= HEIGHT) {
          this.y += this.y_vel*YSPEED
      } else {
        this.y_vel *= -1
        this.y += this.y_vel*YSPEED
      }
    }

    // CHANGE THIS CODE TO DO COLLISIONS PROPERLY (MATHS & PHY)
    collisionWithPaddle(paddle_x, paddle_y, w, h){
      if (this.x - this.r < paddle_x+(w/2) && this.x + this.r > paddle_x-w/2) {
        if (this.y < paddle_y + h/2 && this.y > paddle_y - h/2) {
          this.x_vel *= -1
          this.angle = Math.random(0, 2*Math.PI)
          this.y_vel = Math.sin(this.angle)
        }
      }
    }

    reset() {
      this.x = WIDTH/2
      this.y = HEIGHT/2
      this.angle = Math.random(0, 2*Math.PI)
      this.x_vel = Math.random(0, 1) >= 0.5 ? 1 : -1
      this.y_vel = Math.sin(this.angle)
    }
  }

module.exports = {Ball, Paddle}
