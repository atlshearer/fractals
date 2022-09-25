import { Container } from "pixi.js";

export const performActionOnDrag = (target: Container, action: (deltaX: number, deltaY: number) => void) => {
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let deltaX = 0;
  let deltaY = 0;

  target.interactive = true;
  target.on('mousedown', (event) => {
    const { x, y } = event.data.global;

    dragging = true;
    lastX = x;
    lastY = y;
  });
  target.on('mouseup', () => {
    dragging = false;
  });
  target.on('mousemove', (event) => {
    const { x, y } = event.data.global;

    if (dragging) {
      deltaX = lastX - x;
      deltaY = lastY - y;

      lastX = x;
      lastY = y;

      action(deltaX, deltaY);
    }
  });
};