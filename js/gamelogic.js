var player;
var gameBall;
var enemies;

function createGame()
{
	player   = new GameObject(0.0, -14.0, -40.0, [1.0, 1.0, 1.0], Pill);
	gameBall = new GameObject(0.0, -10.0, -40.0, [1.0, 0.0, 0.0], Ball);
	enemies  = [];
}
