"use strict";

var player;
var gameBall;
var enemies;

var GameArea = {
	top:     32.00,
	left:   -21.50,
	bottom: - 9.00,
	right:   23.00,
	rot_x:  - 0.25
};

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
			console.log("enemy[" + (i++) + "] = " + x + ", " + y);
			enemies.push(new GameObject(x, y, default_z, [1.0, 0.0, 1.0], Pill));
		}
	}
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
	var top_hit, left_hit, bottom_hit, right_hit;
	var top_pos    = gameBall.y + gameBall.mesh.bounds.ftl[1];
	var left_pos   = gameBall.x + gameBall.mesh.bounds.ftl[0];
	var bottom_pos = gameBall.y + gameBall.mesh.bounds.bbr[1];
	var right_pos  = gameBall.x + gameBall.mesh.bounds.bbr[0];
	
	// check wall collisions
	if ((left_pos <= GameArea.left) || (right_pos >= GameArea.right))
		gameBall.speedX = -gameBall.speedX;
	if ((top_pos >= GameArea.top) || (bottom_pos <= GameArea.bottom))
		gameBall.speedY = -gameBall.speedY;
	
	// check collision with paddle
	for (var i = -1; i < enemies.length; ++i)
	{
		paddle     = (i == -1) ? player : enemies[i];
		top_hit    = bottom_pos <= (paddle.y + paddle.mesh.bounds.ftl[1]); // ball touches top layer
		left_hit   = right_pos  >= (paddle.x + paddle.mesh.bounds.ftl[0]); // ball touches left layer
		bottom_hit = top_pos    >= (paddle.y + paddle.mesh.bounds.bbr[1]); // ball touches bottom layer
		right_hit  = left_pos   <= (paddle.x + paddle.mesh.bounds.bbr[0]); // ball touches right layer
		
		// && (((gameBall.speedX > 0) && left_hit) || ((gameBall.speedX < 0) && right_hit))
		if (top_hit && bottom_hit)
		{
			if (gameBall.speedX > 0 && left_hit)
				paddle.rgb = [0.4, 0.6, 0.8];
			else if (gameBall.speedX < 0 && right_hit)
				paddle.rgb = [0.6, 0.1, 0.9];
			
			//gameBall.speedX = -gameBall.speedX;
			//gameBall.y += gameBall.speedY;
			
			//enemies.splice(i--, 1); // delete current paddle
			//paddle.rgb = [0.4, 0.4, 0.4];
		}
		// && (((gameBall.speedY > 0) && bottom_hit) || ((gameBall.speedY < 0) && top_hit))
		if (left_hit && right_hit)
		{
			//gameBall.speedY = -gameBall.speedY;
			//gameBall.y += gameBall.speedY;
			
			//enemies.splice(i--, 1); // delete current paddle
			if (gameBall.speedY > 0 && bottom_hit)
				paddle.rgb = [0.6, 0.8, 0.2];
			else if (gameBall.speedY < 0 && top_hit)
				paddle.rgb = [0.2, 0.8, 0.6];
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
