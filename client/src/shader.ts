
const VERT_SRC = `
#version 300 es
precision mediump float;

in vec2 aVertexPosition;

uniform mat3 projectionMatrix;

out vec2 vTextureCoord;
out vec2 vFilterCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;
 
vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.0f)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0f)).xy, 0.0f, 1.0f);
}
 
vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
    vFilterCoord = vTextureCoord * inputSize.xy / outputFrame.zw;
}
`

const FRAG_SRC = `
#version 300 es
precision mediump float;

in vec2 vTextureCoord;
in vec2 vFilterCoord;
out vec4 fragColor;

uniform float centerX;
uniform float centerY;
uniform float aspect;
uniform float scale;

#define MAX_ITERATIONS 255

int get_iterations()
{
    float real = (vFilterCoord.x - 0.5f) * scale * aspect + centerX;
    float imag = (vFilterCoord.y - 0.5f) * scale + centerY;
 
    int iterations = 0;
    float const_real = real;
    float const_imag = imag;
 
    for (int j = 0; j < MAX_ITERATIONS; j += 1)
    {
        float tmp_real = real;
        real = (real * real - imag * imag) + const_real;
        imag = (2.0 * tmp_real * imag) + const_imag;
         
        float dist = real * real + imag * imag;
         
        if (dist > 4.0)
          break;
 
        ++iterations;
    }

    return iterations;
}
 
vec4 return_color()
{
    int iter = get_iterations();
 
    float iterations = float(iter) / float(MAX_ITERATIONS);    
    return vec4(iterations, iterations, iterations, 1.0);
}
 
void main()
{
    fragColor = return_color();
}`;

export const MANDELBROT_SHADER = {
  vert: VERT_SRC,
  frag: FRAG_SRC,
}