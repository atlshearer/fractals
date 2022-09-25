import { Application, settings } from "pixi.js";
import { performActionOnDrag } from "./action-on-drag";
import { mandelbrotCanvas } from "./mandelbrot-canvas";

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
    const mandelbrot = mandelbrotCanvas(app);

    const { graphics } = mandelbrot;

    performActionOnDrag(app.stage, (deltaX, deltaY) => mandelbrot.updatePositionByPixels(deltaX, deltaY));

    addEventListener('wheel', (event) => {
      const { deltaY } = event;

      if (deltaY > 0) {
        mandelbrot.updateZoom(1.1);
      } else {
        mandelbrot.updateZoom(0.9);
      }
    });

    app.stage.addChild(graphics);
  }
}
