shaderSrc.frag = `#version 300 es
  precision highp float;
  out vec4 FragColor;


  in vec2 texCoord;
  uniform sampler2D tex;
  uniform vec2 res;

  uniform float Da;
  uniform float Db;
  uniform float Feed;
  uniform float Kill;

  //void main() {
  //  gl_FragColor = vec4(texture(tex,texCoord).xyz/10.0,1);
  //} 

  float Lapa(vec4 arr[9]) {
  	float sum = 0.0;

	  sum = sum + (arr[4].r * -1.0);
	  sum = sum + (arr[5].r * 0.2);
	  sum = sum + (arr[3].r * 0.2);
	  sum = sum + (arr[7].r * 0.2);
	  sum = sum + (arr[1].r * 0.2);
	  sum = sum + (arr[0].r * 0.05);
	  sum = sum + (arr[2].r * 0.05);
	  sum = sum + (arr[6].r * 0.05);
	  sum = sum + (arr[8].r * 0.05);
	  sum = floor(sum * 1000000.0) / 1000000.0;
	  return sum;
  }

  float Lapb(vec4 arr[9]) {
	  float sum = 0.0;

	  sum = sum + (arr[4].g * -1.0);
	  sum = sum + (arr[5].g * 0.2);
	  sum = sum + (arr[3].g * 0.2);
	  sum = sum + (arr[7].g * 0.2);
	  sum = sum + (arr[1].g * 0.2);
	  sum = sum + (arr[0].g * 0.05);
	  sum = sum + (arr[2].g * 0.05);
	  sum = sum + (arr[6].g * 0.05);
	  sum = sum + (arr[8].g * 0.05);
	  sum = floor(sum * 1000000.0) / 1000000.0;
	  return sum;
  }

  void main() {
    vec2 onePixel = vec2(1.0, 1.0) / res;

    vec4 values[9];
      values[0] = texture(tex, texCoord + onePixel * vec2(-1, -1));
      values[1] = texture(tex, texCoord + onePixel * vec2( 0, -1));
      values[2] = texture(tex, texCoord + onePixel * vec2( 1, -1));
      values[3] = texture(tex, texCoord + onePixel * vec2(-1,  0));
      values[4] = texture(tex, texCoord + onePixel * vec2( 0,  0));
      values[5] = texture(tex, texCoord + onePixel * vec2( 1,  0));
      values[6] = texture(tex, texCoord + onePixel * vec2(-1,  1));
      values[7] = texture(tex, texCoord + onePixel * vec2( 0,  1));
      values[8] = texture(tex, texCoord + onePixel * vec2( 1,  1));


    float a = texelFetch(tex,ivec2(gl_FragCoord.x,gl_FragCoord.y),0).r;
    float b = texelFetch(tex,ivec2(gl_FragCoord.x,gl_FragCoord.y),0).g;
    float abb = a*b*b;
    float na = a + ((Da*Lapa(values)) - abb + ( Feed         * (1.0 - a)));
    float nb = b + ((Db*Lapb(values)) + abb - ((Kill + Feed) * b));
 
    //FragColor = vec4((colorSum / 9.0).rgb, 1.0);
    FragColor = vec4(na,nb,0,1);
}


`