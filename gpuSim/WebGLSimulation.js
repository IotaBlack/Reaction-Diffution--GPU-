/**
 * @typedef program
 * @property {WebGLProgram} program
 * @property {{}} attribLocations
 * @property {{}} attribTypes
 * @property {{}} uniformLocations
 * @property {{}} uniformTypes
 */

/**@param {WebGL2RenderingContext} gl */
function webGLSetupf(gl) {

    /** creates a program
      * @param {{vertex:string,frag:string}} shaderSource 
      * @param {{name:String,type:string}[]} attributes 
      * @param {{name:String,type:string}[]} uniforms 
      */
    this.createProgram = function (shaderSource, attributes = [], uniforms = []) {

        /**@type {WebGLProgram} */
        var shaderProgram = this.initShaderProgram(shaderSource.vertex, shaderSource.frag);
        gl.useProgram(shaderProgram)

        var program = {
            program: shaderProgram,
            attribLocations: {},
            attribTypes: {},
            uniformLocations: {},
            uniformTypes: {},
        }

        for (let i = 0; i < attributes.length; i++) {
            var attr = attributes[i];
            program.attribLocations[attr.name] = gl.getAttribLocation(shaderProgram, attr.name)
            program.attribTypes[attr.name] = attr.type
        }

        for (let i = 0; i < uniforms.length; i++) {
            var uniform = uniforms[i];
            program.uniformLocations[uniform.name] = gl.getUniformLocation(shaderProgram, uniform.name)
            program.uniformTypes[uniform.name] = uniform.type
        }
        return program
    }

    /** Initialize a shader program
     * @param {String} vsSource
     * @param {String} fsSource
     */
    this.initShaderProgram = function (vsSource, fsSource) {
        var vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
        var fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    /** creates a shader of the given type, uploads the source and compiles it.
     * @param {GLenum} type
     * @param {String} source
     */
    this.loadShader = function (type, source) {
        var shader = gl.createShader(type);

        // Send the source to the shader object

        gl.shaderSource(shader, source);

        // Compile the shader program

        gl.compileShader(shader);

        // See if it compiled successfully

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    /** create a buffer
     *  @param {*} data
     */
    this.createBuffer = function (data) {
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            data,
            gl.STATIC_DRAW);
        return buffer
    }

    /** create a texture
     * @param {Number} width 
     * @param {Number} height 
     * @param {GLenum} texUnit TextureUnit to add the texture to
     * @param {ArrayBufferView} texData raw data to be put in texture
     */
    this.createTexture = function (width, height, texUnit, texData) {

        var targetTexture = gl.createTexture();

        // Tell WebGL we want to affect texture unit texUnit
        gl.activeTexture(texUnit);
        // Bind texture to texUnit
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);

        var internalFormat = gl.RGBA32F;
        var format = gl.RGBA;
        var type = gl.FLOAT;
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat,
            width, height, 0,
            format, type, texData);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        return targetTexture
    }

    /** create framebuffer
     * @param {WebGLTexture} tex
     * @param {GLenum} texUnit
     */
    this.createFramebuffer = function (tex, texUnit) {
        // Create and bind the framebuffer
        var fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

        gl.activeTexture(texUnit)
        gl.bindTexture(gl.TEXTURE_2D, tex)

        // attach the texture as the first color attachment
        var attachmentPoint = gl.COLOR_ATTACHMENT0;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, tex, 0);


        return fb
    }

    /** set tex data
     * @param {Number} width 
     * @param {Number} height 
     * @param {GLenum} texUnit TextureUnit to to edit
     * @param {ArrayBufferView} texData raw data to be put in texture
     */
    this.setTexData = function (width, height, texUnit, texData) {
        gl.activeTexture(texUnit);

        var internalFormat = gl.RGBA;
        var format = gl.RGBA;
        var type = gl.FLOAT;
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat,
            width, height, 0,
            format, type, texData);
    }

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
    this.setAttribute = function (attribLocation, buffer, type, numComponents = 2, stride = 0, offset = 0, normalize = false) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(
            attribLocation,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(attribLocation);
    }

}







class WebGLSimulation {
    //width
    //height

    /**@type {program} */
    //simProgram
    /**@type {program} */
    //renderProgram
    //dataTextures


    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {{shaderSource:{vertex:string,frag:string},attributes:string[],uniforms:string[]}} SimProgParams
     * @param {{shaderSource:{vertex:string,frag:string},attributes:string[],uniforms:string[]}} RenderProgParams
     */
    constructor(gl, SimProgParams, RenderProgParams) {
        this.gl = gl
        var glsetup = new webGLSetupf(gl)

        this.width = this.gl.canvas.width;
        this.height = this.gl.canvas.height;


        var ext = gl.getExtension('EXT_color_buffer_float');
        if (ext === null) {
            alert("Unable to initialize EXT_color_buffer_float. Your browser or machine may not support it.");
            return;
        }

        ext = gl.getExtension('OES_texture_float_linear')

        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT);

