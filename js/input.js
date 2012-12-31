/**
 * This file is part of OpenBreakout WebGL.
 * 
 * OpenBreakout WebGL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * OpenBreakout WebGL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with OpenBreakout WebGL.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @copyright 2011, 2012 Christoph Matscheko
 * @license
*/

"use strict";

var Controls = {
	moveLeft:      false,
	moveRight:     false,
	moveDownwards: false,
	moveTowards:   false,
	paused:        false,
	
	resetControls: function() {
		Controls.moveLeft      = false;
		Controls.moveRight     = false;
		Controls.moveDownwards = false;
		Controls.moveTowards   = false;
	}
};

window.onkeydown = function(event)
{
	if (!acceptInput) return;
	
	switch (event.keyCode)
	{
		case 37: // left
			Controls.moveLeft = true;
			break;
		case 39: // right
			Controls.moveRight = true;
			break;
		case 32: // space
			if (Controls.paused)
				resumeGame(true); // reactivate animation loop (gamelogic.js)
			else
				pauseGame(true); // destroy animation loop (gamelogic.js)
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
		case 37: // left
			Controls.moveLeft = false;
			break;
		case 39: // right
			Controls.moveRight = false;
			break;
		default:
			console.log("Key pressed: " + event.keyCode);
	}
}
