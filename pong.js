var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) {window.setTimeout(callback, 1000/60)};

var canvas = document.createElement('canvas');
var width = 400;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');
var player = new Player();
var computer = new Computer();
var ball = new Ball(200, 300);
var scoreSheet = new ScoreSheet();
var sounds = new Sounds();
var keysDown = {};

window.onload = function() {
  document.body.appendChild(canvas);
  animate(step);
  sounds.music.play();
};

var step = function() {
  update();
  render();
  animate(step);
}

var update = function() {
  player.update();
  computer.update(ball);
  ball.update(player.paddle, computer.paddle);
};

var render = function() {
  context.fillStyle = '#FF00FF';
  context.fillRect(0, 0, width, height);
  player.render();
  computer.render();
  ball.render();
  scoreSheet.render();
};

function ScoreSheet() {
  this.playerScore = 0;
  this.computerScore = 0;
}

ScoreSheet.prototype.render = function() {
  context.fillText(("Player: " + this.playerScore), 10, 290);
  context.fillText(("Computer: " + this.computerScore), 10, 310);
}

function Sounds() {
  this.bounce = new Audio("sfx/bounce.wav");
  this.score = new Audio("sfx/score.wav");
  this.music = new Audio("sfx/magic-clouds.mp3");
};

function Paddle(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.x_speed = 0;
  this.y_speed = 0;
};

Paddle.prototype.render = function() {
  context.fillStyle = '#0000FF';
  context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  this.x_speed = x;
  this.y_speed = y;
  if (this.x < 0) { // paddle reached left wall
    this.x = 0;
    this.x_speed = 0;
  } else if (this.x + this.width > 400) { // paddle reached the right wall
    this.x = 400 - this.width;
    this.x_speed = 0;
  }
}

function Player() {
  this.paddle = new Paddle(175, 580, 50, 10);
};

function Computer() {
  this.paddle = new Paddle(175, 10, 50, 10);
};

Player.prototype.render = function () {
  this.paddle.render();
};

Player.prototype.update = function() {
  for(var key in keysDown) {
    var value = Number(key);
    if(value == 37) { // left arrow key
      this.paddle.move(-4, 0);
    } else if (value == 39) { // right arrow key
      this.paddle.move(4, 0);
    } else {
      this.paddle.move(0, 0);
    }
  }
}

Computer.prototype.render = function () {
  this.paddle.render();
};

Computer.prototype.update = function (ball) {
  var x_pos = ball.x;
  var diff = -((this.paddle.x + (this.paddle.width / 2)) - x_pos);
  if(diff < 0 && diff < -4) { // max speed left
    diff = -5;
  } else if (diff > 0 && diff > 4) { // max speed right
    diff = 5;
  }
  this.paddle.move(diff, 0);
  if(this.paddle.x < 0) {
    this.paddle.x = 0;
  } else if (this.paddle.x + this.paddle.width > 400) {
    this.paddle.x = 400 - this.paddle.width;
  }
};

function Ball(x, y) {
  this.x = x;
  this.y = y;
  this.x_speed = 0;
  this.y_speed = 3;
  this.radius = 5;
};

Ball.prototype.render = function() {
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
  context.fillStyle = '#000'
  context.fill();
};

Ball.prototype.update = function(paddle1, paddle2) {
  this.x += this.x_speed;
  this.y += this.y_speed;
  var top_x = this.x - 5;
  var top_y = this.y - 5;
  var bottom_x = this.x + 5;
  var bottom_y = this.y + 5;

  if(this.x - 5 < 0) { // colliding with the left wall
    this.x = 5;
    this.x_speed = -this.x_speed;
  } else if(this.x + 5 > 400) { //colliding with the right wall
    this.x = 395;
    this.x_speed = -this.x_speed;
  }

  if(this.y < 0) { // Player scored
    scoreSheet.playerScore += 1
    sounds.score.play();
    this.resetPosition();
  } else if (this.y > 600) { // Computer Scored
    scoreSheet.computerScore += 1
    sounds.score.play();
    this.resetPosition();
  }

  if(top_y > 300) {
    if(top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
      // collding with the players paddle
      this.y_speed = -3;
      this.x_speed += (paddle1.x_speed / 2);
      this.y += this.y_speed;
      sounds.bounce.play();
    }
  } else {
    if(top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y && top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x) {
      // collding with the computers paddle
      this.y_speed = 3;
      this.x_speed += (paddle2.x_speed / 2);
      this.y += this.y_speed;
      bounce.play();
    }
  }
};

Ball.prototype.resetPosition = function() {
  this.x_speed = 0;
  this.y_speed = 3;
  this.x = 200;
  this.y = 300;
};

window.addEventListener("keydown", function(event) {
  keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
  delete keysDown[event.keyCode];
});
