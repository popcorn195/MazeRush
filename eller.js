//cleared
import { Cell } from './cell.js';
import { startTimer, stopTimer, updateInfo } from './mazeInfo.js';
import { isPausedRef, getSpeed } from './pauseControl.js'; 

export let grid = [];
export let cols, rows;
export const cellSize = 20;
let p;

let currentRow = 0;
let sets = [];
export let complete = false;
let lastStepTime = 0; 

export function index(i, j) {
  if (i < 0 || j < 0 || i >= cols || j >= rows) return -1;
  return i + j * cols;
}

export function generateMaze(p5, width, height,containerId) {
  startTimer();
  p= p5;
  let cnv = p.createCanvas( width, height);
  cnv.parent(containerId);
  p.frameRate(10);

  cols = p.floor(p.width / cellSize);
  rows = p.floor(p.height / cellSize);

  grid = [];
  currentRow = 0;
  sets = [];
  complete = false;
  lastStepTime = 0;

  for (let i = 0; i < cols; i++) {
    let id = i;
    let cell = new Cell(i, 0, cellSize);
    cell.set = id;
    grid.push(cell);
    sets[i] = id;
  }

  horizontalConnections(p, 0);
}

export function mazeDraw(p) {
  if (grid.length === 0) return;

  p.background(255);
  for (let cell of grid) {
    cell.show(p);
  }

  if (complete || isPausedRef.value) return;

  if (p.millis() - lastStepTime >= getSpeed()) {
    lastStepTime = p.millis();

    if (currentRow < rows - 1) {
      generateNextRow(p);
      currentRow++;
    } else if (currentRow === rows - 1) {
      finalizeLastRow(p);
      complete = true;
      stopTimer(); 
    }
      updateInfo({
        mode: 'generation',
        cols,
        rows,
        algorithm: "Eller's",
        complete
      });
      // currentRow++; 
      // return; 
    }

    // console.log("Current row:", currentRow, "Complete:", complete);

    // if (!complete) {
    //   updateInfo({
    //     mode: 'generation',
    //     cols,
    //     rows,
    //     algorithm: "Eller's",
    //     complete
    //   });
  }
  


function generateNextRow(p) {
  let newRow = [];
  let newSets = [];
  let setToIndices = {};

  for (let i = 0; i < cols; i++) {
    const above = grid[index(i, currentRow)];
    if (!setToIndices[above.set]) setToIndices[above.set] = [];
    setToIndices[above.set].push(i);
  }

  for (let set in setToIndices) {
    const indices = p.shuffle(setToIndices[set].slice(), true);
    let kept = false;

    for (let i of indices) {
      let down = p.random() < 0.5 || !kept;
      if (down) {
        const cell = new Cell(i, currentRow + 1, cellSize);
        const above = grid[index(i, currentRow)];

        cell.set = above.set;
        above.walls[2] = false;  // remove bottom of above
        cell.walls[0] = false;   // remove top of new cell

        newRow[i] = cell;
        newSets[i] = above.set;
        kept = true;
      }
    }
  }

  for (let i = 0; i < cols; i++) {
    if (!newRow[i]) {
      const cell = new Cell(i, currentRow + 1, cellSize);
      cell.set = Math.floor(p.random(1000000));
      newRow[i] = cell;
      newSets[i] = cell.set;
    }
  }

  sets = newSets;
  grid.push(...newRow);
  horizontalConnections(p, currentRow + 1);
}

function horizontalConnections(p, row) {
  for (let i = 0; i < cols - 1; i++) {
    const curr = grid[index(i, row)];
    const next = grid[index(i + 1, row)];

    if (curr.set !== next.set && p.random() < 0.5) {
      curr.walls[1] = false;
      next.walls[3] = false;

      const oldSet = next.set;
      for (let j = 0; j < cols; j++) {
        const cell = grid[index(j, row)];
        if (cell.set === oldSet) cell.set = curr.set;
      }
    }
  }
}

function finalizeLastRow() {
  for (let i = 0; i < cols - 1; i++) {
    let curr = grid[(rows - 1) * cols + i];
    let next = grid[(rows - 1) * cols + i + 1];

    if (curr.set !== next.set) {
      curr.walls[1] = false; // right
      next.walls[3] = false; // left

      let oldSet = next.set;
      for (let j = 0; j < cols; j++) {
        let c = grid[(rows - 1) * cols + j];
        if (c.set === oldSet) c.set = curr.set;
      }
    }
  }

  for (let i = 0; i < cols; i++) {
    let cell = grid[(rows - 1) * cols + i];
    cell.walls[2] = false;
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