shaderSrc.drawTexFrag = `#version 300 es
    precision highp float;
    out vec4 FragColor;

    in vec2 texCoord;
    uniform sampler2D tex;

    vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

    void main() {
      //FragColor = vec4(texture(tex,texCoord).rgb,1);
      //FragColor = vec4(hsv2rgb(vec3(texture(tex,texCoord).r,1,1)),1);
      FragColor = vec4(hsv2rgb(vec3(texelFetch(tex,ivec2(gl_FragCoord.x,gl_FragCoord.y),0).r,1,1)),1);
    }
  `