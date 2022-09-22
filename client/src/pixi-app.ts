import { Application, Container, settings, Sprite } from "pixi.js";

export const setupPixi = () => {
  settings.RESOLUTION = window.devicePixelRatio;

  const app = new Application({
    resizeTo: document.body,
    autoDensity: true,
    backgroundColor: 0xff0000,
  });

  document.body.appendChild(app.view);


  const scaleContainer = new Container();
  app.stage.addChild(scaleContainer);

  const horizontalSize = Math.ceil(app.renderer.width / window.devicePixelRatio / 250);
  const verticalSize = Math.ceil(app.renderer.height / window.devicePixelRatio / 250);

  const scale = 0.00002;
  let centerX = -0.591;
  let centerY = 0.61708;

  const tileContainer = new Container();
  scaleContainer.addChild(tileContainer);

  scaleContainer.scale.set(1 / scale / 2);

  const addTiles = (x: number, y: number) => {
    console.log("addTiles", x, y);

    tileContainer.removeChildren();

    tileContainer.x = -x * 125;
    tileContainer.y = y * 125;

    for (let i = -horizontalSize; i <= horizontalSize; i++) {
      for (let j = -verticalSize; j <= verticalSize; j++) {
        const xPosition = x + i * scale * 2;
        const yPosition = y + j * scale * 2;

        const sprite = Sprite.from(getMandelbrot(xPosition, yPosition, scale));

        sprite.x = xPosition * 125;
        sprite.y = - yPosition * 125;
        sprite.anchor.set(0.5);
        sprite.scale.set(scale);
        tileContainer.addChild(sprite);
      }
    }
  }

  addTiles(centerX, centerY);


  let dragging = false;
  let initialX = 0;
  let initialY = 0;
  let deltaX = 0;
  let deltaY = 0;

  scaleContainer.interactive = true;
  scaleContainer.on('mousedown', (event) => {
    const { x, y } = event.data.global;

    dragging = true;
    initialX = x;
    initialY = y;
  });
  scaleContainer.on('mouseup', () => {
    dragging = false;

    centerX = centerX + deltaX * scale * 2 / 125;
    centerY = centerY - deltaY * scale * 2 / 125;

    addTiles(centerX, centerY);
  });
  scaleContainer.on('mousemove', (event) => {
    const { x, y } = event.data.global;

    if (dragging) {
      deltaX = initialX - x;
      deltaY = initialY - y;

      tileContainer.x = (-centerX - deltaX * scale * 2 / 125) * 125;
      tileContainer.y = (centerY - deltaY * scale * 2 / 125) * 125;
    }
  });


  app.renderer.on('resize', () => {
    centerContainer(scaleContainer, app);
  });

  centerContainer(scaleContainer, app);
}

const centerContainer = (container: Container, app: Application) => {
  container.x = app.renderer.width / window.devicePixelRatio / 2;
  container.y = app.renderer.height / window.devicePixelRatio / 2;
}

const getMandelbrot = (x: number, y: number, scale: number) => {
  return `http://10.1.1.60:8000/mandelbrot?x=${x}&y=${y}&scale=${scale}`;
}
