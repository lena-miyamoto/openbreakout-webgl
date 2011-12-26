var player;
var gameBall;
var enemies;

function createGame()
{
	player   = new GameObject(0.0, 0.0, -7.0, [1.0, 1.0, 1.0], Pill);
	gameBall = new GameObject(0.0, 5.0, -7.0, [1.0, 0.0, 0.0], Ball);
	enemies  = [];
}
