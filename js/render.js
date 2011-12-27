"use strict";

/*const*/ var FPS       = 30;
/*const*/ var FRAME_LEN = 1000 / FPS;
/*const*/ var MAX_DEG   = Math.PI * 2;

var gl;

var RenderContext = function(){				
	// matrices
	this.nMatrix;
	this.mvMatrix;
	this.projMatrix;
	// pointer to shader attributes
	this.vertexPositionAttribute;
	this.vertexNormalAttribute;
	// pointer to shader uniforms
	this.meshColorUniform;
	this.nMatrixUniform;
	this.mvMatrixUniform;
	this.projMatrixUniform;
};

var GameObject = function(x, y, z, rgb, mesh)
{
	this.x     = x;
	this.y     = y;
	this.z     = z;
	this.rot_x = 0.0;
	this.rot_y = 0.0;
	this.rot_z = 0.0;
	this.rgb   = rgb;
	this.mesh  = mesh;
};

/**
 * Reads shader code from specified script element and compiles it.
 * @param id id of theHTML element which contains the shader code
 * @return the compiled shader or null if the compilation failed
*/
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

/**
 * Compiles and links the vertex and fragment shader to one shader program and
 * adds it to the render context. The references to the shader variables will
 * also be initiated.
*/
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
		gl.useProgram(shaderProgram);										// add complete shader package to our WebGL context

		// get pointers to shader attributes
		RenderContext.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPosition");
		RenderContext.vertexNormalAttribute   = gl.getAttribLocation(shaderProgram, "vertexNormal");
		// get pointers to shader uniforms
		RenderContext.meshColorUniform        = gl.getUniformLocation(shaderProgram, "meshColor");
		RenderContext.nMatrixUniform          = gl.getUniformLocation(shaderProgram, "nMatrix");
		RenderContext.projMatrixUniform       = gl.getUniformLocation(shaderProgram, "projMatrix");
		RenderContext.mvMatrixUniform         = gl.getUniformLocation(shaderProgram, "mvMatrix");
		
		gl.enableVertexAttribArray(RenderContext.vertexPositionAttribute);	// enable the vertex attribute array
		gl.enableVertexAttribArray(RenderContext.vertexNormalAttribute);	// enable the normal attribute array
	}
	else
		window.alert("Cannot link shaders.");
}

/**
 * Inits the vertex and normal buffer for a certain mesh.
 * @param mesh valid mesh object (needs properties: itemSize, numItems, vertices, normals)
*/
function initBuffers(mesh)
{
	mesh.vertexBuffer = gl.createBuffer();		// create a buffer for storing vertices
	mesh.normalBuffer = gl.createBuffer();		// create a buffer for storing normal vectors
	
	// assign vertex array to buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.STATIC_DRAW); 
	// assign normal array to buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.normals), gl.STATIC_DRAW); 
	
	// set dimensions of vertex and normal array
	mesh.vertexBuffer.itemSize = mesh.normalBuffer.itemSize = mesh.itemSize;
	mesh.vertexBuffer.numItems = mesh.normalBuffer.numItems = mesh.numItems;
	
	// delete original coordinates, they are no longer needed
	delete mesh.vertices;
	delete mesh.normals;
}

/**
 * Creates a model-view, projection and normal matrix, needed for rendering with WebGL.
 * Perspective will be set to a angle of 45 degrees, the frustum lies between 0.1 and 100.0.
 * Also the newly created and configured projection matrix will be sent to the shader program
 * (this usually only happens once)
*/
function initEnvironment()
{
	RenderContext.mvMatrix   = mat4.create();	// create model view matrix
	RenderContext.nMatrix    = mat4.create();	// create normal matrix
	RenderContext.projMatrix = mat4.create();	// create projection matrix

	gl.clearColor(0.0, 0.0, 0.0, 1.0);			// set clear color to black, opaque
	gl.enable(gl.DEPTH_TEST);					// enable z-buffer
	gl.viewport(								// set viewport to canvas dimensions
		0, 0,
		gl.viewportWidth,
		gl.viewportHeight
	);
	mat4.perspective(							// set perspective to projection matrix
		55,
		(gl.viewportWidth / gl.viewportHeight),
		0.1, 100.0,
		RenderContext.projMatrix
	);

	// send projection matrix to shader program
	// this has to be done only once, because the projection matrix does not change during our animation
	gl.uniformMatrix4fv(RenderContext.projMatrixUniform, false, RenderContext.projMatrix);
}

/**
 * Draws a certain instance of GameObject into the render context.
 * @param obj a valid game object
*/
function drawObject(obj)
{
	mat4.identity(RenderContext.mvMatrix);							// reset model view matrix
	mat4.rotate(RenderContext.mvMatrix, -0.15, [1, 0, 0]);
	mat4.translate(RenderContext.mvMatrix, [obj.x, obj.y, obj.z]);	// set coordinate system
	mat4.rotate(RenderContext.mvMatrix, obj.rot_x, [1, 0, 0]);		// rotate around the X axis
	mat4.rotate(RenderContext.mvMatrix, obj.rot_y, [0, 1, 0]);		// rotate around the Y axis
	mat4.rotate(RenderContext.mvMatrix, obj.rot_z, [0, 0, 1]);		// rotate around the Z axis
	
	// create normal matrix compatible with current mv matrix (why?)
	var dummyMatrix = mat4.create();
	mat4.inverse(RenderContext.mvMatrix, dummyMatrix);
	mat4.transpose(dummyMatrix, RenderContext.nMatrix);
	
	// bind vertex buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.vertexBuffer);			// send vertex buffer to graphics card
	gl.vertexAttribPointer(RenderContext.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	// bind normal buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.mesh.normalBuffer);			// send normal buffer to graphics card
	gl.vertexAttribPointer(RenderContext.vertexNormalAttribute,   3, gl.FLOAT, false, 0, 0);
	
	// send model-view and normal matrix and color vector to the shader program
	// these values change every frame
	gl.uniform3fv(RenderContext.meshColorUniform, new Float32Array(obj.rgb));
	gl.uniformMatrix4fv(RenderContext.mvMatrixUniform,  false, RenderContext.mvMatrix);
	gl.uniformMatrix4fv(RenderContext.nMatrixUniform,   false, RenderContext.nMatrix);
	
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, obj.mesh.numItems);		// draw player
}

/**
 * Clears the buffer and renders one frame into the render context.
*/
function render(time)
{				
	var remainTime = FRAME_LEN - (new Date().getTime() - time);
	
	if (time != -1 && remainTime > 0) // frame lock
	{
		window.setTimeout(function(){ render(-1); }, remainTime);
	}
	else
	{ 
		window.requestAnimFrame(render);						// ensures a secure (infinite) render loop
	
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	// clear everything
	
		drawObject(player);
		drawObject(gameBall);
		for (var i in enemies)
			drawObject(enemies[i]);
	}
}

/**
 * Simply starts the render function itself which creates and controlled
 * infinite loop.
*/
function startMainLoop()
{
	render(-1);
}
