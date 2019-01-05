var $ = document.querySelector.bind(document)


/**@type {HTMLCanvasElement} */
var cvs = document.getElementById('cvs')

/**@type {WebGL2RenderingContext} */
var gl
/**@type {WebGLSimulation} */
var sim

var width = 512
var height = 512


cvs.width = width
cvs.height = height

var animationframeid = 0


function initold() {

    gl = cvs.getContext('webgl2', { preserveDrawingBuffer: true })


    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    webGLSetup.gl = gl
    var ext = gl.getExtension('EXT_color_buffer_float')
    if (ext === null) {
        alert("Unable to initialize EXT_color_buffer_float. Your browser or machine may not support it.");
        return;
    }


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
    var buffers = { position: webGLSetup.createBuffer(new Float32Array(positions)) }

    var pixdata = new pixelArray(Float32Array, 0, { x: width, y: height }, 4)
    pixdata.rect(0, 0, width, height, [.8, 0, 0, 1])
    pixdata.rect(width / 2, height / 2, 5, 5, [.5, .5, 0, .5])

    var textures = {
        tex1: webGLSetup.createTexture(width, height, gl.TEXTURE0, pixdata.data),
        tex2: webGLSetup.createTexture(width, height, gl.TEXTURE1, undefined)
    }

    //create framebuffers so i can draw to the texture
    var framebuffers = {
        fb0: webGLSetup.createFramebuffer(textures.tex1, gl.TEXTURE0),
        fb1: webGLSetup.createFramebuffer(textures.tex2, gl.TEXTURE1),
    }
    //var programs = setupPrograms(buffers, textures)

    var programs = {
        mainProgram:
            webGLSetup.createProgram(
                {
                    vertex: shaderSrc.vertex,
                    frag: shaderSrc.frag,
                },
                [
                    'aVertexPosition',
                ],
                [
                    'tex',
                    'res',
                    'Da',
                    'Db',
                    'Feed',
                    'Kill',
                ]
            ),

        renderTex:
            webGLSetup.createProgram(
                {
                    vertex: shaderSrc.drawTexVertex,
                    frag: shaderSrc.drawTexFrag,
                },
                [
                    'aVertexPosition',
                ],
                [
                    'tex',
                ]),
    }
    window.programs = programs
    gl.useProgram(programs.mainProgram.program)
    webGLSetup.setAttribute(programs.mainProgram.attribLocations.aVertexPosition, buffers.position, gl.FLOAT, 2, 0, 0, false)

    gl.uniform2f(programs.mainProgram.uniformLocations.res, width, height)
    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programs.mainProgram.uniformLocations.tex, 0);


    gl.useProgram(programs.renderTex.program)
    webGLSetup.setAttribute(programs.renderTex.attribLocations.aVertexPosition, buffers.position, gl.FLOAT, 2, 0, 0, false)
    gl.uniform1i(programs.renderTex.uniformLocations.tex, 0);



    gl.useProgram(programs.mainProgram.program)
    var diffusionA = 1.0
    var diffusionB = 0.5
    var feedRatio = 0.055
    var killRatio = 0.062
    setParameters(diffusionA, diffusionB, feedRatio, killRatio)


    //setup sliders
    document.body.appendChild(webGLSetup.createUniformSlider(programs.mainProgram.uniformLocations.Feed, 0, 0.1, 0.001, 0.055))
    document.body.appendChild(webGLSetup.createUniformSlider(programs.mainProgram.uniformLocations.Kill, 0, 0.1, 0.001, 0.055))
    document.body.appendChild(webGLSetup.createUniformSlider(programs.mainProgram.uniformLocations.Da, 0, 2, 0.01, 1))
    document.body.appendChild(webGLSetup.createUniformSlider(programs.mainProgram.uniformLocations.Db, 0, 2, 0.01, 0.5))

    window.framebuffers = framebuffers


    function runSim() {

        gl.useProgram(programs.mainProgram.program)
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers.fb1)

            // Tell the shader we bound the texture to texture unit 1
            gl.uniform1i(programs.mainProgram.uniformLocations.tex, 0);

            // Draw the scene
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        }

        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers.fb0)

            // Tell the shader we bound the texture to texture unit 1
            gl.uniform1i(programs.mainProgram.uniformLocations.tex, 1);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        }
    }
    function frame(itterations) {
        for (let i = 0; i < itterations; i++) {
            runSim()
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, undefined)

        gl.useProgram(programs.renderTex.program);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.useProgram(programs.mainProgram.program)
    }
    window.frame = frame


    anmationframe()

    function anmationframe() {
        frame(100)
        animationframeid = requestAnimationFrame(anmationframe)
    }

    document.getElementById('resetbtn').addEventListener('click', function (e) {
        var pixdata = new pixelArray(Float32Array, 0, { x: width, y: height }, 4)
        pixdata.rect(0, 0, width, height, [.5, 0, 0, 1])
        pixdata.rect(width / 2, height / 2, 5, 5, [.5, .5, 0, 1])

        webGLSetup.setTexData(width, height, gl.TEXTURE0, pixdata.data)

    })


    function setParameters(Da, Db, Feed, Kill) {
        gl.uniform1f(programs.mainProgram.uniformLocations.Da, Da)
        gl.uniform1f(programs.mainProgram.uniformLocations.Db, Db)
        gl.uniform1f(programs.mainProgram.uniformLocations.Feed, Feed)
        gl.uniform1f(programs.mainProgram.uniformLocations.Kill, Kill)
    }
}

