import { Application, Filter, Graphics, settings } from "pixi.js";

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

export const setupPixi = () => {
  settings.RESOLUTION = window.devicePixelRatio;

  const app = new Application({
    resizeTo: document.body,
    autoDensity: true,
    backgroundColor: 0xaaaaaa,
  });

  document.body.appendChild(app.view);

  app.loader.load(startup);

  function startup() {
    const width = app.screen.width;
    const height = app.screen.height;

    const uniform = {
      scale: 2.0,
      centerX: 0.0,
      centerY: 0.0,
      aspect: width / height,
    };

    const filter = new Filter(VERT_SRC, FRAG_SRC, uniform);

    filter.resolution = 0.5;

    const graphics = new Graphics();

    graphics.beginFill(0xffffff);
    graphics.drawRect(0, 0, width, height);
    graphics.endFill();

    graphics.filters = [filter];

    let dragging = false;
    let initialX = 0;
    let initialY = 0;
    let deltaX = 0;
    let deltaY = 0;
    let initialCenterX = 0;
    let initialCenterY = 0;

    graphics.interactive = true;
    graphics.on('mousedown', (event) => {
      const { x, y } = event.data.global;

      dragging = true;
      initialX = x;
      initialY = y;
      initialCenterX = uniform.centerX;
      initialCenterY = uniform.centerY;
    });
    graphics.on('mouseup', () => {
      dragging = false;
      console.log(uniform.centerX, uniform.centerY);
    });
    graphics.on('mousemove', (event) => {
      const { x, y } = event.data.global;

      if (dragging) {
        deltaX = initialX - x;
        deltaY = initialY - y;

        uniform.centerX = initialCenterX + deltaX / width * uniform.scale * uniform.aspect;
        uniform.centerY = initialCenterY + deltaY / height * uniform.scale;
      }
    });

    const MIN_SCALE = 0.000001;

    addEventListener('wheel', (event) => {
      const { deltaY } = event;
      
      if (deltaY > 0) {
        uniform.scale *= 1.1;
      } else {
        uniform.scale /= 1.1;
      }

      
      if (uniform.scale < MIN_SCALE) {
        uniform.scale = MIN_SCALE;
      }

      console.log(uniform.scale);
    });

    app.stage.addChild(graphics);
  }
}
