
var webGLSetup = {
    /**@type {WebGL2RenderingContext} */
    gl: {},


    /** creates a program
      * @param {{vertex:string,frag:string}} shaderSource 
      * @param {string[]} attributes 
      * @param {string[]} uniforms 
      */
    createProgram: function (shaderSource, attributes = [], uniforms = []) {

        var shaderProgram = this.initShaderProgram(shaderSource.vertex, shaderSource.frag);
        this.gl.useProgram(shaderProgram)

        var program = {
            program: shaderProgram,
            attribLocations: {},
            uniformLocations: {},
        }

        for (let i = 0; i < attributes.length; i++) {
            var attrName = attributes[i];
            program.attribLocations[attrName] = this.gl.getAttribLocation(shaderProgram, attrName)
        }

        for (let i = 0; i < uniforms.length; i++) {
            var uniformName = uniforms[i];
            program.uniformLocations[uniformName] = this.gl.getUniformLocation(shaderProgram, uniformName)
        }
        return program
    },

    /** Initialize a shader program
     * @param {String} vsSource
     * @param {String} fsSource
     */
    initShaderProgram: function (vsSource, fsSource) {
        var vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
        var fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program

        var shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert

        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    },

    /** creates a shader of the given type, uploads the source and compiles it.
     * @param {GLenum} type
     * @param {String} source
     */
    loadShader: function (type, source) {
        var shader = this.gl.createShader(type);

        // Send the source to the shader object

        this.gl.shaderSource(shader, source);

        // Compile the shader program

        this.gl.compileShader(shader);

        // See if it compiled successfully

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    },

    /** create a buffer
     *  @param {*} data
     */
    createBuffer: function (data) {
        var buffer = this.gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(gl.ARRAY_BUFFER,
            data,
            this.gl.STATIC_DRAW);
        return buffer
    },

    /** create a texture
     * @param {Number} width 
     * @param {Number} height 
     * @param {GLenum} texUnit TextureUnit to add the texture to
     * @param {ArrayBufferView} texData raw data to be put in texture
     */
    createTexture: function (width, height, texUnit, texData) {

        var targetTexture = this.gl.createTexture();

        // Tell WebGL we want to affect texture unit texUnit
        this.gl.activeTexture(texUnit);
        // Bind texture to texUnit
        this.gl.bindTexture(gl.TEXTURE_2D, targetTexture);

        var internalFormat = this.gl.RGBA32F;
        var format = this.gl.RGBA;
        var type = this.gl.FLOAT;
        this.gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat,
            width, height, 0,
            format, type, texData);

        this.gl.texParameteri(gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);

        return targetTexture
    },

    /** create framebuffer
     * @param {WebGLTexture} tex
     * @param {GLenum} texUnit
     */
    createFramebuffer: function (tex, texUnit) {
        // Create and bind the framebuffer
        var fb = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb);

        this.gl.activeTexture(texUnit)
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex)

        // attach the texture as the first color attachment
        var attachmentPoint = this.gl.COLOR_ATTACHMENT0;
        this.gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, this.gl.TEXTURE_2D, tex, 0);
        return fb
    },

    /** set tex data
     * @param {Number} width 
     * @param {Number} height 
     * @param {GLenum} texUnit TextureUnit to to edit
     * @param {ArrayBufferView} texData raw data to be put in texture
     */
    setTexData: function (width, height, texUnit, texData) {
        this.gl.activeTexture(texUnit);

        var internalFormat = this.gl.RGBA;
        var format = this.gl.RGBA;
        var type = this.gl.FLOAT;
        this.gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat,
            width, height, 0,
            format, type, texData);
    },

    /** set attribute
     * @param {*} attribLocation 
     * @param {WebGLBuffer} buffer 
     * @param {GLenum} type type of data in buffer
     * @param {Number} numComponents pull out values to pull out per iteration
     * @param {Number} stride how many bytes to get from one set of values to the next.
     * 0 = use type and numComponents above
     * @param {Number} offset byte offset
     * @param {Boolean} normalize 
     */
    setAttribute: function (attribLocation, buffer, type, numComponents = 2, stride = 0, offset = 0, normalize = false) {
        this.gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        this.gl.vertexAttribPointer(
            attribLocation,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        this.gl.enableVertexAttribArray(attribLocation);
    },

    /** create a uniform slider control
     * @param {WebGLUniformLocation} uniform 
     * @param {Number} min 
     * @param {Number} max 
     * @param {Number} step 
     * @param {Number} val 
     */
    createUniformSlider: function (uniform, min, max, step, val) {
        var slider = document.createElement('input')
        slider.type = 'range'
        slider.min = min
        slider.max = max
        slider.step = step
        slider.value = val

        slider.addEventListener('change', e => {
            this.gl.uniform1f(uniform, parseFloat(slider.value))
        })
        return slider
    }

}




