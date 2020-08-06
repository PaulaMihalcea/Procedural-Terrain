function main() {  // function è la parola chiave per definire una funzione
    
    // Step 1: Prepare the canvas and get WebGL context

    var canvas = document.getElementById('webgl');  // Retrieve <canvas> element. Con document facciamo riferimento alla pagina HTML da cui siamo partiti, e ci riferiamo al tag con id 'example' (il nostro canvas)

    if (!canvas) { // Ritorna un errore se l'elemento con l'id specifricato non è un canvas
        console.log('Failed to retrieve the <canvas> element.');
        return false; 
    } 


    var gl = getWebGLContext(canvas); // Get the rendering context for WebGL
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL.');
        return;
    }

    
    // Step 2: Define the geometry and store it in buffer objects
    
    var vertices = [0.5, 0.5, // Vertex 1
                    0.1, -0.5, // Vertex 2
                    0.5, -0.5]; // Vertex 3
    
    var vertex_buffer = gl.createBuffer(); // Create a new buffer object

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer); // Bind an empty array buffer to it
         
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); // Pass the vertices data to the buffer

    gl.bindBuffer(gl.ARRAY_BUFFER, null); // Unbind the buffer
    
    
    
    
    
    
    
    /* Step 3: Create and compile Shader programs */

     // Vertex shader source code
     var vertCode =
        'attribute vec2 coordinates;' + 
        'void main(void) {' + ' gl_Position = vec4(coordinates,0.0, 1.0);' + '}';

     //Create a vertex shader object
     var vertShader = gl.createShader(gl.VERTEX_SHADER);

     //Attach vertex shader source code
     gl.shaderSource(vertShader, vertCode);

     //Compile the vertex shader
     gl.compileShader(vertShader);

     //Fragment shader source code
     var fragCode = 'void main(void) {' + 'gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);' + '}';

     // Create fragment shader object
     var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

     // Attach fragment shader source code
     gl.shaderSource(fragShader, fragCode);

     // Compile the fragment shader
     gl.compileShader(fragShader);

     // Create a shader program object to store combined shader program
     var shaderProgram = gl.createProgram();

     // Attach a vertex shader
     gl.attachShader(shaderProgram, vertShader); 

     // Attach a fragment shader
     gl.attachShader(shaderProgram, fragShader);

     // Link both programs
     gl.linkProgram(shaderProgram);

     // Use the combined shader program object
     gl.useProgram(shaderProgram);
    
    
    
    /* Step 4: Associate the shader programs to buffer objects */

         //Bind vertex buffer object
         gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

         //Get the attribute location
         var coord = gl.getAttribLocation(shaderProgram, "coordinates");

         //point an attribute to the currently bound VBO
         gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);

         //Enable the attribute
         gl.enableVertexAttribArray(coord);

         /* Step5: Drawing the required object (triangle) */

         // Clear the canvas
         gl.clearColor(0.5, 0.5, 0.5, 0.9);

         // Enable the depth test
         gl.enable(gl.DEPTH_TEST); 
         
         // Clear the color buffer bit
         gl.clear(gl.COLOR_BUFFER_BIT);

         // Set the view port
         gl.viewport(0,0,canvas.width,canvas.height);

         // Draw the triangle
         //gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    
    
    
    
    
    
    
    
    var indices = [0,3,1] // Square
    
    var index_buffer = gl.createBuffer(); // Create a new buffer object    
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer); // Bind an empty array buffer to it
    
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    /* 
    
    Generally, for storing vertex data, we use Float32Array; and to store index data, we use Uint16Array.
    
    */
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); // Unbind the buffer
    
    
    
    
    
    
    /* Step 3: Create and compile Shader programs */

     // Vertex shader source code
     var vertCode =
        'attribute vec2 coordinates;' + 
        'void main(void) {' + ' gl_Position = vec4(coordinates,0.0, 1.0);' + '}';

     //Create a vertex shader object
     var vertShader = gl.createShader(gl.VERTEX_SHADER);

     //Attach vertex shader source code
     gl.shaderSource(vertShader, vertCode);

     //Compile the vertex shader
     gl.compileShader(vertShader);

     //Fragment shader source code
     var fragCode = 'void main(void) {' + 'gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);' + '}';

     // Create fragment shader object
     var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

     // Attach fragment shader source code
     gl.shaderSource(fragShader, fragCode);

     // Compile the fragment shader
     gl.compileShader(fragShader);

     // Create a shader program object to store combined shader program
     var shaderProgram = gl.createProgram();

     // Attach a vertex shader
     gl.attachShader(shaderProgram, vertShader); 

     // Attach a fragment shader
     gl.attachShader(shaderProgram, fragShader);

     // Link both programs
     gl.linkProgram(shaderProgram);

     // Use the combined shader program object
     gl.useProgram(shaderProgram);
    
    
    
    
    
    /* Step 4: Associate the shader programs to buffer objects */

         //Bind vertex buffer object
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

         //Get the attribute location
         var coord = gl.getAttribLocation(shaderProgram, "coordinates");

         //point an attribute to the currently bound VBO
         gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);

         //Enable the attribute
         gl.enableVertexAttribArray(coord);

         /* Step5: Drawing the required object (triangle) */

         // Clear the canvas
         gl.clearColor(0.5, 0.5, 0.5, 0.9);

         // Enable the depth test
         gl.enable(gl.DEPTH_TEST); 
         
         // Clear the color buffer bit
         gl.clear(gl.COLOR_BUFFER_BIT);

         // Set the view port
         gl.viewport(0,0,canvas.width,canvas.height);

         // Draw the triangle    
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    


}