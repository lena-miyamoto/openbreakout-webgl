var player;
var gameBall;
var enemies;

function createGame()
{
	var margin      =   1.5;
	var default_z   = -40.0;
	var pill_height = Math.abs(Pill.bounds.ftl[1] - Pill.bounds.bbr[1]);
	var pill_width  = Math.abs(Pill.bounds.ftl[0] - Pill.bounds.bbr[0]);

	console.log("bbox height: " + pill_height);
	console.log("bbox width:  " + pill_width);

	player   = new GameObject(0.0, -14.0, default_z, [1.0, 1.0, 1.0], Pill);
	gameBall = new GameObject(0.0, -10.0, default_z, [1.0, 0.0, 0.0], Ball);
	gameBall.speedX  = 0.5;
	gameBall.speedY  = 0.5;
	//gameBall.upwards = true;
	
	// create enemies
	enemies = [];
	for (var y = 14.0; y > 5.0; y -= (pill_height + margin))
	{
		for (var x = -14.0; x < 14.0; x += (pill_width + margin))
		{
			enemies.push(new GameObject(x, y, default_z, [1.0, 0.0, 1.0], Pill));
		}
	}
}
