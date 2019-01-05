shaderSrc.drawTexVertex = `#version 300 es
    in vec4 aVertexPosition;
    out vec2 texCoord;

    void main() {
      gl_Position = aVertexPosition;
      texCoord = vec2(aVertexPosition.x/2.0+0.5,aVertexPosition.y/2.0+0.5);
    }
    `