function initnew() {
    gl = cvs.getContext('webgl2', { preserveDrawingBuffer: true })


    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    sim = new WebGLSimulation(gl,
        {
            shaderSource: {
                vertex: shaderSrc.vertex,
                frag: shaderSrc.frag
            },
            attributes: [
                { name: 'aVertexPosition' }
            ],
            uniforms: [
                { name: 'tex', type: '1i', },
                { name: 'res', type: '1f', },
                { name: 'Da', type: '1f', },
                { name: 'Db', type: '1f', },
                { name: 'Feed', type: '1f', },
                { name: 'Kill', type: '1f', },
            ]
        },
        {
            shaderSource: {
                vertex: shaderSrc.drawTexVertex,
                frag: shaderSrc.drawTexFrag
            },
            attributes: [
                'aVertexPosition'
            ],
            uniforms: [
                'tex'
            ]
        }
    )

    var uniforms = {
        Da: 1.0,
        Db: 0.5,
        Feed: 0.055,
        Kill: 0.062,
    }
    sim.setUniforms(uniforms)


    var pixdata = new pixelArray(Float32Array, 0, { x: width, y: height }, 4)
    pixdata.rect(0, 0, width, height, [.8, 0, 0, 1])
    pixdata.rect(width / 2, height / 2, 5, 5, [.5, .5, 0, .5])

    sim.setTexData(pixdata.data)

    function anmationframe() {
        sim.runSim(10)
        sim.render()
        animationframeid = requestAnimationFrame(anmationframe)
    }

    anmationframe()
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



initnew()


function createGIF(itterations, step = 100) {
    var gif = new GIF({
        workers: 25,
        quality: 1,
        delay: 50,
        width: cvs.width,
        height: cvs.height,

    });
    gif.on('progress', p => {
        console.log(`progress: ${p * 100}%`)
    })

    gif.on('finished', function (blob) {

        var link = document.createElement('a')
        link.download = 'reaction.gif'
        link.href = URL.createObjectURL(blob)

        link.click()
    });

    function renderFrames(itterationsDone, step = 100, totalItterations) {
        if (itterationsDone < totalItterations) {
            frame(step)
            var image = new ImageData(width, height)
            var pixels = new Uint8Array(image.data.buffer, 0, image.data.length)

            gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
            gif.addFrame(image, { delay: 10000 / step, copy: true })
            console.log(`${Math.round(itterationsDone / totalItterations * 10000) / 100}%`)

            setTimeout(renderFrames, 0, itterationsDone + step, step, totalItterations)
        } else { gif.render() }
    }

    renderFrames(0, step, itterations)
    //gif.render()
}