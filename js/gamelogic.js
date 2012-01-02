"use strict";

/*const*/ var COLOR_PLAYER = [0.1796875, 0.203125, 0.2109375];
/*const*/ var COLOR_BALL   = [0.640625, 0.0, 0.0];
/*const*/ var COLOR_POWER1 = [0.4453125, 0.62109375, 0.80859375];
/*const*/ var COLOR_POWER2 = [0.359375, 0.20703125, 0.3984375];

var player;
var gameBall;
var enemies;

var animationInterval; // animation loop

var bgsound, hitsound, deathsound, finishedsound, gameoversound; // audio elements

var audio       = false;
var acceptInput = false;

var hud = null;
var userMessage = 0;

var GameArea = {
	top:       32.00,
	left:     -21.50,
	bottom:   - 9.00,
	right:     23.00,
	rot_x:    - 0.25,
	defaultZ: -40.00
};

function enableAudio()
{
	audio = true;
	bgsound.play();
}

function disableAudio()
{
	audio = false;
	bgsound.pause();
}

function createEnemies(margin)
{
	var gobj, color, power;
	// enemy object dimensions
	var pillHeight  = Math.abs(Pill.bounds.ftl[1] - Pill.bounds.bbr[1]);
	var pillWidth   = Math.abs(Pill.bounds.ftl[0] - Pill.bounds.bbr[0]);
	// borders for enemey objects
	var topLimit    = GameArea.top - 2.0;
	var bottomLimit = topLimit - (pillHeight + margin) * 5;
	var leftLimit   = GameArea.left + margin;
	var rightLimit  = GameArea.right - margin;
	
	enemies = [];
	for (var y = topLimit, m = 0; y > bottomLimit; y -= (pillHeight + margin), ++m)
	{
		for (var x = leftLimit, n = 0; x < rightLimit; x += (pillWidth + margin), ++n)
		{
			if (m == n)
			{
				color = COLOR_POWER2;
				power = 2;
			}
			else
			{
				color = COLOR_POWER1;
				power = 1;
			}
			
			gobj = new GameObject(x, y, GameArea.defaultZ, color, Pill);
			gobj.power = power; // add power attribute
			enemies.push(gobj);
		}
	}
}

function createHUD()
{
	var li;
	
	for (var h = 0; h < player.lifes; ++h)
	{
		li = document.createElement("li");
		hud.appendChild(li);
	}
}

function resetPlayer()
{
	player.x =  0.0;
	player.y = -8.0;
}

function resetGameBall()
{
	gameBall.x      =  0.0;
	gameBall.y      = -2.0;
	gameBall.speedX =  0.5;
	gameBall.speedY = -0.5;
}

function createGame()
{
	var margin      = 1.8; // margin between two enemy objects
	
	hud             = document.getElementById("hud");
	userMessage     = document.getElementById("usrmsg");
	
	player          = new GameObject(0.0, -8.0, GameArea.defaultZ, COLOR_PLAYER, Pill);
	player.speedX   =  1.0;
	player.lifes    =    3;
	gameBall        = new GameObject(0.0, -2.0, GameArea.defaultZ, COLOR_BALL, Ball);
	gameBall.speedX =  0.5;
	gameBall.speedY = -0.5;
	
	createHUD();
	createEnemies(margin);
	
	bgsound         = document.getElementById("soundtrack");
	hitsound        = document.getElementById("hit");
	deathsound      = document.getElementById("death");
	finishedsound   = document.getElementById("finished");
	gameoversound   = document.getElementById("gameover");
	
	enableAudio();
	
	acceptInput       = true;
	animationInterval = window.setInterval(animate, 30); // do animation in 30 ms interval
}

function gameFinished()
{
	pauseGame();
	acceptInput = false;
	userMessage.innerHTML = "GAME FINISHED!";
	userMessage.style.visibility = "visible";
	
	if (audio)
	{
		bgsound.pause();
		finishedsound.play();
	}
}

function gameOver()
{
	pauseGame();
	acceptInput = false;
	userMessage.innerHTML = "GAME OVER!";
	userMessage.style.visibility = "visible";
	
	if (audio)
	{
		bgsound.pause();
		gameoversound.play();
	}
}

function ballDeath()
{	
	if (--player.lifes < 0) // game over
		gameOver();
	else
	{
		hud.removeChild(hud.firstChild); // remove one heart from HUD
		if (audio)
		{
			bgsound.pause();
			deathsound.play();
		}
		
		pauseGame(); // stop animation to avoid glitches caused by collision detection
		acceptInput = false;
		window.setTimeout(function(){	// resume game in 500 ms
			resetGameBall();
			resetPlayer();
			
			if (audio)
				bgsound.play();
			
			acceptInput = true;
			resumeGame();
		}, (deathsound.duration * 1000));
	}
}