        var positions = [
            -1.0, 1.0,
            1.0, 1.0,
            -1.0, -1.0,
            1.0, -1.0,
        ];


        // Here's where we call the routine that builds all the
        // objects we'll be drawing.
        var buffers = { position: glsetup.createBuffer(new Float32Array(positions)) };
        this.dataTextures = {
            tex1: glsetup.createTexture(width, height, gl.TEXTURE0, undefined),
            tex2: glsetup.createTexture(width, height, gl.TEXTURE1, undefined)
        };
        //create framebuffers so i can draw to the texture
        this.framebuffers = {
            fb0: glsetup.createFramebuffer(this.dataTextures.tex1, gl.TEXTURE0),
            fb1: glsetup.createFramebuffer(this.dataTextures.tex2, gl.TEXTURE1),
        };

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers.fb0)
        var status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER)
        if (status != this.gl.FRAMEBUFFER_COMPLETE) { debugger }
        //create programs to use for simulation


        this.simProgram = glsetup.createProgram(
            SimProgParams.shaderSource,
            SimProgParams.attributes,
            SimProgParams.uniforms)

        this.renderProgram = glsetup.createProgram(
            RenderProgParams.shaderSource,
            RenderProgParams.attributes,
            RenderProgParams.uniforms)

        this.gl.useProgram(this.simProgram.program)
        this.setAttribute(this.simProgram.attribLocations.VertexPosition, buffers.position, gl.FLOAT, 2)

        this.gl.uniform2f(this.simProgram.uniformLocations.res, this.width, this.height)
        // Tell the shader we bound the texture to texture unit 0
        this.gl.uniform1i(this.simProgram.uniformLocations.simTex, 0);

        this.gl.useProgram(this.renderProgram.program)
        this.setAttribute(this.renderProgram.attribLocations.VertexPosition, buffers.position, gl.FLOAT, 2)

        // Tell the shader we bound the texture to texture unit 0
        this.gl.uniform1i(this.renderProgram.uniformLocations.simTex, 0);

    }

    setSimulationProgram(prog) {
        this.simProgram = prog
    }

    setRenderProgram(prog) {
        this.renderProgram = prog
    }

    /** set tex data
     * @param {ArrayBufferView} texData raw data to be put in texture
     */
    setTexData(texData) {
        this.gl.activeTexture(this.gl.TEXTURE0);


        var internalFormat = this.gl.RGBA32F;
        var format = this.gl.RGBA;
        var type = this.gl.FLOAT;
        this.gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat,
            this.width, this.height, 0,
            format, type, texData);
    }

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
    setAttribute(attribLocation, buffer, type, numComponents = 2, stride = 0, offset = 0, normalize = false) {
        this.gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        this.gl.vertexAttribPointer(
            attribLocation,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        this.gl.enableVertexAttribArray(attribLocation);
    }


    /** create a uniform slider control
     * @param {WebGLUniformLocation} uniform 
     * @param {Number} min 
     * @param {Number} max 
     * @param {Number} step 
     * @param {Number} val 
     */
    createUniformSlider(uniform, min, max, step, val) {
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

    runSim(n) {

        this.gl.useProgram(this.simProgram.program)
        for (let i = 0; i < n; i++) {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers.fb1)
            this.gl.uniform1i(this.simProgram.uniformLocations.tex, 0)
            this.gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

            var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
            if (status != gl.FRAMEBUFFER_COMPLETE) { debugger }

            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers.fb0)
            this.gl.uniform1i(this.simProgram.uniformLocations.tex, 1)
            this.gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

            status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
            if (status != gl.FRAMEBUFFER_COMPLETE) { debugger }
        }
    }

    step(n) {
        for (let i = 0; i < n; i++) {
            this.runSim()
        }
    }

    /**
     * @param {{}} uniformValues 
     */
    setUniforms(uniformValues) {
        this.gl.useProgram(this.simProgram.program)
        for (const key in uniformValues) {
            if (uniformValues.hasOwnProperty(key)) {
                const value = uniformValues[key];
                this.gl['uniform' + this.simProgram.uniformTypes[key]](this.simProgram.uniformLocations[key], value)
            }
        }
    }

    render() {
        this.gl.bindFramebuffer(gl.FRAMEBUFFER, undefined)

        this.gl.useProgram(this.renderProgram.program)
        this.gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    }
}

/**
 * @param {Constructor} type 
 * @param {Number} val 
 * @param {{x,y}} size 
 * @param {Number} pixSize 
 */
function pixelArray(type, val, size, pixSize) {
    this.width = size.x
    this.height = size.y
    this.pixSize = pixSize
    this.data = new type(size.x * size.y * pixSize)
    for (let i = 0; i < this.data.length; i++) {
        this.data[i] = val
    }
}

pixelArray.prototype.rect = function (x, y, w, h, val) {
    for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {
            let index = ((y + j) * this.width + (x + i)) * this.pixSize
            for (let k = 0; k < this.pixSize; k++) {
                this.data[index + k] = val[k]
            }
        }

    }
}