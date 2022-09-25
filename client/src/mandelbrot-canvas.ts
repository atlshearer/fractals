import { Application, Filter, Graphics } from "pixi.js";
import { MANDELBROT_SHADER } from "./shader";

export type MandelbrotCanvas = ReturnType<typeof mandelbrotCanvas>;

export function mandelbrotCanvas(app: Application) {
  const width = app.screen.width;
  const height = app.screen.height;

  const uniform = {
    scale: 2.0,
    centerX: 0.0,
    centerY: 0.0,
    aspect: width / height,
  };

  const filter = new Filter(MANDELBROT_SHADER.vert, MANDELBROT_SHADER.frag, uniform);

  filter.resolution = 0.5;

  const graphics = new Graphics();

  graphics.beginFill(0xffffff);
  graphics.drawRect(0, 0, width, height);
  graphics.endFill();

  graphics.filters = [filter];

  app.renderer.on('resize', (newWidth: number, newHeight: number) => {
    graphics.width = newWidth;
    graphics.height = newHeight;

    uniform.aspect = newWidth / newHeight;
  });

  return {
    graphics,
    updateZoom(zoomDelta: number, minZoom = 0.0005, maxZoom = 4) {
      uniform.scale *= zoomDelta;

      if (uniform.scale < minZoom) {
        uniform.scale = minZoom;
      }

      if (uniform.scale > maxZoom) {
        uniform.scale = maxZoom;
      }
    },
    updatePositionByPixels(deltaX: number, deltaY: number) {
      const { centerX, centerY, scale, aspect } = uniform;

      uniform.centerX = centerX + deltaX / width * scale * aspect;
      uniform.centerY = centerY + deltaY / height * scale;
    },
  }
}