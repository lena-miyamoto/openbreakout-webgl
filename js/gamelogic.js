var player;
var gameBall;
var enemies;

var GameArea = {
	top:     32.00,
	left:   -21.50,
	bottom: - 9.00,
	right:   23.00,
	rot_x:  - 0.25
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
	gameBall.speedX  = 0.5;
	gameBall.speedY  = 0.5;
	//gameBall.upwards = true;
	
	// create enemies
	enemies = [];
	for (var y = top_limit; y > bottom_limit; y -= (pill_height + margin))
	{
		for (var x = left_limit; x < right_limit; x += (pill_width + margin))
		{
			enemies.push(new GameObject(x, y, default_z, [1.0, 0.0, 1.0], Pill));
		}
	}
}

function checkBallCollision()
{
	var top_pos    = gameBall.y + gameBall.mesh.bounds.ftl[1];
	var left_pos   = gameBall.x + gameBall.mesh.bounds.ftl[0];
	var bottom_pos = gameBall.y + gameBall.mesh.bounds.bbr[1];
	var right_pos  = gameBall.x + gameBall.mesh.bounds.bbr[0];
	
	// check wall collisions
	if ((left_pos <= GameArea.left) || (right_pos >= GameArea.right))
		gameBall.speedX = -gameBall.speedX;
	if ((top_pos >= GameArea.top) || (bottom_pos <= GameArea.bottom))
		gameBall.speedY = -gameBall.speedY;
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
	checkBallCollision();
	gameBall.x += gameBall.speedX;
	gameBall.y += gameBall.speedY;
}