function checkBallCollision()
{
	var paddle;
	var paddleTopEdge, paddleLeftEdge, paddleBottomEdge, paddleRightEdge;
	var ballTopEdge    = gameBall.y + gameBall.mesh.bounds.ftl[1];
	var ballLeftEdge   = gameBall.x + gameBall.mesh.bounds.ftl[0];
	var ballBottomEdge = gameBall.y + gameBall.mesh.bounds.bbr[1];
	var ballRightEdge  = gameBall.x + gameBall.mesh.bounds.bbr[0];
	
	// check wall collisions
	if ((ballLeftEdge <= GameArea.left) || (ballRightEdge >= GameArea.right))
		gameBall.speedX = -gameBall.speedX;
	else if (ballTopEdge >= GameArea.top)
		gameBall.speedY = -gameBall.speedY;
	else if (ballBottomEdge <= GameArea.bottom) // you are dead
		ballDeath(); // player looses 1 life and ball and player positions will be resetted
	else // check collision with all visible paddles (including the player itself)
	{
		for (var i = -1; i < enemies.length; ++i)
		{
			paddle           = (i == -1) ? player : enemies[i];
			paddleTopEdge    = paddle.y + paddle.mesh.bounds.ftl[1];
			paddleLeftEdge   = paddle.x + paddle.mesh.bounds.ftl[0];
			paddleBottomEdge = paddle.y + paddle.mesh.bounds.bbr[1];
			paddleRightEdge  = paddle.x + paddle.mesh.bounds.bbr[0];
		
			if ( // check collision
				(ballBottomEdge <= paddleTopEdge)    &&	// ball touches top layer
				(ballRightEdge  >= paddleLeftEdge)   &&	// ball touches left layer
				(ballTopEdge    >= paddleBottomEdge) &&	// ball touches bottom layer
				(ballLeftEdge   <= paddleRightEdge)		// ball touches right layer
			)
			{			
				if ( // collision from above or below
					((ballBottomEdge <= paddleTopEdge)    && (ballTopEdge    > paddleTopEdge))    ||
					((ballTopEdge    >= paddleBottomEdge) && (ballBottomEdge < paddleBottomEdge))
				)
				{
					gameBall.speedY  = -gameBall.speedY;
					gameBall.y      +=  gameBall.speedY;
				}
				else if ( // collision from left or right
					((ballRightEdge >= paddleLeftEdge)  && (ballLeftEdge  < paddleLeftEdge))  ||
					((ballLeftEdge  <= paddleRightEdge) && (ballRightEdge > paddleRightEdge))
				)
				{
					gameBall.speedX  = -gameBall.speedX;
					gameBall.x      +=  gameBall.speedX;
				}			
			
				if (i != -1)
				{
					if (audio)
					{
						hitsound.play(); // play sound
						window.setTimeout(function(){ hitsound.currentTime = 0; }, 100);				
					}
				
					if (--paddle.power == 0)
					{
						enemies.splice(i--, 1); // delete current paddle
						if (enemies.length == 0)
						{
							gameFinished();
						}
					}
					else if (paddle.power == 1) // change color of paddle according to its power
						paddle.rgb = COLOR_POWER1;					
				}
			
				break;
			}
		}
	}
}

function checkPlayerCollision()
{
	var playerLeftEdge  = player.x + player.mesh.bounds.ftl[0];
	var playerRightEdge = player.x + player.mesh.bounds.bbr[0];
	
	if (playerLeftEdge <= GameArea.left)
		player.x += player.speedX;
	else if (playerRightEdge >= GameArea.right)
		player.x -= player.speedX;
}

function moveBall()
{
	gameBall.x += gameBall.speedX;
	gameBall.y += gameBall.speedY;
	
	checkBallCollision();
}

function movePlayer()
{
	if (Controls.moveLeft)
		player.x -= player.speedX;
	else if (Controls.moveRight)
		player.x += player.speedX;
	else
		return;
	
	checkPlayerCollision();
}

function animate()
{	
	// spin player paddle along x axis
	if (player.rot_x >= MAX_DEG)
		player.rot_x = 0.1;
	else
		player.rot_x += 0.1;
	
	movePlayer();	// move player according to pressed keys
	moveBall();		// move game ball up- and downwards
}

function pauseGame()
{
	window.clearInterval(animationInterval);
}

function resumeGame()
{
	animationInterval = window.setInterval(animate, 30); // do animation in 30 ms interval
}
