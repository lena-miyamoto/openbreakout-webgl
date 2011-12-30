"use strict";

var player;
var gameBall;
var enemies;

var animationInterval; // animation loop

var bgsound, crashsound; // audio tracks

var audio = true;

var GameArea   = {
	top:     32.00,
	left:   -21.50,
	bottom: - 9.00,
	right:   23.00,
	rot_x:  - 0.25
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

function createGame()
{
	var margin       =   1.8;
	var default_z    = -40.0;
	var pill_height  = Math.abs(Pill.bounds.ftl[1] - Pill.bounds.bbr[1]);
	var pill_width   = Math.abs(Pill.bounds.ftl[0] - Pill.bounds.bbr[0]);
	
	// borders for enemey objects
	var top_limit    = GameArea.top - 2.0;
	var bottom_limit = top_limit - (pill_height + margin) * 5;
	var left_limit   = GameArea.left + margin;
	var right_limit  = GameArea.right - margin;
	
	console.log("bbox height: " + pill_height);
	console.log("bbox width:  " + pill_width);

	player   = new GameObject(0.0, -8.0, default_z, [1.0, 1.0, 1.0], Pill);
	gameBall = new GameObject(0.0, -2.0, default_z, [1.0, 0.0, 0.0], Ball);
	gameBall.speedX = 0.5;
	gameBall.speedY = 0.5;
	
	// create enemies
	enemies = [];
	var i = 0;
	for (var y = top_limit; y > bottom_limit; y -= (pill_height + margin))
	{
		for (var x = left_limit; x < right_limit; x += (pill_width + margin))
		{
			//console.log("enemy[" + (i++) + "] = " + x + ", " + y);
			enemies.push(new GameObject(x, y, default_z, [1.0, 0.0, 1.0], Pill));
		}
	}
	
	animationInterval = window.setInterval(animate, 30); // do animation in 30 ms interval
	bgsound    = document.getElementById("soundtrack");
	crashsound = document.getElementById("mushroom");
	
	enableAudio();
}

function moveBall()
{
	gameBall.x += gameBall.speedX;
	gameBall.y += gameBall.speedY;
	
	checkBallCollision();
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
	if ((ballTopEdge >= GameArea.top) || (ballBottomEdge <= GameArea.bottom))
		gameBall.speedY = -gameBall.speedY;
	
	// check collision with paddle
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
					crashsound.play(); // play sound
					window.setTimeout(function(){ crashsound.currentTime = 0; }, 100);				
				}
				
				enemies.splice(i--, 1); // delete current paddle
				if (enemies.length == 0)
				{
					window.clearInterval(animationInterval);
					window.alert("You won the game!");
				}
			}
			
			break;
		}
	}
}

function animate()
{
	if (Controls.moveLeft)
		player.x -= 1.0;
	if (Controls.moveRight)
		player.x += 1.0;
	if (Controls.moveDownwards)
		player.z -= 1.0;
	if (Controls.moveTowards)
		player.z += 1.0;
		
	// spin player paddle along x axis
	if (player.rot_x >= MAX_DEG)
		player.rot_x = 0.1;
	else
		player.rot_x += 0.1;
	
	// move game ball up- and downwards
	moveBall();
}

function pauseGame()
{
	window.clearInterval(animationInterval);
}

function resumeGame()
{
	animationInterval = window.setInterval(animate, 30); // do animation in 30 ms interval
}
