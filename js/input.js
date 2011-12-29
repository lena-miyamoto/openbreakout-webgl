var Controls = {
	moveLeft:      false,
	moveRight:     false,
	moveDownwards: false,
	moveTowards:   false
};

window.onkeydown = function(event)
{
	switch (event.keyCode)
	{
		case 37: Controls.moveLeft      || (Controls.moveLeft = true);      break; // left
		case 39: Controls.moveRight     || (Controls.moveRight = true);     break; // right
		//case 38: Controls.moveDownwards || (Controls.moveDownwards = true); break; // up
		//case 40: Controls.moveTowards   || (Controls.moveTowards = true);   break; // down
		default: console.log(event.keyCode);
	}
}

window.onkeyup = function(event)
{
	switch (event.keyCode)
	{
		case 37: !Controls.moveLeft      || (Controls.moveLeft = false);      break; // left
		case 39: !Controls.moveRight     || (Controls.moveRight = false);     break; // right
		//case 38: !Controls.moveDownwards || (Controls.moveDownwards = false); break; // up
		//case 40: !Controls.moveTowards   || (Controls.moveTowards = false);   break; // down
		default: console.log("Key pressed: " + event.keyCode);
	}
}
