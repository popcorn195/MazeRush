//cleared
import { Cell } from './cell.js';
import { startTimer, stopTimer, updateInfo } from './mazeInfo.js';
import { isPausedRef, getSpeed } from './pauseControl.js';

export let grid = [];
export let cols, rows;
export const cellSize = 20;
let p;
let frontier = [];
export let complete = false;
let lastStepTime = 0;

export function index(i, j) {
  if (i < 0 || j < 0 || i >= cols || j >= rows) return -1;
  return i + j * cols;
}

export function generateMaze(p5, width, height, containerId) {
  startTimer();
  p = p5;
  let cnv = p.createCanvas(width, height);
  cnv.parent(containerId);
  p.frameRate(60);

  cols = p.floor(p.width / cellSize);
  rows = p.floor(p.height / cellSize);
  
  // Reset variables
  grid = [];
  frontier = [];
  complete = false;

  // Initialize grid with unified Cell class
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      grid.push(new Cell(i, j, cellSize));
    }
  }

  // Start with a random cell
  let startCell = grid[p.floor(p.random(grid.length))];
  startCell.visited = true;
  addFrontier(startCell);
  startCell.highlight(p);

  lastStepTime = -Infinity; 
}


export function mazeDraw(p) {
  p.background(255);

  for (let cell of grid) {
    cell.show(p);
  }

  if (isPausedRef.value || complete) return;

  if (p.millis() - lastStepTime >= getSpeed()) {
    lastStepTime = p.millis();

    if (frontier.length > 0) {
      let randIndex = p.floor(p.random(frontier.length));
      let current = frontier[randIndex];
      let neighbors = getVisitedNeighbors(current);

      if (neighbors.length > 0) {
        let neighbor = p.random(neighbors);
        removeWall(current, neighbor);
      }

      current.visited = true;
      current.highlight(p);
      addFrontier(current);
      frontier.splice(randIndex, 1);
    } else {
      complete = true;
      stopTimer();
    }

    updateInfo({
      mode: 'generation',
      cols,
      rows,
      algorithm: "Prim's (Optimized)",
      complete
    });
  }
}

function addFrontier(cell) {
  const { i, j } = cell;
  const dirs = [
    [0, -1], [1, 0], [0, 1], [-1, 0]
  ];

  for (let [dx, dy] of dirs) {
    let ni = i + dx;
    let nj = j + dy;
    let neighbor = grid[index(ni, nj)];
    if (neighbor && !neighbor.visited && !frontier.includes(neighbor)) {
      frontier.push(neighbor);
    }
  }
}

function getVisitedNeighbors(cell) {
  const { i, j } = cell;
  const neighbors = [];
  const dirs = [
    [0, -1], [1, 0], [0, 1], [-1, 0]
  ];

  for (let [dx, dy] of dirs) {
    let ni = i + dx;
    let nj = j + dy;
    let neighbor = grid[index(ni, nj)];
    if (neighbor && neighbor.visited) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

function removeWall(a, b) {
  let dx = b.i - a.i;
  let dy = b.j - a.j;

  if (dx === 1) {
    a.walls[1] = false;
    b.walls[3] = false;
  } else if (dx === -1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (dy === 1) {
    a.walls[2] = false;
    b.walls[0] = false;
  } else if (dy === -1) {
    a.walls[0] = false;
    b.walls[2] = false;
  }
}

export function isComplete() {
  return complete;
}

export function getContext() {
  return {
    grid,
    cellSize,
    cols,
    rows,
    p,
    index
  };
}