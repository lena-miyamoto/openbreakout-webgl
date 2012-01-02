"use strict";

var Controls = {
	moveLeft:      false,
	moveRight:     false,
	moveDownwards: false,
	moveTowards:   false,
	paused:        false
};

window.onkeydown = function(event)
{
	if (!acceptInput) return;
	
	switch (event.keyCode)
	{
		case 37: Controls.moveLeft  || (Controls.moveLeft = true);      break; // left
		case 39: Controls.moveRight || (Controls.moveRight = true);     break; // right
		case 32: // space
			if (Controls.paused)
				resumeGame(); // reactivate animation loop (gamelogic.js)
			else
				pauseGame(); // destroy animation loop (gamelogic.js)
			Controls.paused = !Controls.paused;
			break;
		default: console.log(event.keyCode);
	}
}

window.onkeyup = function(event)
{
	if (!acceptInput) return;
	
	switch (event.keyCode)
	{
		case 37: !Controls.moveLeft  || (Controls.moveLeft = false);      break; // left
		case 39: !Controls.moveRight || (Controls.moveRight = false);     break; // right
		default: console.log("Key pressed: " + event.keyCode);
	}
}
