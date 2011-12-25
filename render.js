"use strict";

/*const*/ var FPS       = 60;
/*const*/ var FRAME_LEN = 1000 / FPS;
/*const*/ var MAX_DEG   = Math.PI * 2;

var beginSecond = 0;
var framerate = 0;
var degrees = 0.0;

var Position = {
	x: 0.0,
	y: 0.0,
	z: 0.0
};

var Controls = {
	moveLeft:      false,
	moveRight:     false,
	moveDownwards: false,
	moveTowards:   false
};

var gl;
var nMatrix, mvMatrix, projMatrix;
// buffer objects
var vertexBuffer, normalBuffer;
// pointer to shader variables
var vertexPositionAttribute, vertexNormalAttribute;
var nMatrixUniform, mvMatrixUniform, projMatrixUniform;


function getShader(id)
{
	var shaderScript;	// the script tag which stores the shader inside the DOM tree
	var shader;			// the actual compiled shader program (which will be returned)
	var code;			// the shader code itself
	
	shaderScript = document.getElementById(id);
	code = shaderScript.innerHTML;
	if (shaderScript.type == "x-shader/x-fragment")
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	else if (shaderScript.type == "x-shader/x-vertex")
		shader = gl.createShader(gl.VERTEX_SHADER);
	else
	{
		window.alert("Error: Cannot load shader of unknown type!");
		return null;
	}
	
	gl.shaderSource(shader, code);	// hand shader code to WebGL
	gl.compileShader(shader);		// compile shader
	
	// check if compilation was successful
	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))				
		return shader;
	else
	{
		window.alert("Cannot compile shader: " + gl.getShaderInfoLog(shader));
		return null;
	}
}

function initGL(canvas)
{
	gl = WebGLUtils.setupWebGL(canvas);
	
	if (!gl)
		window.alert("Could not initialise WebGL!");
	else
	{
		gl.viewportWidth  = canvas.width;
		gl.viewportHeight = canvas.height;
	}
}

function initShaders()
{
	var shaderProgram;
	var vertexShader, fragmentShader;
	
	vertexShader   = getShader("shader-vs");			// get compiled vertex shader
	fragmentShader = getShader("shader-fs");			// get compiled fragment shader
	
	shaderProgram  = gl.createProgram();				// create a new shader program (global)
	gl.attachShader(shaderProgram, vertexShader);		// add vertex shader to program
	gl.attachShader(shaderProgram, fragmentShader);		// add fragment shader to program
	gl.linkProgram(shaderProgram);						// link the two shaders together to one program

	// check if linking was successful
	if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		gl.useProgram(shaderProgram);					// add complete shader package to our WebGL context

		// get pointers to shader attributes
		vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPosition");
		vertexNormalAttribute   = gl.getAttribLocation(shaderProgram, "vertexNormal");
		// get pointers to shader uniforms
		nMatrixUniform          = gl.getUniformLocation(shaderProgram, "nMatrix");
		projMatrixUniform       = gl.getUniformLocation(shaderProgram, "projMatrix");
		mvMatrixUniform         = gl.getUniformLocation(shaderProgram, "mvMatrix");
		
		gl.enableVertexAttribArray(vertexPositionAttribute);	// enable the vertex attribute array
		gl.enableVertexAttribArray(vertexNormalAttribute);		// enable the normal attribute array
	}
	else
		window.alert("Cannot link shaders.");
}

function initBuffers()
{
	vertexBuffer = gl.createBuffer();		// create a buffer for storing vertices
	normalBuffer = gl.createBuffer();		// create a buffer for storing normal vectors
	
	// assign vertex array to buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Cube.vertices), gl.STATIC_DRAW); 
	// assign normal array to buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Cube.normals), gl.STATIC_DRAW); 
	
	// set dimensions of vertex and normal array
	vertexBuffer.itemSize = normalBuffer.itemSize = Cube.itemSize;
	vertexBuffer.numItems = normalBuffer.numItems = Cube.numItems;
}

function animate()
{
	if (Controls.moveLeft)
		Position.x -= 0.5;
	if (Controls.moveRight)
		Position.x += 0.5;
	if (Controls.moveDownwards)
		Position.z -= 0.5;
	if (Controls.moveTowards)
		Position.z += 0.5;
	
	if (degrees >= MAX_DEG)
		degrees = 0.1;
	else
		degrees += 0.1;
}

function render(time)
{				
	window.requestAnimFrame(render);						// ensures a secure (infinite) render loop
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	// clear everything
	
	mat4.identity(mvMatrix);								// reset model view matrix
	mat4.translate(mvMatrix, [Position.x, Position.y, Position.z]);					// set coordinate system
	mat4.rotate(mvMatrix, 0.5, [1, 0, 0]);					// rotate around the X axis
	mat4.rotate(mvMatrix, degrees, [0, 1, 0]);				// rotate around the Y axis
	
	// create normal matrix compatible with current mv matrix (why?)
	var dummyMatrix = mat4.create();
	mat4.inverse(mvMatrix, dummyMatrix);
	mat4.transpose(dummyMatrix, nMatrix);
	
	// bind vertex buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);			// send vertex buffer to graphics card
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	// bind normal buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);			// send normal buffer to graphics card
	gl.vertexAttribPointer(vertexNormalAttribute,   3, gl.FLOAT, false, 0, 0);
	
	// send model-view and normal matrix to the shader program
	// this matrix changes every frame, so we have to update it frequently
	gl.uniformMatrix4fv(mvMatrixUniform, false, mvMatrix);
	gl.uniformMatrix4fv(nMatrixUniform, false, nMatrix);
	
	gl.drawArrays(gl.TRIANGLES, 0, Cube.numItems);		// draw all vertices to screen
}

function startMainLoop()
{
	Position.z = -7.0; // start position on z-axis is -7.0
	render();
	
	window.setInterval(animate, 40); // do animation in 40 ms interval
}
