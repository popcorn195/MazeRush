import { Cell } from './cell.js';
import { startTimer, stopTimer, updateInfo } from './mazeInfo.js';

export let grid = [];
export let cols, rows;
export const cellSize = 20;
let walls = [];
export let complete = false;

export function index(i, j) {
  if (i < 0 || j < 0 || i >= cols || j >= rows) return -1;
  return i + j * cols;
}

export function generateMaze(p, width, height) {
  startTimer();
  let cnv = p.createCanvas(width, height);
  cnv.parent("canvas-container");
  p.frameRate(60);

  cols = p.floor(p.width / cellSize);
  rows = p.floor(p.height / cellSize);
  
  grid = [];
  walls = [];
  complete = false;

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      grid.push(new Cell(i, j, cellSize));
    }
  }

  let startCell = grid[p.floor(p.random(grid.length))];
  startCell.visited = true;
  addWallsToList(startCell);
}


//check code- adding after controls
import { isPausedRef, getSpeed } from './pauseControl.js';

let lastStepTime = 0;

export function mazeDraw(p) {
  p.background(255);

  for (let cell of grid) {
    cell.show(p);
  }

  if (isPausedRef.value) return;  

  if (p.millis() - lastStepTime >= getSpeed()) {
    lastStepTime = p.millis();

    if (walls.length > 0) {
      let randIndex = p.floor(p.random(walls.length));
      let wall = walls[randIndex];
      let [cellA, cellB, direction] = wall;

      if (cellA.visited !== cellB.visited) {
        if (direction === "top") {
          cellA.walls[0] = false;
          cellB.walls[2] = false;
        } else if (direction === "right") {
          cellA.walls[1] = false;
          cellB.walls[3] = false;
        } else if (direction === "bottom") {
          cellA.walls[2] = false;
          cellB.walls[0] = false;
        } else if (direction === "left") {
          cellA.walls[3] = false;
          cellB.walls[1] = false;
        }

        let newCell = cellA.visited ? cellB : cellA;
        newCell.visited = true;

        newCell.highlight(p);

        addWallsToList(newCell);
      }

      walls.splice(randIndex, 1);
    } else if (!complete) {
      complete = true;
      stopTimer();
    }

    updateInfo({
      mode: 'generation',
      cols,
      rows,
      algorithm: "Prim's",
      complete
    });
  }
}


function addWallsToList(cell) {
  const i = cell.i;
  const j = cell.j;

  if (j > 0) {
    const top = grid[index(i, j - 1)];
    if (top && !top.visited) walls.push([cell, top, "top"]);
  }
  
  if (i < cols - 1) {
    const right = grid[index(i + 1, j)];
    if (right && !right.visited) walls.push([cell, right, "right"]);
  }
  
  if (j < rows - 1) {
    const bottom = grid[index(i, j + 1)];
    if (bottom && !bottom.visited) walls.push([cell, bottom, "bottom"]);
  }
  
  if (i > 0) {
    const left = grid[index(i - 1, j)];
    if (left && !left.visited) walls.push([cell, left, "left"]);
  }
}

export function isComplete() {
  return complete;
}