import { Cell } from './cell.js';
import { startTimer, stopTimer, updateInfo } from './mazeInfo.js';

export let grid = [];
export let cols, rows;
export const cellSize = 20;

let wallsQueue = [];
let currentStep = 0;
export let complete = false;

export function index(i, j) {
  if (i < 0 || j < 0 || i >= cols || j >= rows) return -1;
  return i + j * cols;
}

export function generateMaze(p, width, height) {
  startTimer();
  let cnv = p.createCanvas(width, height);
  cnv.parent("canvas-container");
  p.frameRate(30);

  cols = p.floor(p.width / cellSize);
  rows = p.floor(p.height / cellSize);

  grid = [];
  wallsQueue = [];
  currentStep = 0;
  complete = false;

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let cell = new Cell(i, j, cellSize);
      // Remove all interior walls
      cell.walls = [false, false, false, false];
      // Add outer walls
      if (i === 0) cell.walls[3] = true;
      if (i === cols - 1) cell.walls[1] = true;
      if (j === 0) cell.walls[0] = true;
      if (j === rows - 1) cell.walls[2] = true;
      cell.visited = true;
      grid.push(cell);
    }
  }

  // Start recursive division
  divide(0, 0, cols, rows);
}

function divide(x, y, w, h) {
  if (w <= 1 && h <= 1) return;

  const horizontal = (w > h) ? false : (h > w) ? true : Math.random() < 0.5;

  if (horizontal && h >= 2) {
    const wallY = y + Math.floor(Math.random() * (h - 1));
    const passageX = x + Math.floor(Math.random() * w);

    
    for (let i = x; i < x + w; i++) {
      if (i !== passageX) {
        const topCell = grid[index(i, wallY)];
        const bottomCell = grid[index(i, wallY + 1)];
        wallsQueue.push({ type: 'horizontal', cells: [topCell, bottomCell] });
      }
    }

    divide(x, y, w, wallY - y + 1);
    divide(x, wallY + 1, w, y + h - wallY - 1);
  } else if (!horizontal && w >= 2) {
    const wallX = x + Math.floor(Math.random() * (w - 1));
    const passageY = y + Math.floor(Math.random() * h);

    
    for (let j = y; j < y + h; j++) {
      if (j !== passageY) {
        const leftCell = grid[index(wallX, j)];
        const rightCell = grid[index(wallX + 1, j)];
        wallsQueue.push({ type: 'vertical', cells: [leftCell, rightCell] });
      }
    }

    divide(x, y, wallX - x + 1, h);
    divide(wallX + 1, y, x + w - wallX - 1, h);
  }
}


//check code here- addition of controls
import { isPausedRef, getSpeed } from './pauseControl.js';

let lastStepTime = 0;

export function mazeDraw(p) {
  p.background(255);

  for (let cell of grid) {
    cell.show(p);
  }

  if (complete) {
    updateInfo({
      mode: 'generation',
      cols,
      rows,
      algorithm: "Recursive Division",
      complete
    });
    return;
  }

  if (isPausedRef.value) {
    updateInfo({
      mode: 'generation',
      cols,
      rows,
      algorithm: "Recursive Division",
      complete
    });
    return;
  }

  const now = p.millis();
  if (now - lastStepTime >= getSpeed()) {
    lastStepTime = now;

    if (currentStep < wallsQueue.length) {
      processWall(wallsQueue[currentStep]);
      currentStep++;
    } else {
      complete = true;
      stopTimer();
    }

    updateInfo({
      mode: 'generation',
      cols,
      rows,
      algorithm: "Recursive Division",
      complete
    });
  }
}


function processWall(wall) {
  if (wall.type === 'horizontal') {
    wall.cells[0].walls[2] = true; // Add bottom wall to top cell
    wall.cells[1].walls[0] = true; // Add top wall to bottom cell
  } else if (wall.type === 'vertical') {
    wall.cells[0].walls[1] = true; // Add right wall to left cell
    wall.cells[1].walls[3] = true; // Add left wall to right cell
  }
}

export function isComplete() {
  return complete;
}