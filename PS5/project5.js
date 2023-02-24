// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// form the transformation matrix.
	var matrixX = [ 
		1, 0, 0, 0, 
		0, Math.cos(rotationX), Math.sin(rotationX), 0, 
		0, -Math.sin(rotationX), Math.cos(rotationX), 0, 
		0, 0, 0, 1
	];
	var matrixY = [ 
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0, 
		0, 1, 0, 0, 
		Math.sin(rotationY), 0, Math.cos(rotationY), 0, 
		0, 0, 0, 1
	];
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	return MatrixMult(trans, MatrixMult(matrixX, matrixY));
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// Start the program
		this.prog = InitShaderProgram(meshVS, meshFS);

		// Get the ids of the uniform variables in the shaders
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.sampler = gl.getUniformLocation(this.prog, 'tex');
		this.swap = gl.getUniformLocation(this.prog, 'swap');
		this.show = gl.getUniformLocation(this.prog, 'show');
		this.mv = gl.getUniformLocation(this.prog, 'mv');
		this.normMat = gl.getUniformLocation(this.prog, 'normMat');
		this.lightDir = gl.getUniformLocation(this.prog, 'lightDir');
		this.shine = gl.getUniformLocation(this.prog, 'shine');

		// Get the ids of the vertex attributes in the shaders
		this.pos = gl.getAttribLocation(this.prog, 'pos');
		this.txc = gl.getAttribLocation(this.prog, 'txc');
		this.norm = gl.getAttribLocation(this.prog, 'norm');

		// Create buffers
		this.posBuffer = gl.createBuffer();
		this.texBuffer = gl.createBuffer();
		this.normBuffer = gl.createBuffer();
		
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		//Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;

		//get vertPos
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		//get vertCoords
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		//get normBuffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		//Set the uniform parameter(s) of the vertex shader
		gl.useProgram(this.prog);
		gl.uniform1i(this.swap, swap);
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		//Complete the WebGL initializations before drawing
		gl.useProgram(this.prog);

		//link the matrix
		gl.uniformMatrix4fv(this.mvp, false, matrixMVP);
		gl.uniformMatrix4fv(this.mv, false, matrixMV);
		gl.uniformMatrix3fv(this.normMat, false, matrixNormal);

		//get vert pos buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
		gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.pos);

		//get texture buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
		gl.vertexAttribPointer(this.txc, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.txc);

		//get norm buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
		gl.vertexAttribPointer(this.norm, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.norm);

		//draw line between them
		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		//Bind the texture
		const t = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, t)

		//set value here
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

		//generate and start
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.activeTexture(gl.TEXTURE0);
		gl.useProgram(this.prog);
		gl.uniform1i(this.sampler,0);
		gl.uniform1i(this.show, 1);
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		//set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.prog);
		gl.uniform1i(this.show, show);
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.prog);
		gl.uniform3f(this.lightDir, x, y, z);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram(this.prog);
		gl.uniform1f(this.shine, shininess);
	}
}

// Vertex Shader
var meshVS = `
	attribute vec3 pos;
	attribute vec2 txc;
	attribute vec3 norm;

	uniform mat4 mvp;
	uniform mat4 mv;
	uniform mat3 normMat;
	uniform int swap;

	varying vec2 texCoord;
	varying vec3 position;
	varying vec3 normalV;
	void main()
	{
		texCoord = txc;
		vec4 vertPos4 = mv * vec4(pos[0], pos[2], pos[1], 1.0);
		position = vec3(vertPos4);
		normalV = normMat * norm;

		if (swap == 1) {
			gl_Position = mvp * vec4(pos[0], pos[2], pos[1], 1.0);
		}
		else {
			gl_Position = mvp * vec4(pos, 1.0);
		}
	}
`;

// Fragment Shader
var meshFS = `
	precision mediump float;
	uniform bool show;
	uniform sampler2D tex;
	
	uniform vec3 lightDir;
	uniform float shine;
	varying vec2 texCoord;
	varying vec3 position;
	varying vec3 normalV;
	
	void main()
	{
		vec3 diffuseColor = vec3(1.0, 1.0, 1.0);
		//vec3 lightColor = vec3(1.0, 1.0, 1.0);
		vec3 specularColor = vec3(1.0, 1.0, 1.0);

		if (show) {
			diffuseColor = vec3(texture2D(tex, texCoord));
		}
		vec3 viewDirection = normalize(lightDir-position);
		vec3 lightDirection = lightDir;

		vec3 h = normalize(lightDirection + viewDirection);
		vec3 normal = normalV;

		float cosTheta = dot(normal, lightDir);
		float cosPhi = dot(normal, h);

		float specPower = pow(cosPhi, shine);
		gl_FragColor = vec4((cosTheta * diffuseColor + specularColor * specPower), 1.0);
	}
`;
